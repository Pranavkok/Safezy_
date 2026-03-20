'use client';

import React, { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { IncidentPage1Schema } from '@/validations/contractor/add-incident-analysis';
import { IncidentPage1Type } from '@/types/ehs.types';
import { IncidentAnalysisType } from '@/types/index.types';
import { savePage1 } from '@/actions/contractor/incident-analysis';
import { uploadMultipleFiles } from '@/utils';
import { AppRoutes } from '@/constants/AppRoutes';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ImagePlus, X } from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────

const INCIDENT_TYPE_OPTIONS = [
  'Fire',
  'Vehicle Collision',
  'Equipment Damage',
  'Fall from Height',
  'Chemical Spill',
  'Electrical Incident',
  'Struck by Object',
  'Caught In/Between',
  'Slip/Trip/Fall',
  'Near Miss',
  'Other'
];

const SEVERITY_OPTIONS = [
  'Near Miss',
  'First Aid',
  'LTI',
  'Major',
  'Fatal'
];

const ACTIVITY_TYPE_OPTIONS = [
  'Routine Operation',
  'Non-routine Operation',
  'Routine Maintenance',
  'Non-routine Maintenance',
  'Emergency'
];

const FAILURE_TYPE_OPTIONS = [
  'Equipment',
  'Process',
  'Human action',
  'Environment',
  'External Disturbance'
];

const INDIA_LOCATIONS = [
  // Major Cities
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Ahmedabad', 'Chennai',
  'Kolkata', 'Surat', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur',
  'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad',
  'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik',
  'Faridabad', 'Meerut', 'Rajkot', 'Varanasi', 'Srinagar', 'Aurangabad',
  'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 'Howrah', 'Coimbatore',
  'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur',
  'Kota', 'Chandigarh', 'Guwahati', 'Solapur', 'Hubli', 'Bareilly',
  'Moradabad', 'Mysuru',
  // States & UTs
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal', 'Delhi (NCT)', 'Jammu & Kashmir', 'Ladakh'
];

// ─── Location Combobox ────────────────────────────────────────────────────────

