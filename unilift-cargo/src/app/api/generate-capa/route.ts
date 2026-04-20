import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { generateWithRetry } from '@/lib/gemini';

async function fetchImageParts(incidentId: number) {
  try {
    const supabase = await createClient();
    const { data: images } = await supabase
      .from('images')
      .select('image_url')
      .eq('incident_analysis_id', incidentId);

    if (!images || images.length === 0) return [];
    const MAX_IMAGES = 3;
    const imagesToFetch = images.slice(0, MAX_IMAGES);

    const MAX_IMAGE_BYTES = 1 * 1024 * 1024; // 1 MB per image
    const parts = await Promise.all(
      imagesToFetch.map(async (img) => {
        try {
          const res = await fetch(img.image_url);
          if (!res.ok) return null;
          const buffer = await res.arrayBuffer();
          if (buffer.byteLength > MAX_IMAGE_BYTES) return null; // skip large images
          const mimeType = (res.headers.get('content-type') || 'image/jpeg').split(';')[0];
          return {
            inlineData: {
              mimeType,
              data: Buffer.from(buffer).toString('base64')
            }
          };
        } catch {
          return null;
        }
      })
    );

    return parts.filter(Boolean) as { inlineData: { mimeType: string; data: string } }[];
  } catch {
    return [];
  }
}

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const incidentData = await req.json();

    if (!incidentData) {
      return NextResponse.json(
        { success: false, error: 'Incident data is required' },
        { status: 400 }
      );
    }

    const prompt = constructCapaPrompt(incidentData);

    const imageParts = incidentData.id ? await fetchImageParts(incidentData.id) : [];

    const contentParts = [
      ...imageParts,
      { text: prompt }
    ];

    const result = await generateWithRetry(
      { contents: [{ role: 'user', parts: contentParts }] },
      { responseMimeType: 'application/json', temperature: 0.4 }
    );

    const responseText = result.response.text().trim();

    if (!responseText) {
      throw new Error('Empty response from Gemini');
    }

    const capaResponse = JSON.parse(responseText);

    if (!capaResponse.corrective || !capaResponse.preventive || !capaResponse.immediate_cause) {
      throw new Error('Invalid CAPA response format');
    }

    return NextResponse.json({
      success: true,
      message: 'CAPA recommendations generated successfully',
      data: capaResponse
    });
  } catch (error) {
    console.error('Error generating CAPA recommendations:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to parse Gemini response',
          message: 'The AI generated an invalid response format'
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate CAPA recommendations',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}

function constructCapaPrompt(incidentData: Record<string, unknown>) {
  return `You are a senior EHS (Environmental, Health & Safety) investigator with 20+ years of experience in industrial safety.
Analyze the following incident report thoroughly and generate a comprehensive CAPA (Corrective and Preventive Action) and Root Cause Analysis report.

IMPORTANT INSTRUCTIONS:
- Generate as many corrective and preventive action points as needed to fully address the incident — do NOT limit to 5.
- Each action point must be specific, actionable, and directly tied to the incident details.
- Base your analysis on ALL the structured data provided below.
- If a field is empty or null, skip it — do not write "Not Applicable" for every field.
- Severity should factor in both the actual outcome AND the worst-case potential provided.

====================
INCIDENT SNAPSHOT
====================
- Title: ${incidentData.title || 'N/A'}
- Incident Type: ${incidentData.incident_type === 'Other' && incidentData.incident_type_other ? `Other - ${incidentData.incident_type_other}` : (incidentData.incident_type || 'N/A')}
- Severity: ${incidentData.severity_level || 'N/A'}
- Worst-Case Potential: ${incidentData.worst_case_potential || 'N/A'}
- Location: ${incidentData.location || 'N/A'}
- Date: ${incidentData.date || 'N/A'}
- Time: ${incidentData.time || 'N/A'}

====================
INCIDENT NARRATION
====================
- Activity Type: ${incidentData.activity_type || 'N/A'}
- What was happening before: ${incidentData.pre_incident_activity || 'N/A'}
- What failed or went wrong: ${incidentData.failure_type || 'N/A'}
- Incident Description: ${incidentData.narrative || 'N/A'}
- How it was stopped: ${incidentData.how_stopped || 'N/A'}

====================
IMPACT
====================
- Described Impact: ${incidentData.impact_description || 'N/A'}
- Corrective Measures: ${incidentData.immediate_actions || 'N/A'}

=======================
SYSTEM ANALYSIS
=======================
- Controls that were present but failed: ${Array.isArray(incidentData.controls_failed) ? (incidentData.controls_failed as string[]).join(', ') : 'N/A'}
- Deviation from SOP: ${incidentData.sop_deviation === true ? 'Yes' : incidentData.sop_deviation === false ? 'No' : 'N/A'}
- Authorization / Competence verified: ${incidentData.authorization_competence === true ? 'Yes' : incidentData.authorization_competence === false ? 'No' : 'N/A'}
- Pressure or constraints present: ${Array.isArray(incidentData.pressure_constraints) ? (incidentData.pressure_constraints as string[]).join(', ') : 'N/A'}

====================
HISTORICAL CONTEXT
====================
- Historical Incident Date: ${incidentData.historical_incident_date || 'N/A'}
- Past Similar Incidents: ${incidentData.past_incidents_text || 'None reported'}

====================
RESPOND WITH THIS EXACT JSON STRUCTURE:
====================
{
  "corrective": {
    "points": ["<specific immediate action 1>", "<specific immediate action 2>", "...as many as needed"]
  },
  "preventive": {
    "points": ["<long-term preventive measure 1>", "<long-term preventive measure 2>", "...as many as needed"]
  },
  "five_whys_analysis": {
    "points": [
      { "question": "Why did the incident occur?", "answer": "<direct cause>" },
      { "question": "Why did <direct cause> happen?", "answer": "<underlying cause 1>" },
      { "question": "Why did <underlying cause 1> exist?", "answer": "<underlying cause 2>" },
      { "question": "Why did <underlying cause 2> exist?", "answer": "<deeper cause 1>" },
      { "question": "Why did <deeper cause 1> persist?", "answer": "<deeper cause 2>" },
      { "question": "Why was <deeper cause 2> not identified earlier?", "answer": "<systemic gap 1>" },
      { "question": "Why did <systemic gap 1> exist?", "answer": "<systemic gap 2>" },
      { "question": "Why was <systemic gap 2> not addressed?", "answer": "<organisational gap>" },
      { "question": "Why did the organisation allow this gap?", "answer": "<management system failure>" },
      { "question": "Why did the management system fail to prevent this?", "answer": "<root cause>" }
    ]
  },
  "severity_level": "<Minor | Moderate | Severe | Critical>",
  "flowchart": {
    "points": [
      { "no": 1, "title": "<event title>", "description": "<what happened at this stage>" }
    ]
  },
  "immediate_cause": "<single sentence — the direct trigger of the incident>",
  "contributing_factors": {
    "people": "<human factors that contributed>",
    "process": "<process or procedural factors>",
    "equipment": "<equipment or tool factors>",
    "environment": "<environmental or workplace factors>"
  },
  "root_causes": {
    "points": [
      { "cause": "<root cause>", "effect": "<resulting effect>" }
    ]
  },
  "system_gaps": ["<systemic or policy failure 1>", "<systemic failure 2>", "..."],
  "rca_conclusion": "<2-3 sentence paragraph summarising the root cause analysis findings and key recommendations>"
}`;
}
