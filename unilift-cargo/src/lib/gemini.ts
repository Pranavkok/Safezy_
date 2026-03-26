import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const PRIMARY_MODEL = 'gemini-3.1-flash-lite-preview';
const FALLBACK_MODEL = 'gemini-3-flash-preview';
const THIRD_MODEL = 'gemini-2.5-flash';

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
    const m = genAI.getGenerativeModel({ model: modelName, generationConfig });
    return m.generateContent(contents);
  };

  const sleep = (ms: number) =>
    new Promise(resolve => {
      setTimeout(resolve, ms);
    });

  const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(Object.assign(new Error('timeout'), { status: 503 })), ms)
    );
    return Promise.race([promise, timeout]);
  };

  const models = [PRIMARY_MODEL, FALLBACK_MODEL, THIRD_MODEL];
  let lastError: unknown;

  for (let index = 0; index < models.length; index += 1) {
    const modelName = models[index];
    try {
      if (index === 0) {
        return await withTimeout(attempt(modelName), PRIMARY_TIMEOUT_MS);
      }

      if (index > 1) {
        await sleep(500);
      }

      return await attempt(modelName);
    } catch (err: unknown) {
      lastError = err;
      const status = (err as { status?: number })?.status;

      if (status !== 503) {
        throw err;
      }
    }
  }

  throw lastError;
}
