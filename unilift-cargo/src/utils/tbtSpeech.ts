const PREFERRED_MALE_VOICE_NAMES = [
  'aaroh',
  'alex',
  'daniel',
  'david',
  'fred',
  'george',
  'guy',
  'hemant',
  'madhur',
  'manohar',
  'mark',
  'oliver',
  'prabhat',
  'ravi',
  'rishi',
  'ryan',
  'thomas'
];

export const TBT_SPEECH_RATE = 0.78;
export const TBT_SPEECH_PITCH = 0.72;

const isPreferredMaleVoice = (voice: SpeechSynthesisVoice) => {
  const voiceName = voice.name.toLowerCase();

  if (voiceName.includes('female')) return false;

  return (
    PREFERRED_MALE_VOICE_NAMES.some(name => voiceName.includes(name)) ||
    /(?:^|[\s_-])male(?:$|[\s_-])/.test(voiceName)
  );
};

/** Prefer a male voice without sacrificing the requested language. */
export const getBestTbtVoice = (
  langCode: string
): SpeechSynthesisVoice | null => {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const normalizedLangCode = langCode.toLowerCase();
  const baseLanguage = normalizedLangCode.split('-')[0];
  const exactLanguageVoices = voices.filter(
    voice => voice.lang.toLowerCase() === normalizedLangCode
  );
  const baseLanguageVoices = voices.filter(
    voice =>
      voice.lang.toLowerCase().startsWith(baseLanguage) &&
      voice.lang.toLowerCase() !== normalizedLangCode
  );
  const matchingLanguageVoices = [
    ...exactLanguageVoices,
    ...baseLanguageVoices
  ];

  return (
    matchingLanguageVoices.find(isPreferredMaleVoice) ||
    matchingLanguageVoices[0] ||
    voices.find(voice => voice.default) ||
    voices[0] ||
    null
  );
};

export const configureTbtUtterance = (
  utterance: SpeechSynthesisUtterance,
  langCode: string
) => {
  utterance.lang = langCode;
  utterance.rate = TBT_SPEECH_RATE;
  utterance.pitch = TBT_SPEECH_PITCH;
  utterance.volume = 1;
};
