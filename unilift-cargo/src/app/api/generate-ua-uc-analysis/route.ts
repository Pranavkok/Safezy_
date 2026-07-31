import { type NextRequest, NextResponse } from 'next/server';
import { generateWithRetry } from '@/lib/gemini';

// ─── Fetch media from URL and encode as base64 inlineData part ────────────────

async function buildMediaPart(mediaUrl: string, mediaType: string) {
  const res = await fetch(mediaUrl);
  if (!res.ok) throw new Error(`Failed to fetch media: ${res.status}`);

  const buffer = await res.arrayBuffer();
  const contentType = (res.headers.get('content-type') || '').split(';')[0].trim();

  // Determine final MIME type: prefer the actual content-type, fall back to our mapping
  let mimeType = contentType;
  if (!mimeType) {
    if (mediaType === 'image') mimeType = 'image/jpeg';
    else if (mediaType === 'video') mimeType = 'video/mp4';
    else mimeType = 'audio/mpeg';
  }

  return {
    inlineData: {
      mimeType,
      data: Buffer.from(buffer).toString('base64')
    }
  };
}

// ─── Build prompt based on observation type + media type ─────────────────────

const UA_CLASSIFICATION_OPTIONS = [
  'Not using PPE',
  'Improper handling of equipment',
  'Bypassing safety devices',
  'Unsafe lifting / posture',
  'Operating without authorization',
];

const UC_CLASSIFICATION_OPTIONS = [
  'Oil spill / slippery floor',
  'Damaged tools / equipment',
  'Poor housekeeping',
  'Exposed wiring',
  'Inadequate guarding',
  'Poor lighting / ventilation',
];

function buildMediaInstruction(mediaItems: { url: string; type: string }[]): string {
  if (mediaItems.length === 1) {
    const t = mediaItems[0].type;
    if (t === 'image') return 'Carefully analyze this image.';
    if (t === 'video') return 'Carefully analyze this video clip. Consider all moments visible across the footage.';
    return 'This is a voice note recorded at a worksite. Transcribe what is being described and analyze the reported situation.';
  }
  const counts: string[] = [];
  const images = mediaItems.filter(i => i.type === 'image').length;
  const videos = mediaItems.filter(i => i.type === 'video').length;
  const voices = mediaItems.filter(i => i.type === 'voice').length;
  if (images) counts.push(`${images} image${images > 1 ? 's' : ''}`);
  if (videos) counts.push(`${videos} video${videos > 1 ? 's' : ''}`);
  if (voices) counts.push(`${voices} voice note${voices > 1 ? 's' : ''}`);
  return `Carefully analyze all ${mediaItems.length} provided media files (${counts.join(', ')}). Consider all evidence collectively for the most comprehensive and accurate assessment.`;
}

