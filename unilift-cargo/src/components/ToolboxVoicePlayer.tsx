'use client';

import React, {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import {
  Pause,
  Play,
  Square,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
type PlayerState = 'idle' | 'playing' | 'paused';
type Language = 'original' | 'en' | 'hi' | 'mr';

interface ToolboxVoicePlayerProps {
  /** HTML content (will be stripped to plain text before speaking) */
  htmlContent: string;
  /** Currently active language so we pick the right TTS voice */
  language: Language;
}

// ------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------
const LANG_CODE: Record<Language, string> = {
  original: 'en-IN',
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN'
};

const LANG_LABEL: Record<Language, string> = {
  original: 'English',
  en: 'English',
  hi: 'Hindi',
  mr: 'Marathi'
};

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

/** Strip HTML tags and decode entities to plain readable text */
function stripHtml(html: string): string {
  if (typeof window === 'undefined') return html;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  // Add newlines for block elements so sentences don't run together
  doc.querySelectorAll('p, br, li, h1, h2, h3, h4, h5, h6').forEach(el => {
    el.insertAdjacentText('afterend', ' ');
  });
  return (doc.body.innerText || doc.body.textContent || '').trim();
}

/** Find the best available TTS voice for the given BCP-47 language code */
function getBestVoice(langCode: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const primary = langCode;           // e.g. "hi-IN"
  const base = langCode.split('-')[0]; // e.g. "hi"

  return (
    voices.find(v => v.lang === primary) ||
    voices.find(v => v.lang.startsWith(base)) ||
    voices.find(v => v.default) ||
    voices[0] ||
    null
  );
}

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------
const ToolboxVoicePlayer: React.FC<ToolboxVoicePlayerProps> = ({
  htmlContent,
  language
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [playerState, setPlayerState] = useState<PlayerState>('idle');
  const [progress, setProgress] = useState(0); // 0 – 100

  // Keep refs for the utterance and synthesis so we don't need re-renders
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const totalCharsRef = useRef(0);
  const isSupportedRef = useRef(
    typeof window !== 'undefined' && 'speechSynthesis' in window
  );

  // When language changes mid-play → stop
  const prevLanguageRef = useRef(language);
  useEffect(() => {
    if (prevLanguageRef.current !== language) {
      stopSpeech(false);
      prevLanguageRef.current = language;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupportedRef.current) window.speechSynthesis.cancel();
    };
  }, []);

  // ------------------------------------------------------------------
  // Speech control helpers
  // ------------------------------------------------------------------
  const stopSpeech = useCallback((resetProgress = true) => {
    if (!isSupportedRef.current) return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setPlayerState('idle');
    if (resetProgress) setProgress(0);
  }, []);

  const buildAndSpeak = useCallback(() => {
    if (!isSupportedRef.current) {
      toast.error('Text-to-speech is not supported in this browser.');
      return;
    }

    const plainText = stripHtml(htmlContent);
    if (!plainText) {
      toast.error('No content available to read.');
      return;
    }

    window.speechSynthesis.cancel();

    const langCode = LANG_CODE[language];
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.lang = langCode;
    utterance.rate = 0.95;
    utterance.pitch = 1;

    totalCharsRef.current = plainText.length;

    // Find voice — wait for voices to load if needed (some browsers are async)
    const assignVoice = () => {
      const voice = getBestVoice(langCode);
      if (voice) {
        utterance.voice = voice;
        // Warn if the voice language doesn't match what was requested
        if (!voice.lang.startsWith(langCode.split('-')[0])) {
          toast(`${LANG_LABEL[language]} voice not available on this device. Using default voice.`, {
            icon: '⚠️',
            duration: 3500
          });
        }
      }
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length) {
      assignVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        assignVoice();
        window.speechSynthesis.onvoiceschanged = null;
      };
    }

    // Track progress via boundary events (char index)
    utterance.onboundary = (event: SpeechSynthesisEvent) => {
      if (totalCharsRef.current > 0) {
        const pct = Math.min(
          Math.round((event.charIndex / totalCharsRef.current) * 100),
          99
        );
        setProgress(pct);
      }
    };

    utterance.onend = () => {
      setProgress(100);
      setPlayerState('idle');
      utteranceRef.current = null;
    };

    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      // 'interrupted' is fired when we cancel intentionally — suppress it
      if (event.error === 'interrupted' || event.error === 'canceled') return;
      toast.error('Voice playback encountered an error. Please try again.');
      setPlayerState('idle');
      setProgress(0);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setPlayerState('playing');
    setProgress(0);
  }, [htmlContent, language]);

  const handlePlayPause = useCallback(() => {
    if (!isSupportedRef.current) {
      toast.error('Text-to-speech is not supported in this browser.');
      return;
    }

    if (playerState === 'idle') {
      buildAndSpeak();
    } else if (playerState === 'playing') {
      window.speechSynthesis.pause();
      setPlayerState('paused');
    } else if (playerState === 'paused') {
      window.speechSynthesis.resume();
      setPlayerState('playing');
    }
  }, [playerState, buildAndSpeak]);

  const handleStop = useCallback(() => {
    stopSpeech(true);
  }, [stopSpeech]);

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(prev => {
      if (prev) {
        // Collapsing → stop speech
        stopSpeech(true);
      }
      return !prev;
    });
  }, [stopSpeech]);

  // ------------------------------------------------------------------
  // Derived UI values
  // ------------------------------------------------------------------
  const isPlaying = playerState === 'playing';
  const isPaused = playerState === 'paused';
  const isActive = isPlaying || isPaused;

  if (!isSupportedRef.current) return null;

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <div
      className="absolute bottom-3 right-3 z-20 flex flex-col items-end gap-2"
      role="region"
      aria-label="Voice reader"
    >
      {/* ── Expanded mini-player panel ── */}
      {isExpanded && (
        <div
          className="
            flex flex-col gap-2 bg-white border border-gray-200
            rounded-xl shadow-xl p-3 w-56
            animate-in fade-in slide-in-from-bottom-2 duration-200
          "
        >
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] font-semibold text-gray-700 uppercase tracking-wide">
                Voice Reader
              </span>
            </div>
            <span className="text-[10px] text-gray-400 font-medium">
              {LANG_LABEL[language]}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Reading progress"
            />
          </div>
          <span className="text-[10px] text-gray-400 text-right -mt-1">
            {progress}%
          </span>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            {/* Play / Pause */}
            <button
              onClick={handlePlayPause}
              title={isPlaying ? 'Pause' : isPaused ? 'Resume' : 'Play'}
              className="
                flex items-center justify-center w-9 h-9
                bg-primary text-white rounded-full
                hover:bg-primary/90 active:scale-95
                transition-all duration-150 shadow-sm
              "
              aria-label={isPlaying ? 'Pause reading' : isPaused ? 'Resume reading' : 'Start reading'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 translate-x-0.5" />
              )}
            </button>

            {/* Stop */}
            <button
              onClick={handleStop}
              disabled={!isActive}
              title="Stop"
              className="
                flex items-center justify-center w-8 h-8
                bg-gray-100 text-gray-600 rounded-full
                hover:bg-gray-200 active:scale-95
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-150
              "
              aria-label="Stop reading"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Status label */}
          <p className="text-center text-[10px] text-gray-400 italic">
            {playerState === 'idle' && progress === 100
              ? '✓ Done reading'
              : playerState === 'idle'
              ? 'Press ▶ to start reading'
              : playerState === 'paused'
              ? 'Paused'
              : 'Reading aloud…'}
          </p>
        </div>
      )}

      {/* ── Floating trigger button ── */}
      <button
        onClick={handleToggleExpand}
        title={isExpanded ? 'Close voice reader' : 'Listen to this content'}
        className={`
          flex items-center justify-center w-10 h-10 rounded-full shadow-lg
          transition-all duration-200 active:scale-95
          ${isExpanded
            ? 'bg-gray-700 text-white hover:bg-gray-800'
            : isActive
            ? 'bg-primary text-white hover:bg-primary/90 ring-2 ring-primary/30 ring-offset-1'
            : 'bg-primary text-white hover:bg-primary/90'
          }
        `}
        aria-label={isExpanded ? 'Close voice reader' : 'Open voice reader'}
        aria-expanded={isExpanded}
      >
        {isExpanded ? (
          <X className="w-4 h-4" />
        ) : isActive ? (
          <Volume2 className="w-4 h-4 animate-pulse" />
        ) : (
          <VolumeX className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};

export default ToolboxVoicePlayer;
