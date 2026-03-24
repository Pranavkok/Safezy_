import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const PRIMARY_MODEL = 'gemini-3.1-flash-lite-preview';
const FALLBACK_MODEL = 'gemini-3-flash-preview';

export function getModel(modelName = PRIMARY_MODEL): GenerativeModel {
  return genAI.getGenerativeModel({ model: modelName });
}

/**
 * Calls generateContent with automatic retry + fallback model on 503.
 */
export async function generateWithRetry(
  contents: Parameters<GenerativeModel['generateContent']>[0],
  options?: { temperature?: number; responseMimeType?: string }
) {
  const generationConfig = {
    ...(options?.temperature !== undefined ? { temperature: options.temperature } : {}),
    ...(options?.responseMimeType ? { responseMimeType: options.responseMimeType } : {})
  };

  const PRIMARY_TIMEOUT_MS = 6000; // bail out of primary after 6s and use fallback

  const attempt = async (modelName: string) => {
    const m = getModel(modelName);
    return m.generateContent({ ...(contents as object), generationConfig });
  };

  const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(Object.assign(new Error('timeout'), { status: 503 })), ms)
    );
    return Promise.race([promise, timeout]);
  };

  try {
    return await withTimeout(attempt(PRIMARY_MODEL), PRIMARY_TIMEOUT_MS);
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status;
    if (status === 503) {
      // Primary model overloaded or timed out — use fallback
      return await attempt(FALLBACK_MODEL);
    }
    throw err;
  }
}