function buildPrompt(
  observationType: string,
  mediaItems: { url: string; type: string }[]
): string {
  const mediaInstruction = buildMediaInstruction(mediaItems);

  if (observationType === 'UA') {
    return `You are a senior EHS (Environmental, Health & Safety) expert with 20+ years of experience in industrial safety.

${mediaInstruction}

Identify the unsafe human behavior or action that is visible or described. Focus on what safety rule, PPE requirement, or authorized procedure is being violated.

The available UA classifications are:
${UA_CLASSIFICATION_OPTIONS.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Based on your analysis, respond with ONLY this exact JSON structure — no explanation, no markdown, no extra text:
{
  "what_happened": "<Write 4-6 sentences. Describe: (1) exactly what unsafe act was observed and who is performing it, (2) what specific safety rule, PPE requirement, or procedure is being violated, (3) the environment or context where this is happening, (4) the immediate risk or potential harm this act poses to the worker and others nearby, and (5) any contributing factors such as lack of supervision, time pressure, or inadequate training that may have led to this behavior.>",
  "equipment_involved": "<comma-separated list of equipment, tools, PPE, or materials involved — write 'None identified' if nothing is visible>",
  "ua_classifications": ["<select all that apply from the list above — use the exact text>"],
  "ua_other": "<only if none of the above classifications fit, briefly describe the unsafe act; otherwise leave as empty string>",
  "capa_points": {
    "corrective": ["<corrective action 1>", "<corrective action 2>", "<corrective action 3>", "...minimum 3, more if needed"],
    "preventive": ["<preventive measure 1>", "<preventive measure 2>", "<preventive measure 3>", "...minimum 3, more if needed"]
  }
}`;
  }

  if (observationType === 'UC') {
    return `You are a senior EHS (Environmental, Health & Safety) expert with 20+ years of experience in industrial safety.

${mediaInstruction}

Identify the unsafe physical condition or environmental hazard that is visible or described. Focus on what equipment, structure, or material poses a risk.

The available UC classifications are:
${UC_CLASSIFICATION_OPTIONS.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Based on your analysis, respond with ONLY this exact JSON structure — no explanation, no markdown, no extra text:
{
  "what_happened": "<Write 4-6 sentences. Describe: (1) exactly what unsafe condition exists and where it is located, (2) how long it appears to have existed or what may have caused it, (3) which specific safety standard or regulation is being violated, (4) which workers or activities are directly exposed to this hazard, and (5) the potential injury or damage that could result if this condition is not corrected immediately.>",
  "equipment_involved": "<comma-separated list of equipment, tools, structures, or materials involved — write 'None identified' if nothing is visible>",
  "uc_classifications": ["<select all that apply from the list above — use the exact text>"],
  "uc_other": "<only if none of the above classifications fit, briefly describe the condition; otherwise leave as empty string>",
  "uc_severity": "<one of: Low | Medium | High — based on the potential harm this unsafe condition could cause>",
  "uc_temporary_controls": "<Write 5-7 detailed control measures as a numbered list. Put each numbered point on its own line (use \\n between points). Include: (1) immediate area isolation or barricading step, (2) warning signs or barriers to be placed, (3) which personnel must be evacuated or kept away, (4) who must be notified (supervisor, maintenance, safety officer), (5) interim fix or workaround until permanent repair is done, (6) permanent corrective action required such as repair, replacement, or maintenance work order, and (7) follow-up inspection schedule to confirm the hazard has been eliminated.>",
  "capa_points": {
    "corrective": ["<corrective action 1>", "<corrective action 2>", "<corrective action 3>", "...minimum 3, more if needed"],
    "preventive": ["<preventive measure 1>", "<preventive measure 2>", "<preventive measure 3>", "...minimum 3, more if needed"]
  }
}`;
  }

  // NearMiss
  return `You are a senior EHS (Environmental, Health & Safety) expert with 20+ years of experience in industrial safety.

${mediaInstruction}

Describe the near miss situation that is visible or described. Focus on what almost happened and what potential harm could have resulted.

Based on your analysis, respond with ONLY this exact JSON structure — no explanation, no markdown, no extra text:
{
  "what_happened": "<Write 4-6 sentences. Describe: (1) exactly what near miss event occurred and who was involved, (2) what activity was being performed at the time, (3) what specific unsafe act or condition contributed to the near miss, (4) what immediate factor prevented an actual injury or incident, and (5) how frequently this type of near miss might occur in this environment if left unaddressed.>",
  "equipment_involved": "<comma-separated list of equipment, tools, or materials involved — write 'None identified' if nothing is visible>",
  "nm_potential_injury": "<specific type of potential injury, e.g. Head injury from falling object, Fall from height, Burns from chemical splash, Crush injury from machinery>",
  "nm_what_could_happen": "<Write 3-4 sentences describing: (1) the worst-case scenario injury or fatality that could have resulted, (2) secondary consequences such as equipment damage or production shutdown, (3) regulatory or legal implications if it had become an actual incident, and (4) how this near miss is a warning sign of a systemic safety gap that requires immediate attention.>",
  "nm_severity": "<one of: Low | Medium | High — based on potential consequences>",
  "capa_points": {
    "corrective": ["<corrective action 1>", "<corrective action 2>", "<corrective action 3>", "...minimum 3, more if needed"],
    "preventive": ["<preventive measure 1>", "<preventive measure 2>", "<preventive measure 3>", "...minimum 3, more if needed"]
  }
}`;
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { media_items, observation_type } = body;

    if (!media_items || !Array.isArray(media_items) || media_items.length === 0 || !observation_type) {
      return NextResponse.json(
        { success: false, error: 'media_items (array) and observation_type are required' },
        { status: 400 }
      );
    }

    const mediaParts = await Promise.all(
      media_items.map((item: { url: string; type: string }) => buildMediaPart(item.url, item.type))
    );
    const prompt = buildPrompt(observation_type, media_items);

    const result = await generateWithRetry(
      { contents: [{ role: 'user', parts: [...mediaParts, { text: prompt }] }] },
      { responseMimeType: 'application/json', temperature: 0.3 }
    );

    const responseText = result.response.text().trim();

    if (!responseText) {
      throw new Error('Empty response from Gemini');
    }

    const parsed = JSON.parse(responseText);

    if (!parsed.what_happened || !parsed.equipment_involved) {
      throw new Error('Invalid response structure from Gemini');
    }

    return NextResponse.json({
      success: true,
      data: parsed
    });
  } catch (error) {
    console.error('[generate-ua-uc-analysis] error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, error: 'Failed to parse AI response' },
        { status: 422 }
      );
    }

    // Quota exceeded — return 429 so the client can show a friendly message
    if (error instanceof Error && error.message.includes('429')) {
      return NextResponse.json(
        { success: false, error: 'AI quota exceeded. Please fill in the fields manually.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate analysis',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
