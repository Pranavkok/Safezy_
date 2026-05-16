import { type NextRequest, NextResponse } from 'next/server';
import { generateWithRetry } from '@/lib/gemini';

function buildClosurePrompt(report: Record<string, unknown>): string {
  const type = report.observation_type as string;
  const typeLabel =
    type === 'UA' ? 'Unsafe Act (UA)' :
    type === 'UC' ? 'Unsafe Condition (UC)' :
    'Near Miss';

  let classificationSection = '';
  if (type === 'UA') {
    const classes = Array.isArray(report.ua_classifications) ? (report.ua_classifications as string[]).join(', ') : 'N/A';
    classificationSection = `UA Classifications: ${classes}${report.ua_other ? ` (Other: ${report.ua_other})` : ''}`;
  } else if (type === 'UC') {
    const classes = Array.isArray(report.uc_classifications) ? (report.uc_classifications as string[]).join(', ') : 'N/A';
    classificationSection = `UC Classifications: ${classes}${report.uc_other ? ` (Other: ${report.uc_other})` : ''}
Severity: ${report.uc_severity || 'N/A'}
Temporary Controls Already Applied: ${report.uc_temporary_controls || 'None'}`;
  } else {
    classificationSection = `Potential Injury: ${report.nm_potential_injury || 'N/A'}
What Could Have Happened: ${report.nm_what_could_happen || 'N/A'}
Severity: ${report.nm_severity || 'N/A'}`;
  }

  return `You are a senior EHS (Environmental, Health & Safety) officer closing a ${typeLabel} observation report.

Based on the report details below, generate a concise and professional closure action summary describing what corrective actions were taken to address and resolve this observation.

====================
REPORT DETAILS
====================
Observation Type: ${typeLabel}
Location / Department: ${report.location_department || 'N/A'}
What Happened: ${report.what_happened || 'N/A'}
Equipment Involved: ${report.equipment_involved || 'N/A'}
Activity at Time: ${report.activity_at_time || 'N/A'}
${classificationSection}

====================
INSTRUCTIONS
====================
- Write the action taken as a numbered list of 4-6 specific, actionable steps that were carried out to close this observation.
- Each point must be concrete and directly relevant to the type and details of this observation.
- Do not repeat the problem — only describe what was DONE to resolve it.
- Write in past tense (e.g. "Conducted a toolbox talk...", "Replaced damaged equipment...").
- Keep total length under 200 words.

====================
RESPOND WITH THIS EXACT JSON:
====================
{
  "action_taken": "<numbered list of corrective actions taken, each on a new line>"
}`;
}

export async function POST(req: NextRequest) {
  try {
    const report: Record<string, unknown> = await req.json();

    if (!report || !report.observation_type) {
      return NextResponse.json(
        { success: false, error: 'Report data with observation_type is required' },
        { status: 400 }
      );
    }

    const prompt = buildClosurePrompt(report);

    const result = await generateWithRetry(
      { contents: [{ role: 'user', parts: [{ text: prompt }] }] },
      { responseMimeType: 'application/json', temperature: 0.4 }
    );

    const responseText = result.response.text().trim();
    if (!responseText) throw new Error('Empty response from Gemini');

    const parsed: { action_taken?: string } = JSON.parse(responseText);
    if (!parsed.action_taken) throw new Error('Invalid response format');

    return NextResponse.json({ success: true, data: { action_taken: parsed.action_taken } });
  } catch (error) {
    console.error('[generate-ua-uc-closure] error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, error: 'Failed to parse AI response' },
        { status: 422 }
      );
    }

    if (error instanceof Error && error.message.includes('429')) {
      return NextResponse.json(
        { success: false, error: 'AI quota exceeded. Please fill in the field manually.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to generate closure action' },
      { status: 500 }
    );
  }
}
