import { type NextRequest, NextResponse } from 'next/server';
import { generateWithRetry } from '@/lib/gemini';

// ─── Prompt builder ────────────────────────────────────────────────────────────

function buildCapaPrompt(report: Record<string, unknown>): string {
  const type = report.observation_type as string;

  const typeLabel =
    type === 'UA'
      ? 'Unsafe Act (UA)'
      : type === 'UC'
        ? 'Unsafe Condition (UC)'
        : 'Near Miss';

  // Build classification detail based on type
  let classificationDetail = '';
  if (type === 'UA') {
    const items = Array.isArray(report.ua_classifications)
      ? (report.ua_classifications as string[]).join(', ')
      : 'N/A';
    classificationDetail = `- UA Classifications: ${items}${report.ua_other ? ` (Other: ${report.ua_other})` : ''}`;
  } else if (type === 'UC') {
    const items = Array.isArray(report.uc_classifications)
      ? (report.uc_classifications as string[]).join(', ')
      : 'N/A';
    classificationDetail = `- UC Classifications: ${items}${report.uc_other ? ` (Other: ${report.uc_other})` : ''}
- Severity: ${report.uc_severity ?? 'N/A'}
- Temporary Controls in Place: ${report.uc_temporary_controls ?? 'None'}`;
  } else {
    classificationDetail = `- Potential Injury: ${report.nm_potential_injury ?? 'N/A'}
- What Could Have Happened: ${report.nm_what_could_happen ?? 'N/A'}
- Severity: ${report.nm_severity ?? 'N/A'}`;
  }

  return `You are a senior EHS (Environmental, Health & Safety) expert with 20+ years of field experience.
Analyze the following ${typeLabel} observation report and generate specific, actionable CAPA (Corrective and Preventive Action) points.

INSTRUCTIONS:
- Generate as many points as necessary to fully address the observation — do NOT limit to 5.
- Corrective actions = immediate steps to fix the current unsafe situation.
- Preventive actions = long-term systemic measures to stop recurrence.
- Be specific and tie each action directly to the details of the report.
- Skip fields that are null or empty — do not write "N/A" as an action.

====================
OBSERVATION REPORT
====================
- Observation Type: ${typeLabel}
- Location / Department: ${report.location_department ?? 'N/A'}
- Reported By: ${report.reported_by_name ?? 'N/A'}

====================
OBSERVATION DETAILS
====================
- What happened: ${report.what_happened ?? 'N/A'}
- Equipment involved: ${report.equipment_involved ?? 'N/A'}
- Activity at time of observation: ${report.activity_at_time ?? 'N/A'}
${classificationDetail}
${report.action_taken ? `- Initial action already taken: ${report.action_taken}` : ''}

====================
RESPOND WITH ONLY THIS EXACT JSON — NO EXTRA TEXT:
====================
{
  "corrective": [
    "<specific immediate corrective action 1>",
    "<specific immediate corrective action 2>",
    "...as many as needed"
  ],
  "preventive": [
    "<long-term preventive measure 1>",
    "<long-term preventive measure 2>",
    "...as many as needed"
  ]
}`;
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const reportData: Record<string, unknown> = await req.json();

    if (!reportData || !reportData.observation_type) {
      return NextResponse.json(
        { success: false, error: 'Report data with observation_type is required' },
        { status: 400 }
      );
    }

    const prompt = buildCapaPrompt(reportData);

    const result = await generateWithRetry(
      { contents: [{ role: 'user', parts: [{ text: prompt }] }] },
      { responseMimeType: 'application/json', temperature: 0.35 }
    );

    const responseText = result.response.text().trim();

    if (!responseText) {
      throw new Error('Empty response from Gemini');
    }

    const capaResponse = JSON.parse(responseText) as {
      corrective: string[];
      preventive: string[];
    };

    if (
      !Array.isArray(capaResponse.corrective) ||
      !Array.isArray(capaResponse.preventive)
    ) {
      throw new Error('Invalid CAPA response format — missing corrective or preventive arrays');
    }

    return NextResponse.json({
      success: true,
      message: 'CAPA points generated successfully',
      data: {
        corrective: capaResponse.corrective,
        preventive: capaResponse.preventive
      }
    });
  } catch (error) {
    console.error('[generate-ua-uc-capa] Error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to parse AI response',
          message: 'The AI generated an invalid response format'
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate CAPA points',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
}
