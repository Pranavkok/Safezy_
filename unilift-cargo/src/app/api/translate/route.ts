import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  mr: 'Marathi'
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });

async function translateHtml(html: string, targetLanguage: string): Promise<string> {
  const prompt = `Translate the text content in the following HTML to ${targetLanguage}.
Rules:
- Preserve ALL HTML tags exactly as they are
- Only translate the visible text content between tags
- Do not add, remove, or modify any HTML tags or attributes
- Return only the translated HTML, nothing else

HTML to translate:
${html}`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

export async function POST(req: NextRequest) {
  try {
    const { description, summarize, language } = await req.json();

    const languageName = LANGUAGE_NAMES[language];
    if (!languageName) {
      return NextResponse.json({ error: 'Invalid language' }, { status: 400 });
    }

    const [translatedDescription, translatedSummarize] = await Promise.all([
      description ? translateHtml(description, languageName) : Promise.resolve(''),
      summarize ? translateHtml(summarize, languageName) : Promise.resolve('')
    ]);

    return NextResponse.json({ translatedDescription, translatedSummarize });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}
