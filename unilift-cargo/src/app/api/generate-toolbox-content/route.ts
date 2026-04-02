import { type NextRequest, NextResponse } from 'next/server';
import { generateWithRetry } from '@/lib/gemini';

type ResponseLength = 'short' | 'medium' | 'long';

const LENGTH_GUIDANCE: Record<ResponseLength, { description: string; summary: string }> = {
  short: {
    description: '150-200 words. One brief intro paragraph, one short list of 3-4 key hazards or practices.',
    summary: '2-3 bullet points only.'
  },
  medium: {
    description: '350-450 words. Intro paragraph, Key Hazards section, Safe Work Practices section, brief Emergency note.',
    summary: '4-5 bullet points.'
  },
  long: {
    description: '650-800 words. Comprehensive coverage with Intro, Key Hazards, Safe Work Practices, PPE Requirements, Emergency Procedures, and a closing reminder.',
    summary: '6-8 bullet points covering all major sections.'
  }
};

async function buildImagePart(imageUrl?: string, imageBase64?: string, imageMimeType?: string) {
  if (imageBase64 && imageMimeType) {
    return { inlineData: { mimeType: imageMimeType, data: imageBase64 } };
  }
  if (imageUrl) {
    const res = await fetch(imageUrl);
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
    const buffer = await res.arrayBuffer();
    const mimeType = (res.headers.get('content-type') || 'image/jpeg').split(';')[0].trim();
    return { inlineData: { mimeType, data: Buffer.from(buffer).toString('base64') } };
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { topic, length = 'medium', image_url, image_base64, image_mime_type } = await req.json();

    if (!topic || !topic.trim()) {
      return NextResponse.json(
        { success: false, error: 'Topic name is required' },
        { status: 400 }
      );
    }

    const responseLength: ResponseLength = ['short', 'medium', 'long'].includes(length) ? length : 'medium';
    const guidance = LENGTH_GUIDANCE[responseLength];

    const hasImage = !!(image_url || (image_base64 && image_mime_type));
    const imageInstruction = hasImage
      ? `\nAn image has been provided. Analyze it carefully and incorporate any relevant safety observations, hazards, or context visible in the image into the content.`
      : '';

    const prompt = `You are an experienced EHS (Environmental, Health & Safety) trainer writing a toolbox talk for workplace safety.

Topic: "${topic}"
${imageInstruction}
Generate professional toolbox talk content for this topic in HTML format suitable for a rich text editor.

RESPONSE LENGTH: ${responseLength.toUpperCase()}
- Description: ${guidance.description}
- Summary: ${guidance.summary}

IMPORTANT INSTRUCTIONS:
- Write from the perspective of an EHS trainer addressing workers
- Use clear, simple language that workers can understand
- Focus on practical, actionable safety guidance
- Format using proper HTML tags: <p>, <ul>, <li>, <strong>, <h3>

Respond with this exact JSON structure:
{
  "description": "<p>...</p>",
  "summarize": "<p><strong>Key Takeaways:</strong></p><ul><li>...</li></ul>"
}`;

    const imagePart = await buildImagePart(image_url, image_base64, image_mime_type);
    const parts = imagePart
      ? [imagePart, { text: prompt }]
      : [{ text: prompt }];

    const result = await generateWithRetry(
      { contents: [{ role: 'user', parts }] },
      { responseMimeType: 'application/json', temperature: 0.6 }
    );

    const responseText = result.response.text().trim();

    if (!responseText) {
      throw new Error('Empty response from Gemini');
    }

    const parsed = JSON.parse(responseText);

    if (!parsed.description || !parsed.summarize) {
      throw new Error('Invalid response format from AI');
    }

    return NextResponse.json({
      success: true,
      data: {
        description: parsed.description,
        summarize: parsed.summarize
      }
    });
  } catch (error) {
    console.error('Error generating toolbox content:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, error: 'Failed to parse AI response' },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate content'
      },
      { status: 500 }
    );
  }
}
