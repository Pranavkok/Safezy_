'use client';

import React, { useState } from 'react';
import { IncidentAnalysisWithImageType } from '@/types/index.types';
import {
  ContributingFactorsType,
  FiveWhysAnalysisJsonType,
  FlowchartJsonType,
  RootCausesJsonType
} from '@/types/ehs.types';
import { updateIncidentReportFull } from '@/actions/contractor/incident-analysis';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';

// ─── Layout helpers (mirrors viewer) ─────────────────────────────────────────

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-sm font-semibold text-gray-700 bg-white px-3 py-2 rounded mt-6 mb-3">
    {children}
  </h3>
);

const PageTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xl font-bold text-primary border-b-2 border-primary pb-2 mb-4">
    {children}
  </h2>
);

const FieldGroup = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white rounded-md p-4 mb-4">{children}</div>
);

const FieldGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">{children}</div>
);

const Divider = () => <hr className="border-dashed border-gray-300 my-6" />;

const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <p className="text-[10px] uppercase text-gray-500 font-medium mb-1">
    {children}{required && <span className="text-red-400 ml-0.5">*</span>}
  </p>
);

const EditInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
  />
);

const EditTextarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    rows={3}
    {...props}
    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-y"
  />
);

// ─── Multi-chip selector ──────────────────────────────────────────────────────

