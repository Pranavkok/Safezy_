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

function buildPrompt(
  observationType: string,
  mediaType: string
): string {
  const mediaInstruction =
    mediaType === 'image'
      ? `Carefully analyze this image.`
      : mediaType === 'video'
      ? `Carefully analyze this video clip. Consider all moments visible across the footage.`
      : `This is a voice note recorded at a worksite. Transcribe what is being described and analyze the reported situation.`;

  if (observationType === 'UA') {
    return `You are a senior EHS (Environmental, Health & Safety) expert with 20+ years of experience in industrial safety.

${mediaInstruction}

Identify the unsafe human behavior or action that is visible or described. Focus on what safety rule, PPE requirement, or authorized procedure is being violated.

The available UA classifications are:
${UA_CLASSIFICATION_OPTIONS.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Based on your analysis, respond with ONLY this exact JSON structure — no explanation, no markdown, no extra text:
{
  "what_happened": "<1-2 sentences describing the unsafe act observed>",
  "equipment_involved": "<comma-separated list of equipment, tools, or materials involved — write 'None identified' if nothing is visible>",
  "ua_classifications": ["<select all that apply from the list above — use the exact text>"],
  "ua_other": "<only if none of the above classifications fit, briefly describe the unsafe act; otherwise leave as empty string>",
  "action_taken": "<recommended immediate corrective action to address this unsafe act, written as a short actionable instruction>"
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
  "what_happened": "<1-2 sentences describing the unsafe condition observed>",
  "equipment_involved": "<comma-separated list of equipment, tools, or materials involved — write 'None identified' if nothing is visible>",
  "uc_classifications": ["<select all that apply from the list above — use the exact text>"],
  "uc_other": "<only if none of the above classifications fit, briefly describe the condition; otherwise leave as empty string>",
  "uc_severity": "<one of: Low | Medium | High — based on the potential harm this unsafe condition could cause>",
  "uc_temporary_controls": "<immediate temporary control measures that should be applied right now to reduce the risk, written as short actionable instructions>"
}`;
  }

  // NearMiss
  return `You are a senior EHS (Environmental, Health & Safety) expert with 20+ years of experience in industrial safety.

${mediaInstruction}

Describe the near miss situation that is visible or described. Focus on what almost happened and what potential harm could have resulted.

Based on your analysis, respond with ONLY this exact JSON structure — no explanation, no markdown, no extra text:
{
  "what_happened": "<1-2 sentences describing the near miss event observed>",
  "equipment_involved": "<comma-separated list of equipment, tools, or materials involved — write 'None identified' if nothing is visible>",
  "nm_potential_injury": "<type of potential injury, e.g. Head injury, Fall, Burns, Crush injury>",
  "nm_what_could_happen": "<1-2 sentences describing what could have happened if the near miss had resulted in an incident>",
  "nm_severity": "<one of: Low | Medium | High — based on potential consequences>"
}`;
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { media_url, media_type, observation_type } = body;

    if (!media_url || !media_type || !observation_type) {
      return NextResponse.json(
        { success: false, error: 'media_url, media_type, and observation_type are required' },
        { status: 400 }
      );
    }

    const mediaPart = await buildMediaPart(media_url, media_type);
    const prompt = buildPrompt(observation_type, media_type);

    const result = await generateWithRetry(
      { contents: [{ role: 'user', parts: [mediaPart, { text: prompt }] }] },
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
