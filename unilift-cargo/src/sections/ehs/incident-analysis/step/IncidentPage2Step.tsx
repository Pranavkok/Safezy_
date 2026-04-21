'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { IncidentPage2Schema } from '@/validations/contractor/add-incident-analysis';
import { IncidentPage2Type } from '@/types/ehs.types';
import { IncidentAnalysisType } from '@/types/index.types';
import { savePage2 } from '@/actions/contractor/incident-analysis';
import { AppRoutes } from '@/constants/AppRoutes';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// ─── Constants ────────────────────────────────────────────────────────────────

const CONTROLS_OPTIONS = [
  'Guarding', 'SOP', 'Training', 'Supervision', 'Maintenance', 'PPE', 'None'
];

const PRESSURE_OPTIONS = [
  'Time', 'Production', 'Manpower', 'Layout', 'Visibility', 'None'
];

const SEVERITY_OPTIONS = [
  'Minor', 'Moderate', 'Serious', 'Major', 'Critical/Fatal'
];

// ─── Multi Checkbox ───────────────────────────────────────────────────────────

const MultiCheckbox = ({
  options,
  value,
  onChange,
  error
}: {
  options: string[];
  value: string[];
  onChange: (val: string[]) => void;
  error?: string;
}) => {
  const toggle = (opt: string) => {
    if (opt === 'None') {
      onChange(['None']);
      return;
    }
    const without = value.filter(v => v !== 'None');
    if (without.includes(opt)) {
      onChange(without.filter(v => v !== opt));
    } else {
      onChange([...without, opt]);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mt-1">
        {options.map(opt => {
          const checked = value.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                checked
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};

// ─── Yes/No Radio ─────────────────────────────────────────────────────────────

const YesNoRadio = ({
  value,
  onChange,
  error
}: {
  value: boolean | undefined;
  onChange: (val: boolean) => void;
  error?: string;
}) => (
  <div>
    <div className="flex gap-4 mt-1">
      {[true, false].map(v => (
        <label key={String(v)} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={value === v}
            onChange={() => onChange(v)}
            className="accent-primary w-4 h-4"
          />
          <span className="text-sm">{v ? 'Yes' : 'No'}</span>
        </label>
      ))}
    </div>
    {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
  </div>
);

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

const IncidentPage2Step = ({
  incidentDetails
}: {
  incidentDetails: IncidentAnalysisType;
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors }
  } = useForm<IncidentPage2Type>({
    resolver: zodResolver(IncidentPage2Schema),
    defaultValues: {
      controls_failed: (incidentDetails.controls_failed as string[]) || [],
      sop_deviation: incidentDetails.sop_deviation ?? undefined,
      sop_deviation_remarks: (incidentDetails as any).sop_deviation_remarks ?? '',
      authorization_competence: incidentDetails.authorization_competence ?? undefined,
      authorization_competence_remarks: (incidentDetails as any).authorization_competence_remarks ?? '',
      pressure_constraints: (incidentDetails.pressure_constraints as string[]) || [],
      has_incident_occurred: (incidentDetails as any).has_incident_occurred ?? undefined,
      historical_incident_date: incidentDetails.historical_incident_date ?? '',
      past_incidents_text: incidentDetails.past_incidents_text ?? '',
      impact_description: incidentDetails.impact_description ?? '',
      worst_case_potential: incidentDetails.worst_case_potential ?? '',
      immediate_actions: incidentDetails.immediate_actions ?? '',
      initial_investigation_findings: incidentDetails.initial_investigation_findings ?? ''
    }
  });

  const sopDeviation = watch('sop_deviation');
  const authCompetence = watch('authorization_competence');
  const hasIncidentOccurred = watch('has_incident_occurred');

  const onSubmit = async (data: IncidentPage2Type) => {
    try {
      setIsLoading(true);
      toast.loading('Safezy Generating CAPA report...', { id: 'capa' });

      // Fetch current full incident details for CAPA generation
      const capaResponse = await fetch('/api/generate-capa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...incidentDetails, ...data })
      });

      const capaResult = await capaResponse.json();

      if (!capaResponse.ok || !capaResult.success) {
        toast.dismiss('capa');
        toast.error(
          capaResult.message ||
            capaResult.error ||
            'Failed to generate AI analysis. Please try again.'
        );
        return;
      }

      const res = await savePage2(
        data,
        incidentDetails.id,
        capaResult.data.corrective.points,
        capaResult.data.preventive.points,
        capaResult.data.severity_level,
        capaResult.data.five_whys_analysis,
        capaResult.data.flowchart.points,
        capaResult.data.immediate_cause,
        capaResult.data.contributing_factors,
        capaResult.data.root_causes,
        capaResult.data.system_gaps,
        capaResult.data.rca_conclusion
      );

      toast.dismiss('capa');

      if (res.success) {
        toast.success('Report generated successfully!');
        router.replace(AppRoutes.EHS_INCIDENT_ANALYSIS_REPORT(incidentDetails.id));
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.dismiss('capa');
      console.error('Error submitting page 2:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* ── Section 3: Why the System Allowed It ── */}
      <div>
        <SectionHeader
          number="3"
          title="Why the System Allowed It"
          subtitle="Force system thinking without asking 'why' 5 times"
        />
        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium">
              Controls present but failed <span className="text-red-500">*</span>
            </label>
            <Controller
              name="controls_failed"
              control={control}
              render={({ field }) => (
                <MultiCheckbox
                  options={CONTROLS_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.controls_failed?.message}
                />
              )}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">
              Any deviation from SOP? <span className="text-red-500">*</span>
            </label>
            <Controller
              name="sop_deviation"
              control={control}
              render={({ field }) => (
                <YesNoRadio
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.sop_deviation?.message}
                />
              )}
            />
            {sopDeviation === true && (
              <Textarea
                className="mt-2"
                placeholder="Describe the deviation (optional)..."
                {...register('sop_deviation_remarks')}
              />
            )}
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">
              Authorization / competence verified? <span className="text-red-500">*</span>
            </label>
            <Controller
              name="authorization_competence"
              control={control}
              render={({ field }) => (
                <YesNoRadio
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.authorization_competence?.message}
                />
              )}
            />
            {authCompetence === true && (
              <Textarea
                className="mt-2"
                placeholder="Describe the authorization details (optional)..."
                {...register('authorization_competence_remarks')}
              />
            )}
          </div>

          <div>
            <label className="text-sm font-medium">
              Any pressure or constraint? <span className="text-red-500">*</span>
            </label>
            <Controller
              name="pressure_constraints"
              control={control}
              render={({ field }) => (
                <MultiCheckbox
                  options={PRESSURE_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.pressure_constraints?.message}
                />
              )}
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">
              Has any incident happened? <span className="text-red-500">*</span>
            </label>
            <Controller
              name="has_incident_occurred"
              control={control}
              render={({ field }) => (
                <YesNoRadio
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.has_incident_occurred?.message}
                />
              )}
            />
          </div>

          {hasIncidentOccurred === true && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputFieldWithLabel
                label="Historical Incident Date"
                type="date"
                errorText={errors.historical_incident_date?.message}
                {...register('historical_incident_date')}
              />

              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Have there been incidents of a similar nature at the same location in the past?
                </label>
                <Textarea
                  placeholder="Provide details if applicable..."
                  className="h-24"
                  {...register('past_incidents_text')}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* ── Section 4: Impact & Immediate Action ── */}
      <div>
        <SectionHeader
          number="4"
          title="Impact & Immediate Action"
          subtitle="Anchor CAPA to reality"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputFieldWithLabel
            label="Describe Impact of incident"
            required
            placeholder="What was the impact on people, property or environment?"
            errorText={errors.impact_description?.message}
            {...register('impact_description')}
          />

          <div className="space-y-1">
            <label className="text-sm font-medium">
              Worst-Case Potential <span className="text-red-500">*</span>
            </label>
            <Controller
              name="worst_case_potential"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select worst-case potential" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEVERITY_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.worst_case_potential && (
              <p className="text-sm text-red-500">{errors.worst_case_potential.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <InputFieldWithLabel
              label="Corrective Measures"
              required
              placeholder="What corrective measures were taken after the incident?"
              errorText={errors.immediate_actions?.message}
              {...register('immediate_actions')}
            />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-sm font-medium">
              Any findings from initial investigations
            </label>
            <Textarea
              placeholder="Enter any findings from the initial investigation..."
              className="min-h-28"
              {...register('initial_investigation_findings')}
            />
            {errors.initial_investigation_findings && (
              <p className="text-sm text-red-500">
                {errors.initial_investigation_findings.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          className="px-8"
          onClick={() =>
            router.replace(
              `${AppRoutes.EHS_INCIDENT_ANALYSIS_UPDATE(incidentDetails.id)}?stepId=1`
            )
          }
        >
          ← Previous
        </Button>
        <Button type="submit" disabled={isLoading} className="px-8">
          {isLoading ? 'Generating Report...' : 'Generate Report →'}
        </Button>
      </div>
    </form>
  );
};

export default IncidentPage2Step;
