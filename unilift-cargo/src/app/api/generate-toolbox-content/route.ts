import { type NextRequest, NextResponse } from 'next/server';
import { generateWithRetry } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json();

    if (!topic || !topic.trim()) {
      return NextResponse.json(
        { success: false, error: 'Topic name is required' },
        { status: 400 }
      );
    }

    const prompt = `You are an experienced EHS (Environmental, Health & Safety) trainer writing a toolbox talk for workplace safety.

Topic: "${topic}"

Generate professional toolbox talk content for this topic in HTML format suitable for a rich text editor.

IMPORTANT INSTRUCTIONS:
- Write from the perspective of an EHS trainer addressing workers
- Use clear, simple language that workers can understand
- Focus on practical, actionable safety guidance
- The description should be comprehensive and detailed
- The summarize should be concise (3-5 key points)
- Format using proper HTML tags: <p>, <ul>, <li>, <strong>, <h3>

Respond with this exact JSON structure:
{
  "description": "<p>Introduction paragraph...</p><h3>Key Hazards</h3><ul><li>...</li></ul><h3>Safe Work Practices</h3><ul><li>...</li></ul><h3>Emergency Procedures</h3><p>...</p>",
  "summarize": "<p><strong>Key Takeaways:</strong></p><ul><li>...</li><li>...</li><li>...</li></ul>"
}`;

    const result = await generateWithRetry(
      { contents: [{ role: 'user', parts: [{ text: prompt }] }] },
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