const ChipSelector = ({
  options,
  value,
  onChange
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) => {
  const toggle = (opt: string) => {
    if (opt === 'None') { onChange(['None']); return; }
    const without = value.filter(v => v !== 'None');
    onChange(without.includes(opt) ? without.filter(v => v !== opt) : [...without, opt]);
  };
  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`px-3 py-1 rounded-full text-xs border transition-colors ${
            value.includes(opt)
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
};

// ─── Yes / No toggle ─────────────────────────────────────────────────────────

const YesNoToggle = ({
  value,
  onChange
}: {
  value: boolean | null | undefined;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex gap-3 mt-1">
    {[true, false].map(v => (
      <button
        key={String(v)}
        type="button"
        onClick={() => onChange(v)}
        className={`px-4 py-1 rounded-full text-sm border transition-colors ${
          value === v
            ? 'bg-primary text-white border-primary'
            : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
        }`}
      >
        {v ? 'Yes' : 'No'}
      </button>
    ))}
  </div>
);

// ─── Editable string list ─────────────────────────────────────────────────────

const EditableList = ({
  label,
  items,
  onChange,
  placeholder
}: {
  label: string;
  items: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) => {
  const update = (i: number, val: string) => {
    const next = [...items];
    next[i] = val;
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, '']);

  return (
    <div className="mb-3">
      <Label>{label}</Label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <EditInput
              value={item}
              onChange={e => update(i, e.target.value)}
              placeholder={placeholder}
            />
            <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1 text-xs text-primary hover:underline mt-1"
        >
          <Plus size={12} /> Add item
        </button>
      </div>
    </div>
  );
};

// ─── Constants ────────────────────────────────────────────────────────────────

const CONTROLS_OPTIONS = ['Guarding', 'SOP', 'Training', 'Supervision', 'Maintenance', 'PPE', 'None'];
const PRESSURE_OPTIONS = ['Time', 'Production', 'Manpower', 'Layout', 'Visibility', 'None'];
const SEVERITY_OPTIONS = ['Minor', 'Moderate', 'Serious', 'Major', 'Critical/Fatal'];
const INCIDENT_TYPES = ['Near Miss', 'First Aid', 'Medical Treatment', 'Lost Time Injury', 'Fatality', 'Property Damage', 'Environmental', 'Other'];
const ACTIVITY_TYPES = ['Routine', 'Non-Routine', 'Emergency'];
const FAILURE_TYPES = ['Human Error', 'Equipment Failure', 'Process Failure', 'Environmental', 'Other'];

// ─── Main Editor ──────────────────────────────────────────────────────────────

const IncidentReportInlineEditor = ({
  incidentDetails,
  onCancel
}: {
  incidentDetails: IncidentAnalysisWithImageType;
  onCancel: () => void;
}) => {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const fiveWhys = (incidentDetails.viva_analysis as FiveWhysAnalysisJsonType) || { points: [] };
  const flowchartRaw = (incidentDetails.flowchart_points as unknown as FlowchartJsonType[]) || [];
  const cfRaw = (incidentDetails.contributing_factors as ContributingFactorsType) || { people: '', process: '', equipment: '', environment: '' };
  const rcRaw = (incidentDetails.root_causes as RootCausesJsonType) || { points: [] };

  // ── State ──
  const [title, setTitle] = useState(incidentDetails.title ?? '');
  const [incidentType, setIncidentType] = useState(incidentDetails.incident_type ?? '');
  const [incidentTypeOther, setIncidentTypeOther] = useState((incidentDetails as any).incident_type_other ?? '');
  const [severityLevel, setSeverityLevel] = useState(incidentDetails.severity_level ?? '');
  const [location, setLocation] = useState(incidentDetails.location ?? '');
  const [date, setDate] = useState(incidentDetails.date ?? '');
  const [time, setTime] = useState((incidentDetails as any).time ?? '');

  const [activityType, setActivityType] = useState((incidentDetails as any).activity_type ?? '');
  const [failureType, setFailureType] = useState((incidentDetails as any).failure_type ?? '');
  const [failureTypeOther, setFailureTypeOther] = useState((incidentDetails as any).failure_type_other ?? '');
  const [preIncidentActivity, setPreIncidentActivity] = useState(incidentDetails.pre_incident_activity ?? '');
  const [narrative, setNarrative] = useState(incidentDetails.narrative ?? '');
  const [howStopped, setHowStopped] = useState((incidentDetails as any).how_stopped ?? '');

  const [controlsFailed, setControlsFailed] = useState<string[]>((incidentDetails.controls_failed as string[]) || []);
  const [sopDeviation, setSopDeviation] = useState<boolean | null>(incidentDetails.sop_deviation ?? null);
  const [sopDeviationRemarks, setSopDeviationRemarks] = useState((incidentDetails as any).sop_deviation_remarks ?? '');
  const [authCompetence, setAuthCompetence] = useState<boolean | null>(incidentDetails.authorization_competence ?? null);
  const [authCompetenceRemarks, setAuthCompetenceRemarks] = useState((incidentDetails as any).authorization_competence_remarks ?? '');
  const [pressureConstraints, setPressureConstraints] = useState<string[]>((incidentDetails.pressure_constraints as string[]) || []);
  const [hasIncidentOccurred, setHasIncidentOccurred] = useState<boolean | null>((incidentDetails as any).has_incident_occurred ?? null);
  const [historicalIncidentDate, setHistoricalIncidentDate] = useState(incidentDetails.historical_incident_date ?? '');
  const [pastIncidentsText, setPastIncidentsText] = useState(incidentDetails.past_incidents_text ?? '');

  const [impactDescription, setImpactDescription] = useState(incidentDetails.impact_description ?? '');
  const [worstCasePotential, setWorstCasePotential] = useState(incidentDetails.worst_case_potential ?? '');
  const [immediateActions, setImmediateActions] = useState(incidentDetails.immediate_actions ?? '');
  const [initialInvestigationFindings, setInitialInvestigationFindings] = useState(incidentDetails.initial_investigation_findings ?? '');

  const [whyPoints, setWhyPoints] = useState(fiveWhys.points.map(p => ({ ...p })));
  const [immediateCause, setImmediateCause] = useState(incidentDetails.immediate_cause ?? '');
  const [cf, setCf] = useState({ ...cfRaw });
  const [rootCausePoints, setRootCausePoints] = useState(rcRaw.points.map(p => ({ ...p })));
  const [systemGaps, setSystemGaps] = useState<string[]>((incidentDetails.system_gaps as string[]) || []);
  const [rcaConclusion, setRcaConclusion] = useState(incidentDetails.rca_conclusion ?? '');

  const [correctiveActions, setCorrectiveActions] = useState<string[]>((incidentDetails.corrective_actions as string[]) || []);
  const [preventiveActions, setPreventiveActions] = useState<string[]>((incidentDetails.preventive_actions as string[]) || []);
  const [flowchart, setFlowchart] = useState<FlowchartJsonType[]>(flowchartRaw.map(s => ({ ...s })));

  // ── Root cause helpers ──
  const updateRootCause = (i: number, key: 'cause' | 'effect', val: string) => {
    const next = [...rootCausePoints];
    next[i] = { ...next[i], [key]: val };
    setRootCausePoints(next);
  };
  const removeRootCause = (i: number) => setRootCausePoints(rootCausePoints.filter((_, idx) => idx !== i));
  const addRootCause = () => setRootCausePoints([...rootCausePoints, { cause: '', effect: '' }]);

  // ── Flowchart helpers ──
  const updateFlowStep = (i: number, key: 'title' | 'description', val: string) => {
    const next = [...flowchart];
    next[i] = { ...next[i], [key]: val };
    setFlowchart(next);
  };
  const removeFlowStep = (i: number) => setFlowchart(flowchart.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, no: idx + 1 })));
  const addFlowStep = () => setFlowchart([...flowchart, { no: flowchart.length + 1, title: '', description: '' }]);

  // ── Why helpers ──
  const updateWhy = (i: number, val: string) => {
    const next = [...whyPoints];
    next[i] = { ...next[i], answer: val };
    setWhyPoints(next);
  };

  // ── Save ──
  const handleSave = async () => {
    setSaving(true);
    const payload = {
      title,
      incident_type: incidentType,
      incident_type_other: incidentType === 'Other' ? incidentTypeOther : null,
      severity_level: severityLevel,
      location,
      date,
      time,
      activity_type: activityType,
      failure_type: failureType,
      failure_type_other: failureType === 'Other' ? failureTypeOther : null,
      pre_incident_activity: preIncidentActivity,
      narrative,
      how_stopped: howStopped,
      controls_failed: controlsFailed,
      sop_deviation: sopDeviation,
      sop_deviation_remarks: sopDeviation ? sopDeviationRemarks : null,
      authorization_competence: authCompetence,
      authorization_competence_remarks: authCompetence ? authCompetenceRemarks : null,
      pressure_constraints: pressureConstraints,
      has_incident_occurred: hasIncidentOccurred,
      historical_incident_date: hasIncidentOccurred ? historicalIncidentDate : null,
      past_incidents_text: hasIncidentOccurred ? pastIncidentsText : null,
      impact_description: impactDescription,
      worst_case_potential: worstCasePotential,
      immediate_actions: immediateActions,
      initial_investigation_findings: initialInvestigationFindings,
      viva_analysis: whyPoints.length > 0 ? { points: whyPoints } : null,
      immediate_cause: immediateCause || null,
      contributing_factors: (cf.people || cf.process || cf.equipment || cf.environment) ? cf : null,
      root_causes: rootCausePoints.length > 0 ? { points: rootCausePoints } : null,
      system_gaps: systemGaps.filter(Boolean),
      rca_conclusion: rcaConclusion || null,
      corrective_actions: correctiveActions.filter(Boolean),
      preventive_actions: preventiveActions.filter(Boolean),
      flowchart_points: flowchart
    };

    const { success } = await updateIncidentReportFull(incidentDetails.id, payload);
    setSaving(false);

    if (success) {
      toast.success('Report saved successfully');
      router.refresh();
      onCancel();
    } else {
      toast.error('Failed to save report. Please try again.');
    }
  };

  return (
    <div className="bg-white font-sans text-gray-900 border border-primary/30 rounded-lg">
      {/* Editor header */}
      <div className="bg-primary/10 border-b border-primary/20 px-6 py-3 rounded-t-lg flex items-center justify-between">
        <p className="text-sm font-semibold text-primary">Editing Report — IR-{incidentDetails.id}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-2">

        {/* ── Page 1 ── */}
        <PageTitle>Incident Assessment Report</PageTitle>

        <SectionTitle>Section 1 — Incident Snapshot</SectionTitle>
        <FieldGroup>
          <div className="mb-3">
            <Label>Incident Title</Label>
            <EditInput value={title} onChange={e => setTitle(e.target.value)} placeholder="Incident title" />
          </div>
          <FieldGrid>
            <div>
              <Label>Incident Type</Label>
              <select
                value={incidentType}
                onChange={e => setIncidentType(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select type</option>
                {INCIDENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {incidentType === 'Other' && (
                <EditInput className="mt-2" value={incidentTypeOther} onChange={e => setIncidentTypeOther(e.target.value)} placeholder="Specify type" />
              )}
            </div>
            <div>
              <Label>Severity</Label>
              <select
                value={severityLevel}
                onChange={e => setSeverityLevel(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select severity</option>
                {SEVERITY_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <Label>Location</Label>
              <EditInput value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" />
            </div>
            <div>
              <Label>Date of Report</Label>
              <EditInput type="date" value={date} readOnly className="cursor-not-allowed bg-muted text-muted-foreground" />
            </div>
            <div>
              <Label>Time of Report</Label>
              <EditInput type="time" value={time} readOnly className="cursor-not-allowed bg-muted text-muted-foreground" />
            </div>
          </FieldGrid>
        </FieldGroup>

        <SectionTitle>Section 2 — Incident Narration</SectionTitle>
        <FieldGroup>
          <FieldGrid>
            <div>
              <Label>Activity Type</Label>
              <select
                value={activityType}
                onChange={e => setActivityType(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select activity</option>
                {ACTIVITY_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <Label>What Failed or Went Wrong</Label>
              <select
                value={failureType}
                onChange={e => setFailureType(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select failure type</option>
                {FAILURE_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              {failureType === 'Other' && (
                <EditInput className="mt-2" value={failureTypeOther} onChange={e => setFailureTypeOther(e.target.value)} placeholder="Specify failure" />
              )}
            </div>
          </FieldGrid>
          <div className="mt-3">
            <Label>What was happening before the incident</Label>
            <EditTextarea value={preIncidentActivity} onChange={e => setPreIncidentActivity(e.target.value)} placeholder="Describe pre-incident activity" />
          </div>
          <div className="mt-3">
            <Label>Incident Description</Label>
            <EditTextarea rows={4} value={narrative} onChange={e => setNarrative(e.target.value)} placeholder="Describe the incident" />
          </div>
          <div className="mt-3">
            <Label>How was it stopped</Label>
            <EditTextarea value={howStopped} onChange={e => setHowStopped(e.target.value)} placeholder="How was the incident stopped" />
          </div>
        </FieldGroup>

        <Divider />

        {/* ── Page 2 ── */}
        <PageTitle>System Analysis &amp; Impact</PageTitle>

        <SectionTitle>Section 3 — Why the System Allowed It</SectionTitle>
        <FieldGroup>
          <div className="mb-4">
            <Label>Controls Present but Failed</Label>
            <ChipSelector options={CONTROLS_OPTIONS} value={controlsFailed} onChange={setControlsFailed} />
          </div>
          <div className="mb-4">
            <Label>Deviation from SOP?</Label>
            <YesNoToggle value={sopDeviation} onChange={setSopDeviation} />
            {sopDeviation === true && (
              <div className="mt-2">
                <EditTextarea value={sopDeviationRemarks} onChange={e => setSopDeviationRemarks(e.target.value)} placeholder="Describe the deviation..." />
              </div>
            )}
          </div>
          <div className="mb-4">
            <Label>Authorization / Competence Verified?</Label>
            <YesNoToggle value={authCompetence} onChange={setAuthCompetence} />
            {authCompetence === true && (
              <div className="mt-2">
                <EditTextarea value={authCompetenceRemarks} onChange={e => setAuthCompetenceRemarks(e.target.value)} placeholder="Describe authorization details..." />
              </div>
            )}
          </div>
          <div className="mb-4">
            <Label>Pressure or Constraints Present</Label>
            <ChipSelector options={PRESSURE_OPTIONS} value={pressureConstraints} onChange={setPressureConstraints} />
          </div>
          <div className="mb-4">
            <Label>Has incident occurred before?</Label>
            <YesNoToggle value={hasIncidentOccurred} onChange={setHasIncidentOccurred} />
          </div>
          {hasIncidentOccurred === true && (
            <FieldGrid>
              <div>
                <Label>Historical Incident Date</Label>
                <EditInput type="date" value={historicalIncidentDate} onChange={e => setHistoricalIncidentDate(e.target.value)} />
              </div>
              <div>
                <Label>Past Similar Incidents</Label>
                <EditTextarea value={pastIncidentsText} onChange={e => setPastIncidentsText(e.target.value)} placeholder="Details of past incidents..." />
              </div>
            </FieldGrid>
          )}
        </FieldGroup>

        <SectionTitle>Section 4 — Impact &amp; Immediate Action</SectionTitle>
        <FieldGroup>
          <div className="mb-3">
            <Label>Described Impact</Label>
            <EditTextarea value={impactDescription} onChange={e => setImpactDescription(e.target.value)} placeholder="Impact on people, property or environment" />
          </div>
          <div className="mb-3">
            <Label>Worst-Case Potential</Label>
            <select
              value={worstCasePotential}
              onChange={e => setWorstCasePotential(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select worst-case potential</option>
              {SEVERITY_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="mb-3">
            <Label>Corrective Measures</Label>
            <EditTextarea value={immediateActions} onChange={e => setImmediateActions(e.target.value)} placeholder="Corrective measures taken after incident" />
          </div>
          <div className="mb-3">
            <Label>Any Findings From Initial Investigations</Label>
            <EditTextarea rows={4} value={initialInvestigationFindings} onChange={e => setInitialInvestigationFindings(e.target.value)} placeholder="Initial investigation findings..." />
          </div>
        </FieldGroup>

        <Divider />

        {/* ── AI sections ── */}
        <PageTitle>10 Whys &amp; Root Cause Analysis (AI Analysis)</PageTitle>

        {whyPoints.length > 0 && (
          <>
            <SectionTitle>10 WHYs Analysis</SectionTitle>
            <FieldGroup>
              <div className="space-y-3">
                {whyPoints.map((point, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="text-xs font-bold text-primary min-w-[28px] pt-2">W{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-400 mb-0.5">{point.question}</p>
                      <EditTextarea
                        rows={2}
                        value={point.answer}
                        onChange={e => updateWhy(i, e.target.value)}
                        placeholder="Answer..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </FieldGroup>
          </>
        )}

        <FieldGroup>
          <Label>Immediate Cause</Label>
          <EditTextarea value={immediateCause} onChange={e => setImmediateCause(e.target.value)} placeholder="Immediate cause of the incident" />
        </FieldGroup>

        <SectionTitle>Contributing Factors</SectionTitle>
        <FieldGroup>
          <FieldGrid>
            {(['people', 'process', 'equipment', 'environment'] as const).map(key => (
              <div key={key}>
                <Label>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                <EditTextarea
                  rows={2}
                  value={cf[key] ?? ''}
                  onChange={e => setCf(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder={`${key} contributing factor...`}
                />
              </div>
            ))}
          </FieldGrid>
        </FieldGroup>

        <SectionTitle>Root Causes (Why-Why Chain)</SectionTitle>
        <div className="border border-gray-200 rounded-md overflow-hidden mb-4 bg-white">
          <div className="grid grid-cols-[1fr_1fr_32px] bg-gray-50 text-[10px] uppercase text-gray-500 font-medium px-3 py-2">
            <span>Cause</span>
            <span>Effect</span>
            <span />
          </div>
          {rootCausePoints.map((point, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_32px] px-3 py-2 gap-2 border-t border-gray-100">
              <EditInput value={point.cause} onChange={e => updateRootCause(i, 'cause', e.target.value)} placeholder="Cause..." />
              <EditInput value={point.effect} onChange={e => updateRootCause(i, 'effect', e.target.value)} placeholder="Effect..." />
              <button type="button" onClick={() => removeRootCause(i)} className="text-red-400 hover:text-red-600 flex items-center">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          <div className="px-3 py-2 border-t border-gray-100">
            <button type="button" onClick={addRootCause} className="flex items-center gap-1 text-xs text-primary hover:underline">
              <Plus size={12} /> Add row
            </button>
          </div>
        </div>

        <EditableList
          label="System Gaps Identified"
          items={systemGaps}
          onChange={setSystemGaps}
          placeholder="System gap..."
        />

        <FieldGroup>
          <Label>RCA Conclusion</Label>
          <EditTextarea rows={4} value={rcaConclusion} onChange={e => setRcaConclusion(e.target.value)} placeholder="RCA conclusion..." />
        </FieldGroup>

        <Divider />

        {/* ── CAPA & Flowchart ── */}
        <PageTitle>CAPA &amp; Flow Chart of Events (AI Analysis)</PageTitle>

        <SectionTitle>Corrective &amp; Preventive Actions (CAPA)</SectionTitle>
        <FieldGroup>
          <EditableList
            label="Corrective Actions"
            items={correctiveActions}
            onChange={setCorrectiveActions}
            placeholder="Corrective action..."
          />
          <EditableList
            label="Preventive Actions"
            items={preventiveActions}
            onChange={setPreventiveActions}
            placeholder="Preventive action..."
          />
        </FieldGroup>

        <SectionTitle>Flowchart of Events</SectionTitle>
        <div className="space-y-1 mb-4">
          {flowchart.map((step, i) => (
            <div key={step.no}>
              <div className="border border-gray-200 rounded-md p-3 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-gray-500">Step {step.no}</p>
                  <button type="button" onClick={() => removeFlowStep(i)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={13} />
                  </button>
                </div>
                <EditInput
                  value={step.title}
                  onChange={e => updateFlowStep(i, 'title', e.target.value)}
                  placeholder="Step title..."
                  className="mb-2"
                />
                <EditTextarea
                  rows={2}
                  value={step.description}
                  onChange={e => updateFlowStep(i, 'description', e.target.value)}
                  placeholder="Step description..."
                />
              </div>
              {i < flowchart.length - 1 && (
                <div className="flex justify-center py-1 text-primary text-lg">↓</div>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addFlowStep}
            className="flex items-center gap-1 text-xs text-primary hover:underline mt-2"
          >
            <Plus size={12} /> Add step
          </button>
        </div>

      </div>

      {/* Bottom save bar */}
      <div className="border-t border-gray-200 px-6 py-3 flex justify-end gap-2 rounded-b-lg bg-gray-50">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default IncidentReportInlineEditor;
