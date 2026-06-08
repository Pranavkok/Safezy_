'use client';

import ASSETS from '@/assets';
import Image from 'next/image';
import { ToolboxTalkType } from '@/types/index.types';
import { SecondaryLogo } from '@/components/svgs';
import { ToolboxNoteType } from '@/types/ehs.types';
import EhsTbtSummarizeModal from '@/components/modals/ehs/EhsTbtSummarize';
import ToolboxNoteModal from '@/components/modals/ehs/AddNoteForTBT';
import MarkTBTDoneModal from '@/components/modals/ehs/MarkTBTDoneModal';
import ToolboxTalkContentDownloadButton from '../ToolboxTalkContentDownloadButton';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

type Language = 'original' | 'en' | 'hi' | 'mr';

const LANGUAGES: { key: Language; label: string }[] = [
  { key: 'original', label: 'Original' },
  { key: 'en', label: 'English' },
  { key: 'hi', label: 'Hindi' },
  { key: 'mr', label: 'Marathi' }
];

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [
    String(h).padStart(2, '0'),
    String(m).padStart(2, '0'),
    String(s).padStart(2, '0')
  ].join(':');
}

export const EHSToolboxTalkDetailsSection = ({
  toolboxTalk,
  toolboxNote
}: {
  toolboxTalk: ToolboxTalkType;
  toolboxNote: ToolboxNoteType;
}) => {
  const storageKey = `tbt_session_${toolboxTalk.id}`;
  const sessionStartRef = useRef<number>(0);
  const [elapsed, setElapsed] = useState(0);
  const [fontSize, setFontSize] = useState(16);

  const [activeLanguage, setActiveLanguage] = useState<Language>('original');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedDescription, setTranslatedDescription] = useState<string>('');
  const [translatedSummarize, setTranslatedSummarize] = useState<string>('');
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const translationCache = useRef<Partial<Record<Language, { description: string; summarize: string }>>>({});

  useEffect(() => {
    const stored = sessionStorage.getItem(storageKey);
    if (stored) {
      sessionStartRef.current = parseInt(stored, 10);
    } else {
      const now = Date.now();
      sessionStartRef.current = now;
      sessionStorage.setItem(storageKey, String(now));
    }

    setElapsed(Math.floor((Date.now() - sessionStartRef.current) / 1000));

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - sessionStartRef.current) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [storageKey]);

  const handleLanguageChange = async (lang: Language) => {
    if (lang === activeLanguage) return;

    if (lang === 'original') {
      setActiveLanguage('original');
      return;
    }

    // Use cache if available
    if (translationCache.current[lang]) {
      const cached = translationCache.current[lang]!;
      setTranslatedDescription(cached.description);
      setTranslatedSummarize(cached.summarize);
      setActiveLanguage(lang);
      return;
    }

    setIsTranslating(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: toolboxTalk.description || '',
          summarize: toolboxTalk.summarized || '',
          language: lang
        })
      });

      if (!res.ok) throw new Error('Translation failed');

      const { translatedDescription: desc, translatedSummarize: summ } = await res.json();

      translationCache.current[lang] = { description: desc, summarize: summ };
      setTranslatedDescription(desc);
      setTranslatedSummarize(summ);
      setActiveLanguage(lang);
    } catch {
      toast.error('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const displayDescription =
    activeLanguage === 'original' ? toolboxTalk.description : translatedDescription;
  const displaySummarize =
    activeLanguage === 'original' ? toolboxTalk.summarized : translatedSummarize;

  return (
    <div className="relative overflow-hidden">
      <div className="w-full h-full pointer-events-none">
        <div className="absolute -left-32 top-44 rotate-90">
          <Image
            src={ASSETS.IMG.SAFEZY_TEXT}
            alt="Safety Text"
            height={512}
            width={512}
            className="w-[450px] h-auto"
            priority
          />
        </div>
        <div className="absolute right-0 bottom-0 translate-x-1/2 ">
          <Image
            src={ASSETS.IMG.HELMET}
            alt="Decorative Helmet"
            height={512}
            width={512}
            className="w-[550px] h-auto"
            priority
          />
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center w-full max-w-7xl mx-auto px-4 py-8 ">
        <div className="bg-white shadow-lg rounded-xl w-full p-6 sm:p-8 border border-gray-300 z-20">
          <div className="flex flex-col sm:flex-row justify-between items-center border-b-2 border-gray-300 pb-2 sm:pb-4 gap-3 sm:gap-0">
            <SecondaryLogo className="bg-primary pt-3 rounded sm:w-40 md:w-48 " />
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-black text-center sm:text-right">
              EHS Toolbox Talk
            </div>
          </div>

          {/* Topic Name */}
          <div className="w-full text-center bg-primary text-white text-base sm:text-lg md:text-xl font-extrabold py-2 sm:py-3 mt-2 sm:mt-4 rounded-md px-2">
            {toolboxTalk.topic_name.toUpperCase()}
          </div>

          {/* Session Timer + Translate Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-3 gap-2">
            {/* Language Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-gray-500 mr-1">Translate:</span>
              {LANGUAGES.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleLanguageChange(key)}
                  disabled={isTranslating}
                  className={`px-3 py-1 text-xs rounded-full border font-medium transition-colors
                    ${activeLanguage === key
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-primary hover:text-primary'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isTranslating && activeLanguage !== key && key !== 'original' ? label : label}
                </button>
              ))}
              {isTranslating && (
                <span className="text-xs text-gray-400 italic">Translating...</span>
              )}
            </div>

            {/* Session Timer */}
            <span className="text-xs text-gray-500 font-mono tracking-wide shrink-0">
              Session Time: {formatElapsed(elapsed)}
            </span>
          </div>

          {/* Content Box */}
          {isTranslating ? (
            <div className="relative mt-3 p-6 bg-gray-100 border border-gray-300 rounded-lg space-y-3">
              <div className="h-4 bg-gray-300 rounded animate-pulse w-full" />
              <div className="h-4 bg-gray-300 rounded animate-pulse w-5/6" />
              <div className="h-4 bg-gray-300 rounded animate-pulse w-4/5" />
              <div className="h-4 bg-gray-300 rounded animate-pulse w-full" />
              <div className="h-4 bg-gray-300 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-gray-300 rounded animate-pulse w-5/6" />
              <div className="h-4 bg-gray-300 rounded animate-pulse w-full" />
              <div className="h-4 bg-gray-300 rounded animate-pulse w-2/3" />
            </div>
          ) : displayDescription ? (
            <div className="relative mt-3 p-6 bg-gray-100 border border-gray-300 rounded-lg overflow-hidden">
              {/* Zoom Controls */}
              <div className="flex justify-end gap-1.5 mb-3 relative z-[11]">
                <button
                  onClick={() => setFontSize(prev => Math.max(prev - 2, 12))}
                  className="px-2 py-0.5 text-xs border border-gray-400 rounded hover:bg-gray-200 font-bold select-none"
                  title="Decrease text size"
                >
                  A−
                </button>
                <button
                  onClick={() => setFontSize(16)}
                  className="px-2 py-0.5 text-xs border border-gray-400 rounded hover:bg-gray-200 select-none"
                  title="Reset text size"
                >
                  Reset
                </button>
                <button
                  onClick={() => setFontSize(prev => Math.min(prev + 2, 26))}
                  className="px-2 py-0.5 text-xs border border-gray-400 rounded hover:bg-gray-200 font-bold select-none"
                  title="Increase text size"
                >
                  A+
                </button>
              </div>

              <div
                className="relative z-[10] w-full quill-content"
                style={{ fontSize: `${fontSize}px` }}
                dangerouslySetInnerHTML={{ __html: displayDescription }}
              />
            </div>
          ) : null}

          {toolboxTalk.pdf_url && (
            <div className="mt-6 flex justify-center">
              {!isImageLoaded && (
                <div className="w-full max-w-2xl h-96 bg-gray-200 animate-pulse rounded-lg" />
              )}
              <div className={`w-full max-w-2xl border border-gray-300 rounded-lg shadow-md overflow-hidden transition-opacity duration-300 ${isImageLoaded ? 'opacity-100' : 'opacity-0 absolute'}`}>
                <Image
                  src={toolboxTalk.pdf_url}
                  alt={toolboxTalk.topic_name}
                  height={1080}
                  width={1080}
                  className="w-full h-auto"
                  onLoad={() => setIsImageLoaded(true)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="w-full flex flex-col gap-2 sm:flex-row sm:justify-between items-center mt-6">
          <div className="flex flex-wrap gap-2 items-center">
            <ToolboxNoteModal
              noteData={toolboxNote}
              toolboxId={toolboxTalk.id}
            />
            {toolboxTalk.summarized && (
              <EhsTbtSummarizeModal summary={displaySummarize || toolboxTalk.summarized} />
            )}
            <ToolboxTalkContentDownloadButton toolboxTalk={toolboxTalk} />
          </div>
          <div>
            <MarkTBTDoneModal
              toolboxTalkId={toolboxTalk.id}
              toolboxTopic={toolboxTalk.topic_name}
              sessionStartRef={sessionStartRef}
              storageKey={storageKey}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
