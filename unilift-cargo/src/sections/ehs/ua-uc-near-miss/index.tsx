'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import TextareaWithLabel from '@/components/inputs-fields/TextareaWithLabel';
import { useUser } from '@/context/UserContext';
import {
  OBSERVATION_TYPES,
  NEAR_MISS_SEVERITY,
  UA_CLASSIFICATIONS,
  UC_CLASSIFICATIONS,
  UaUcNearMissSchema
} from '@/validations/contractor/add-ua-uc-near-miss';
import {
  UaUcNearMissFormType,
  MediaType,
  UaUcAiAnalysisResponse
} from '@/types/ehs.types';
import { submitUaUcReport } from '@/actions/contractor/ua-uc-near-miss';
import { uploadFile } from '@/utils';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  ImagePlus,
  Loader2,
  FileVideo,
  Mic,
  X,
  CheckCircle2,
  Camera,
  Video,
  Square,
  Circle
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function detectMediaType(file: File): MediaType {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  return 'voice';
}

function formatDateTime(date: Date) {
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader = ({
  number,
  title,
  subtitle
}: {
  number: string;
  title: string;
  subtitle?: string;
}) => (
  <div className="mb-4">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
        SECTION {number}
      </span>
    </div>
    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
    {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
  </div>
);

const MultiSelectChips = ({
  value,
  options,
  onChange
}: {
  value: string[];
  options: readonly string[];
  onChange: (value: string[]) => void;
}) => {
  const selected = value ?? [];

  const toggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
      return;
    }
    onChange([...selected, option]);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(option => (
        <button
          key={option}
          type="button"
          onClick={() => toggle(option)}
          className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
            selected.includes(option)
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

const SeverityButtons = ({
  value,
  onChange
}: {
  value?: 'Low' | 'Medium' | 'High';
  onChange: (value: 'Low' | 'Medium' | 'High') => void;
}) => (
  <div className="flex gap-3">
    {NEAR_MISS_SEVERITY.map(level => (
      <button
        key={level}
        type="button"
        onClick={() => onChange(level)}
        className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${
          value === level
            ? level === 'High'
              ? 'bg-red-500 border-red-500 text-white'
              : level === 'Medium'
                ? 'bg-yellow-400 border-yellow-400 text-white'
                : 'bg-green-500 border-green-500 text-white'
            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
        }`}
      >
        {level}
      </button>
    ))}
  </div>
);

// ─── Photo Capture Modal ──────────────────────────────────────────────────────

const PhotoCaptureModal = ({
  onCaptured,
  onClose
}: {
  onCaptured: (file: File) => void;
  onClose: () => void;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);

  React.useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsReady(true);
      })
      .catch(() => {
        toast.error('Camera access denied. Please allow camera permission.');
        onClose();
      });
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [onClose]);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    canvas.toBlob(
      blob => {
        if (!blob) return;
        const file = new File([blob], `photo_${Date.now()}.jpg`, {
          type: 'image/jpeg'
        });
        onCaptured(file);
        onClose();
      },
      'image/jpeg',
      0.92
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Take Photo</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <video
          ref={videoRef}
          muted
          playsInline
          className="w-full rounded-lg bg-black aspect-video object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleCapture}
            disabled={!isReady}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-full text-sm font-medium disabled:opacity-50"
          >
            <Camera className="w-4 h-4" /> Capture Photo
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Video Recorder Modal ─────────────────────────────────────────────────────

const VideoRecorderModal = ({
  onRecorded,
  onClose
}: {
  onRecorded: (file: File) => void;
  onClose: () => void;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isReady, setIsReady] = useState(false);

  React.useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsReady(true);
      })
      .catch(() => {
        toast.error('Camera access denied. Please allow camera permission.');
        onClose();
      });
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [onClose]);

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];

    const preferredTypes = [
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp9,opus',
      'video/webm',
      'video/mp4'
    ];
    const mimeType =
      preferredTypes.find(t => MediaRecorder.isTypeSupported(t)) ?? '';
    const recorder = new MediaRecorder(
      streamRef.current,
      mimeType ? { mimeType } : undefined
    );

    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const type = recorder.mimeType || 'video/webm';
      const ext = type.includes('mp4') ? 'mp4' : 'webm';
      const blob = new Blob(chunksRef.current, { type });
      const file = new File([blob], `recording_${Date.now()}.${ext}`, { type });
      onRecorded(file);
      onClose();
    };
    recorder.start(250); // collect data every 250ms for reliable chunks
    recorderRef.current = recorder;
    setIsRecording(true);
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Record Video</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <video
          ref={videoRef}
          muted
          className="w-full rounded-lg bg-black aspect-video object-cover"
        />
        <div className="flex justify-center">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              disabled={!isReady}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-medium disabled:opacity-50"
            >
              <Circle className="w-4 h-4 fill-white" /> Start Recording
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-full text-sm font-medium"
            >
              <Square className="w-4 h-4 fill-white" /> Stop & Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Media Upload ─────────────────────────────────────────────────────────────

type MediaItem = { url: string; type: MediaType; name: string };

const MediaUpload = ({
  onItemsChange,
  isAnalyzing
}: {
  onItemsChange: (items: MediaItem[]) => void;
  isAnalyzing: boolean;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const nativeCameraRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);

  const uploadFiles = async (files: File[], currentItems: MediaItem[]) => {
    setUploading(true);
    try {
      const uploaded = await Promise.all(
        files.map(async file => {
          const type = detectMediaType(file);
          const url = await uploadFile(file, 'ehs-ua-uc-media', 'media');
          return { url, type, name: file.name };
        })
      );
      const updated = [...currentItems, ...uploaded];
      setItems(updated);
      onItemsChange(updated);
    } catch (err) {
      console.error('[MediaUpload] upload error:', err);
      toast.error('Failed to upload media. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    await uploadFiles(files, items);
    e.target.value = '';
  };

  const handleRemove = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    onItemsChange(updated);
  };

  const handleCaptured = async (file: File) => {
    await uploadFiles([file], items);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium block">
        Upload Evidence{' '}
        <span className="text-gray-400 text-xs">
          (image, video, or voice note — multiple allowed)
        </span>
      </label>

      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="border rounded-lg p-3 bg-gray-50 space-y-2">
              {item.type === 'image' && (
                <img
                  src={item.url}
                  alt="Evidence"
                  className="w-full max-h-48 object-contain rounded"
                />
              )}
              {item.type === 'video' && (
                <video
                  src={item.url}
                  controls
                  className="w-full max-h-48 rounded"
                />
              )}
              {item.type === 'voice' && (
                <div className="flex items-center gap-3 p-3 bg-white rounded border">
                  <Mic className="w-5 h-5 text-primary flex-shrink-0" />
                  <audio src={item.url} controls className="flex-1 h-8" />
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {item.type === 'image' && <ImagePlus className="w-4 h-4" />}
                  {item.type === 'video' && <FileVideo className="w-4 h-4" />}
                  {item.type === 'voice' && <Mic className="w-4 h-4" />}
                  <span className="truncate max-w-xs">{item.name}</span>
                  {isAnalyzing ? (
                    <span className="flex items-center gap-1 text-primary text-xs">
                      <Loader2 className="w-3 h-3 animate-spin" /> Analyzing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-green-600 text-xs">
                      <CheckCircle2 className="w-3 h-3" /> Ready
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  aria-label="Remove"
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload / Add more */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={`w-full rounded-lg border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary hover:text-primary transition-colors disabled:opacity-50 ${items.length > 0 ? 'h-12 border' : 'h-32 border-2'}`}
      >
        {uploading ? (
          <>
            <Loader2
              className={
                items.length > 0
                  ? 'w-4 h-4 animate-spin'
                  : 'w-6 h-6 animate-spin'
              }
            />
            <span className="text-sm">Uploading...</span>
          </>
        ) : items.length === 0 ? (
          <>
            <ImagePlus className="w-6 h-6" />
            <span className="text-sm">
              Click to upload image, video, or voice note
            </span>
            <span className="text-xs text-gray-400">
              Max: 10MB image · 100MB video · 25MB audio
            </span>
          </>
        ) : (
          <span className="text-sm flex items-center gap-2">
            <ImagePlus className="w-4 h-4" /> Add more media
          </span>
        )}
      </button>

      {/* Camera capture buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() =>
            isMobileDevice()
              ? nativeCameraRef.current?.click()
              : setShowPhotoCapture(true)
          }
          disabled={uploading}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
        >
          <Camera className="w-4 h-4" /> Take Photo
        </button>
        <button
          type="button"
          onClick={() => setShowVideoRecorder(true)}
          disabled={uploading}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
        >
          <Video className="w-4 h-4" /> Record Video
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*,audio/*"
        multiple
        className="hidden"
        onChange={handleChange}
      />
      <input
        ref={nativeCameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />

      {showPhotoCapture && (
        <PhotoCaptureModal
          onCaptured={handleCaptured}
          onClose={() => setShowPhotoCapture(false)}
        />
      )}
      {showVideoRecorder && (
        <VideoRecorderModal
          onRecorded={handleCaptured}
          onClose={() => setShowVideoRecorder(false)}
        />
      )}
    </div>
  );
};

// ─── Main Form ────────────────────────────────────────────────────────────────

const UaUcNearMissForm = () => {
  const router = useRouter();
  const { firstName, lastName } = useUser();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  const now = new Date();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<UaUcNearMissFormType>({
    resolver: zodResolver(UaUcNearMissSchema),
    defaultValues: {
      status: 'Open',
      observation_type: undefined,
      ua_classifications: [],
      uc_classifications: []
    }
  });

  const observationType = watch('observation_type');
  const whatHappened = watch('what_happened');
  const equipmentInvolved = watch('equipment_involved');

  const showGeneratedSection =
    Boolean(observationType) &&
    (mediaItems.length > 0 ||
      Boolean(whatHappened) ||
      Boolean(equipmentInvolved));

  const clearGeneratedFields = () => {
    setValue('what_happened', '');
    setValue('equipment_involved', '');

    setValue('ua_classifications', []);
    setValue('ua_other', '');
    setValue('action_taken', '');

    setValue('uc_classifications', []);
    setValue('uc_other', '');
    setValue('uc_severity', undefined);
    setValue('uc_temporary_controls', '');

    setValue('nm_potential_injury', '');
    setValue('nm_what_could_happen', '');
    setValue('nm_severity', undefined);
  };

  // ── AI Analysis trigger ────────────────────────────────────────────────────

  const runAiAnalysis = async (
    type: UaUcNearMissFormType['observation_type'],
    items: MediaItem[]
  ) => {
    if (!type || items.length === 0) return;

    clearGeneratedFields();
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/generate-ua-uc-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media_items: items.map(i => ({ url: i.url, type: i.type })),
          observation_type: type
        })
      });
      const json = await res.json();
      if (json.success) {
        const analysis: UaUcAiAnalysisResponse = json.data;

        setValue('what_happened', analysis.what_happened);
        setValue('equipment_involved', analysis.equipment_involved);

        if (type === 'UA') {
          setValue('ua_classifications', analysis.ua_classifications ?? []);
          setValue('ua_other', analysis.ua_other ?? '');
          setValue('action_taken', analysis.action_taken ?? '');
        } else if (type === 'UC') {
          setValue('uc_classifications', analysis.uc_classifications ?? []);
          setValue('uc_other', analysis.uc_other ?? '');
          setValue('uc_severity', analysis.uc_severity);
          setValue(
            'uc_temporary_controls',
            analysis.uc_temporary_controls ?? ''
          );
        } else if (type === 'NearMiss') {
          setValue('nm_potential_injury', analysis.nm_potential_injury ?? '');
          setValue('nm_what_could_happen', analysis.nm_what_could_happen ?? '');
          setValue('nm_severity', analysis.nm_severity);
        }

        toast.success('Safezy classification complete');
      } else if (res.status === 429) {
        toast('Safezy quota exceeded. Please try again later.');
      } else {
        toast('Safezy analysis unavailable. Please try again.');
      }
    } catch {
      toast.error('Safezy analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleItemsChange = async (items: MediaItem[]) => {
    setMediaItems(items);

    // Keep this as fallback submission metadata; it is not shown in the AI section.
    if (items.length === 1) {
      setValue('activity_at_time', formatDateTime(new Date()));
    }

    await runAiAnalysis(observationType, items);
  };

  useEffect(() => {
    if (!observationType || mediaItems.length === 0) return;
    void runAiAnalysis(observationType, mediaItems);
  }, [observationType]);

  // ── Submit ─────────────────────────────────────────────────────────────────

  const onSubmit = async (data: UaUcNearMissFormType) => {
    setIsSubmitting(true);
    try {
      const { media: _media, media_type: _mt, ...rest } = data;
      const res = await submitUaUcReport(
        rest,
        mediaItems.map(i => i.url),
        mediaItems.map(i => i.type)
      );

      if (res.success && res.data) {
        toast.success('Report submitted successfully');
        router.push(`/ehs/ua-uc-near-miss/${res.data.id}`);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 max-w-3xl mx-auto"
    >
      {/* ── SECTION 1: Basic Information ── */}
      <div>
        <SectionHeader number="1" title="Basic Information" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-500">
              Reported By
            </label>
            <p className="text-sm bg-gray-50 border rounded-md px-3 py-2 text-gray-700">
              {firstName && lastName ? `${firstName} ${lastName}` : '—'}
            </p>
          </div>
          <div className="md:col-span-2">
            <InputFieldWithLabel
              label="Location / Department"
              required
              placeholder="e.g. Warehouse B, Production Floor"
              errorText={errors.location_department?.message}
              {...register('location_department')}
            />
          </div>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* ── SECTION 2: Type of Observation ── */}
      <div>
        <SectionHeader
          number="2"
          title="Type of Observation"
          subtitle="Select one type"
        />
        <Controller
          name="observation_type"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col sm:flex-row gap-3">
              {OBSERVATION_TYPES.map(({ value, label }) => (
                <label
                  key={value}
                  className={`flex-1 flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer transition-colors ${
                    field.value === value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    className="accent-primary"
                    checked={field.value === value}
                    onChange={() => field.onChange(value)}
                  />
                  <span className="text-sm font-medium">{label}</span>
                </label>
              ))}
            </div>
          )}
        />
        {errors.observation_type && (
          <p className="text-sm text-red-500 mt-2">
            {errors.observation_type.message}
          </p>
        )}
      </div>

      <hr className="border-gray-200" />

      {/* ── SECTION 3: Media Upload ── */}
      <div>
        <SectionHeader
          number="3"
          title="Upload Evidence"
          subtitle="Upload an image, video, or voice note — Safezy will automatically classify the observation."
        />
        <MediaUpload
          onItemsChange={handleItemsChange}
          isAnalyzing={isAnalyzing}
        />
        {isAnalyzing && (
          <p className="text-sm text-primary mt-3 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Safezy is analyzing and classifying your observation...
          </p>
        )}
        {!observationType && (
          <p className="text-xs text-gray-400 mt-2 italic">
            Select a type of observation first, then upload evidence for Safezy
            classification.
          </p>
        )}
      </div>

      {/* ── SECTION 4: AI-generated details ── */}
      {showGeneratedSection && (
        <>
          <hr className="border-gray-200" />
          <div>
            <SectionHeader
              number="4"
              title="Safezy Generated Details"
              subtitle="Everything below stays on this page so the user can review and edit before submitting."
            />
            <div className="space-y-5">
              <TextareaWithLabel
                label="What Happened / Observed"
                rows={3}
                placeholder="Safezy-generated summary or manual description"
                {...register('what_happened')}
              />

              <InputFieldWithLabel
                label="Equipment Involved"
                placeholder="Equipment, tools, or materials involved"
                {...register('equipment_involved')}
              />

              {observationType === 'UA' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      UA Classification
                    </label>
                    <Controller
                      name="ua_classifications"
                      control={control}
                      render={({ field }) => (
                        <MultiSelectChips
                          value={field.value ?? []}
                          options={UA_CLASSIFICATIONS}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>

                  <TextareaWithLabel
                    label="UA Other"
                    rows={3}
                    placeholder="Add a custom unsafe act if the suggested options do not fully match"
                    {...register('ua_other')}
                  />

                  <TextareaWithLabel
                    label="Immediate Corrective Action"
                    rows={3}
                    placeholder="Recommended or manually updated immediate action"
                    {...register('action_taken')}
                  />
                </>
              )}

              {observationType === 'UC' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      UC Classification
                    </label>
                    <Controller
                      name="uc_classifications"
                      control={control}
                      render={({ field }) => (
                        <MultiSelectChips
                          value={field.value ?? []}
                          options={UC_CLASSIFICATIONS}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>

                  <TextareaWithLabel
                    label="UC Other"
                    rows={3}
                    placeholder="Add a custom unsafe condition if the suggested options do not fully match"
                    {...register('uc_other')}
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Risk Severity
                    </label>
                    <Controller
                      name="uc_severity"
                      control={control}
                      render={({ field }) => (
                        <SeverityButtons
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>

                  <TextareaWithLabel
                    label="Temporary Controls Applied"
                    rows={3}
                    placeholder="Describe any immediate temporary controls applied to reduce the risk"
                    {...register('uc_temporary_controls')}
                  />
                </>
              )}

              {observationType === 'NearMiss' && (
                <>
                  <InputFieldWithLabel
                    label="Potential Injury"
                    placeholder="Potential injury that could have resulted"
                    {...register('nm_potential_injury')}
                  />

                  <TextareaWithLabel
                    label="What Could Happen"
                    rows={3}
                    placeholder="Describe the potential outcome if the near miss became an incident"
                    {...register('nm_what_could_happen')}
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Potential Severity
                    </label>
                    <Controller
                      name="nm_severity"
                      control={control}
                      render={({ field }) => (
                        <SeverityButtons
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Submit ── */}
      <div className="flex justify-end pt-2 pb-8">
        <Button
          type="submit"
          disabled={isSubmitting || isAnalyzing}
          className="px-8"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting...
            </>
          ) : (
            'Submit Report'
          )}
        </Button>
      </div>
    </form>
  );
};

export default UaUcNearMissForm;
