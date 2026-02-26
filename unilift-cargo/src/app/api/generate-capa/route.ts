import { OpenAI } from 'openai';
import { type NextRequest, NextResponse } from 'next/server';
import { IncidentAnalysisWithImageType } from '@/types/index.types';
import { EntityDetailsType } from '@/types/ehs.types';

type EvidenceEmployee = {
  name: string;
  designation: string;
  relation: string;
  comments: string;
};

export async function POST(req: NextRequest) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    // Get incident data from request body
    const incidentData: IncidentAnalysisWithImageType = await req.json();

    if (!incidentData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Incident data is required'
        },
        { status: 400 }
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // Construct prompt based on incident data
    const prompt = constructCapaPrompt(incidentData);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a highly experienced safety expert.
          You are given an incident report and you need to generate a CAPA report.
          The CAPA report should be in the following format:
          - Corrective Actions
          - Preventive Actions
          - 5 Whys Analysis
          - Severity Level
          - Flowchart Points (Flowchart of events leading to incident)`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' }
    });

    // Extract the response
    const responseContent = completion.choices[0].message.content;

    if (!responseContent) {
      throw new Error('Empty response from OpenAI');
    }

    // Parse the JSON response
    const capaResponse = JSON.parse(responseContent);

    // Validate response format
    if (!capaResponse.corrective || !capaResponse.preventive) {
      throw new Error('Invalid CAPA response format');
    }

    return NextResponse.json({
      success: true,
      message: 'CAPA recommendations generated successfully',
      data: capaResponse
    });
  } catch (error) {
    console.error('Error generating CAPA recommendations:', error);

    // Handle different error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to parse OpenAI response',
          message: 'The AI generated an invalid response format'
        },
        { status: 422 }
      );
    } else if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to generate CAPA recommendations',
          message: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate CAPA recommendations',
        message: 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// Helper function to construct a detailed prompt based on incident data
function constructCapaPrompt(incidentData: IncidentAnalysisWithImageType) {
  return `You are a safety expert. Analyze the incident and return a JSON object with the following keys:

1. "corrective": {
    "points": Array of 5 points describing specific actions to immediately address the incident consequences, focusing on directly addressing the specific failure points identified in the incident.
  }
2. "preventive": {
    "points": Array of 5 points describing strategic measures to prevent recurrence, focusing on systemic improvements, training, controls, policies, or monitoring.
  }
3. "five_whys_analysis": An array of 5 why questions and answers, starting with the problem and going deeper with each why. The question should only be "Why?" for each level.
4. "severity_level": e.g. Minor, Moderate, Severe
5. "flowchart_points": Flowchart of events leading to incident list of steps as objects with { "no": 1, "title": "", "description": "" }

If something is not available, use "Not Applicable". Respond only with the exact JSON schema—no extra text.

====================
INCIDENT DETAILS
====================
- Title: ${incidentData.title}
- Date: ${incidentData.date}
- Description: ${incidentData.narrative}
- Location: ${incidentData.location}

====================
ENTITY INVOLVED
====================
- Affected:
${(incidentData.affected_entity as EntityDetailsType[])
  ?.map(
    e => `  • ${e.name} (${e.designation || 'N/A'}) – Dept: ${e.department}`
  )
  .join('\n')}
- Shift Date: ${incidentData.entity_shift_date}
- Shift Info: ${incidentData.entity_shift_details}

====================
IMPACT
====================
- Cause: ${incidentData.cause_to_entity}

============================
FACTORS
============================
- Pre-Incident Process: ${incidentData.process_before_incident}
- Tools: ${JSON.stringify(incidentData.tools_involved)}
- Past Incidents: ${incidentData.past_incident_remarks}
- Training: ${incidentData.training_remarks}
- Instructions: ${incidentData.instructions_communicated}
- Frequency: ${incidentData.process_frequency}

====================
WITNESS
====================
- ${incidentData.witness_name} (${incidentData.witness_designation})

====================
EMPLOYEE EVIDENCE
====================
${(incidentData.evidence_employee_list as EvidenceEmployee[])
  ?.map(e => `  • ${e.name} (${e.designation}): "${e.comments}"`)
  .join('\n')}

====================
ADDITIONAL COMMENTS
====================
- ${incidentData.additional_comments || 'No additional comments'}

====================
FORMAT
====================
{
  "corrective": {
    "points": []
  },
  "preventive": {
    "points": []
  },
  "five_whys_analysis": {
    "points": [
      {
        "question": "Why?",
        "answer": "Initial problem statement"
      },
      {
        "question": "Why?",
        "answer": "First level cause"
      },
      {
        "question": "Why?",
        "answer": "Second level cause"
      },
      {
        "question": "Why?",
        "answer": "Third level cause"
      },
      {
        "question": "Why?",
        "answer": "Root cause"
      }
    ]
  },
  "severity_level": "",
  "flowchart": {
    "points": [
     {
      "no": 1,
      "title": "",
      "description": ""
    }
  ]
  }
}
`;
}