const LocationCombobox = ({
  value,
  onChange,
  error
}: {
  value: string;
  onChange: (val: string) => void;
  error?: string;
}) => {
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query.length > 0
    ? INDIA_LOCATIONS.filter(l => l.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];

  return (
    <div className="space-y-1" ref={containerRef}>
      <label className="text-sm font-medium">
        Location <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Type city or state..."
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
        {open && filtered.length > 0 && (
          <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-auto">
            {filtered.map(loc => (
              <li
                key={loc}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-orange-50 hover:text-primary"
                onMouseDown={() => {
                  setQuery(loc);
                  onChange(loc);
                  setOpen(false);
                }}
              >
                {loc}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

// ─── Image Upload ─────────────────────────────────────────────────────────────

const ImageUpload = ({
  files,
  onChange
}: {
  files: File[];
  onChange: (files: File[]) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const previews = files.map(f => URL.createObjectURL(f));

  const handleAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    onChange([...files, ...selected]);
    e.target.value = '';
  };

  const handleRemove = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Evidence Images (Optional)</label>
      <div className="flex flex-wrap gap-3">
        {previews.map((src, i) => (
          <div key={i} className="relative w-20 h-20 rounded-md overflow-hidden border">
            <img src={src} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(i)}
              className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-20 h-20 rounded-md border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors"
        >
          <ImagePlus className="w-5 h-5" />
          <span className="text-xs mt-1">Add</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        className="hidden"
        onChange={handleAdd}
      />
    </div>
  );
};

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader = ({ number, title, subtitle }: { number: string; title: string; subtitle: string }) => (
  <div className="mb-4">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
        SECTION {number}
      </span>
    </div>
    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
    <p className="text-sm text-gray-500">{subtitle}</p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const IncidentPage1Step = ({
  incidentDetails
}: {
  incidentDetails?: IncidentAnalysisType;
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<IncidentPage1Type>({
    resolver: zodResolver(IncidentPage1Schema),
    defaultValues: {
      title: incidentDetails?.title ?? '',
      incident_type: incidentDetails?.incident_type ?? '',
      severity_level: incidentDetails?.severity_level ?? '',
      location: incidentDetails?.location ?? '',
      date: incidentDetails?.date ?? '',
      time: incidentDetails?.time ?? '',
      activity_type: incidentDetails?.activity_type ?? '',
      pre_incident_activity: incidentDetails?.pre_incident_activity ?? '',
      failure_type: incidentDetails?.failure_type ?? '',
      narrative: incidentDetails?.narrative ?? '',
      how_stopped: incidentDetails?.how_stopped ?? ''
    }
  });

  const onSubmit = async (data: IncidentPage1Type) => {
    try {
      setIsLoading(true);

      // Upload images if any
      let uploadedImages: { publicUrl: string }[] = [];
      if (imageFiles.length > 0) {
        uploadedImages = await uploadMultipleFiles(imageFiles, 'ehs', 'img');
      }

      const res = await savePage1(data, uploadedImages, incidentDetails?.id);
      if (res.success && res.id) {
        toast.success(res.message);
        router.replace(
          `${AppRoutes.EHS_INCIDENT_ANALYSIS_UPDATE(res.id)}?stepId=2`
        );
      } else if (!res.success) {
        toast.error(res.message);
      }
    } catch (err) {
      console.error('Error submitting page 1:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* ── Section 1: Incident Snapshot ── */}
      <div>
        <SectionHeader
          number="1"
          title="Incident Snapshot (Facts)"
          subtitle="Establish context, severity and narration of the incident"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <InputFieldWithLabel
              label="Incident Title"
              required
              placeholder="Enter a brief title for this incident"
              errorText={errors.title?.message}
              {...register('title')}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">
              Incident Type <span className="text-red-500">*</span>
            </label>
            <Controller
              name="incident_type"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select incident type" />
                  </SelectTrigger>
                  <SelectContent>
                    {INCIDENT_TYPE_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.incident_type && (
              <p className="text-sm text-red-500">{errors.incident_type.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">
              Severity <span className="text-red-500">*</span>
            </label>
            <Controller
              name="severity_level"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEVERITY_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.severity_level && (
              <p className="text-sm text-red-500">{errors.severity_level.message}</p>
            )}
          </div>

          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <LocationCombobox
                value={field.value}
                onChange={field.onChange}
                error={errors.location?.message}
              />
            )}
          />

          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Date Of Incident <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={field.value ?? ''}
                  onChange={e => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
              </div>
            )}
          />

          <Controller
            name="time"
            control={control}
            render={({ field }) => (
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Time Of Incident <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={field.value ?? ''}
                  onChange={e => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  autoComplete="off"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                {errors.time && <p className="text-sm text-red-500">{errors.time.message}</p>}
              </div>
            )}
          />
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* ── Section 2: Incident Narration ── */}
      <div>
        <SectionHeader
          number="2"
          title="Incident Narration"
          subtitle="Describe what happened in detail"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">
              Activity Type <span className="text-red-500">*</span>
            </label>
            <Controller
              name="activity_type"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPE_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.activity_type && (
              <p className="text-sm text-red-500">{errors.activity_type.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">
              What failed or went wrong? <span className="text-red-500">*</span>
            </label>
            <Controller
              name="failure_type"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select failure type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FAILURE_TYPE_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.failure_type && (
              <p className="text-sm text-red-500">{errors.failure_type.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <InputFieldWithLabel
              label="What was happening in the few minutes before the incident took place?"
              required
              placeholder="Describe the process or tasks being carried out just before the incident"
              errorText={errors.pre_incident_activity?.message}
              {...register('pre_incident_activity')}
            />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-sm font-medium">
              Describe the incident <span className="text-red-500">*</span>
            </label>
            <Textarea
              className="w-full h-32"
              placeholder="Provide a detailed description of what happened..."
              {...register('narrative')}
            />
            {errors.narrative && (
              <p className="text-sm text-red-500">{errors.narrative.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <InputFieldWithLabel
              label="How was it stopped?"
              required
              placeholder="Describe how the incident was controlled or stopped"
              errorText={errors.how_stopped?.message}
              {...register('how_stopped')}
            />
          </div>

          <div className="md:col-span-2">
            <ImageUpload files={imageFiles} onChange={setImageFiles} />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isLoading} className="px-8">
          {isLoading ? 'Saving...' : 'Save & Next →'}
        </Button>
      </div>
    </form>
  );
};

export default IncidentPage1Step;
