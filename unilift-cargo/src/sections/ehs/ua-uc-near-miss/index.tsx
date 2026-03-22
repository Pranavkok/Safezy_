'use client';

import React, { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import { useUser } from '@/context/UserContext';
import {
  OBSERVATION_TYPES,
  UaUcNearMissSchema
} from '@/validations/contractor/add-ua-uc-near-miss';
import { UaUcNearMissFormType, MediaType, UaUcAiAnalysisResponse } from '@/types/ehs.types';
import { submitUaUcReport } from '@/actions/contractor/ua-uc-near-miss';
import { uploadFile } from '@/utils';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ImagePlus, Loader2, FileVideo, Mic, X, CheckCircle2 } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function detectMediaType(file: File): MediaType {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  return 'voice';
}

function formatDateTime(date: Date) {
  return date.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
}

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader = ({ number, title, subtitle }: { number: string; title: string; subtitle?: string }) => (
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

// ─── Media Upload ─────────────────────────────────────────────────────────────

const MediaUpload = ({
  onMediaReady,
  isAnalyzing
}: {
  onMediaReady: (file: File, url: string, type: MediaType) => void;
  isAnalyzing: boolean;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<{ url: string; type: MediaType; name: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const type = detectMediaType(file);
    setUploading(true);

    try {
      const publicUrl = await uploadFile(file, 'ehs-ua-uc-media', 'media');
      setPreview({ url: publicUrl, type, name: file.name });
      onMediaReady(file, publicUrl, type);
    } catch {
      toast.error('Failed to upload media. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemove = () => {
    setPreview(null);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium block">
        Upload Evidence <span className="text-gray-400 text-xs">(image, video, or voice note)</span>
      </label>

      {!preview ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-32 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm">Uploading...</span>
            </>
          ) : (
            <>
              <ImagePlus className="w-6 h-6" />
              <span className="text-sm">Click to upload image, video, or voice note</span>
              <span className="text-xs text-gray-400">Max: 10MB image · 100MB video · 25MB audio</span>
            </>
          )}
        </button>
      ) : (
        <div className="border rounded-lg p-3 bg-gray-50 space-y-2">
          {preview.type === 'image' && (
            <img src={preview.url} alt="Evidence" className="w-full max-h-48 object-contain rounded" />
          )}
          {preview.type === 'video' && (
            <video src={preview.url} controls className="w-full max-h-48 rounded" />
          )}
          {preview.type === 'voice' && (
            <div className="flex items-center gap-3 p-3 bg-white rounded border">
              <Mic className="w-5 h-5 text-primary flex-shrink-0" />
              <audio src={preview.url} controls className="flex-1 h-8" />
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {preview.type === 'image' && <ImagePlus className="w-4 h-4" />}
              {preview.type === 'video' && <FileVideo className="w-4 h-4" />}
              {preview.type === 'voice' && <Mic className="w-4 h-4" />}
              <span className="truncate max-w-xs">{preview.name}</span>
              {isAnalyzing ? (
                <span className="flex items-center gap-1 text-primary text-xs">
                  <Loader2 className="w-3 h-3 animate-spin" /> Classifying...
                </span>
              ) : (
                <span className="flex items-center gap-1 text-green-600 text-xs">
                  <CheckCircle2 className="w-3 h-3" /> AI classification done
                </span>
              )}
            </div>
            <button type="button" onClick={handleRemove} className="text-gray-400 hover:text-red-500">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*,audio/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
};

// ─── Main Form ────────────────────────────────────────────────────────────────

const UaUcNearMissForm = () => {
  const router = useRouter();
  const { firstName, lastName } = useUser();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<MediaType | null>(null);

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

  // ── AI Analysis trigger ────────────────────────────────────────────────────

  const handleMediaReady = async (file: File, url: string, type: MediaType) => {
    setMediaUrl(url);
    setMediaType(type);
    setValue('activity_at_time', formatDateTime(new Date()));

    if (!observationType) return;

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/generate-ua-uc-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media_url: url, media_type: type, observation_type: observationType })
      });
      const json = await res.json();
      if (json.success) {
        const analysis: UaUcAiAnalysisResponse = json.data;

        // Set common fields
        setValue('what_happened', analysis.what_happened);
        setValue('equipment_involved', analysis.equipment_involved);

        // Set classification fields per type
        if (observationType === 'UA') {
          setValue('ua_classifications', analysis.ua_classifications ?? []);
          setValue('ua_other', analysis.ua_other ?? '');
          setValue('action_taken', analysis.action_taken ?? '');
        } else if (observationType === 'UC') {
          setValue('uc_classifications', analysis.uc_classifications ?? []);
          setValue('uc_other', analysis.uc_other ?? '');
        } else if (observationType === 'NearMiss') {
          setValue('nm_potential_injury', analysis.nm_potential_injury ?? '');
          setValue('nm_what_could_happen', analysis.nm_what_could_happen ?? '');
          setValue('nm_severity', analysis.nm_severity);
        }

        toast.success('AI classification complete');
      } else if (res.status === 429) {
        toast.warning('AI quota exceeded. Please try again later.');
      } else {
        toast.warning('AI analysis unavailable. Please try again.');
      }
    } catch {
      toast.error('AI analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const onSubmit = async (data: UaUcNearMissFormType) => {
    setIsSubmitting(true);
    try {
      const { media: _media, media_type: _mt, ...rest } = data;
      const res = await submitUaUcReport(rest, mediaUrl, mediaType);

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto">

      {/* ── SECTION 1: Basic Information ── */}
      <div>
        <SectionHeader
          number="1"
          title="Basic Information"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-500">Reported By</label>
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
          <p className="text-sm text-red-500 mt-2">{errors.observation_type.message}</p>
        )}
      </div>

      <hr className="border-gray-200" />

      {/* ── SECTION 3: Media Upload ── */}
      <div>
        <SectionHeader
          number="3"
          title="Upload Evidence"
          subtitle="Upload an image, video, or voice note — AI will automatically classify the observation."
        />
        <MediaUpload onMediaReady={handleMediaReady} isAnalyzing={isAnalyzing} />
        {isAnalyzing && (
          <p className="text-sm text-primary mt-3 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            AI is analyzing and classifying your observation...
          </p>
        )}
        {!observationType && (
          <p className="text-xs text-gray-400 mt-2 italic">
            Select a type of observation first, then upload evidence for AI classification.
          </p>
        )}
      </div>

      {/* ── Submit ── */}
      <div className="flex justify-end pt-2 pb-8">
        <Button type="submit" disabled={isSubmitting || isAnalyzing} className="px-8">
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting...</>
          ) : (
            'Submit Report'
          )}
        </Button>
      </div>

    </form>
  );
};

export default UaUcNearMissForm;
