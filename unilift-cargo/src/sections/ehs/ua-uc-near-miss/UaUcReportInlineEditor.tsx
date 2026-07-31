'use client';

import React, { useState } from 'react';
import { CapaPoints, UaUcNearMissRecord } from '@/types/ehs.types';
import {
  UA_CLASSIFICATIONS,
  UC_CLASSIFICATIONS,
  NEAR_MISS_SEVERITY
} from '@/validations/contractor/add-ua-uc-near-miss';
import { updateUaUcReportFull } from '@/actions/contractor/ua-uc-near-miss';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import CapaPointsEditor from './CapaPointsEditor';

// ─── Shared input components ──────────────────────────────────────────────────

const Label = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{children}</p>
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

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-2">
    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide sm:w-44 flex-shrink-0">{label}</span>
    <span className="text-sm text-gray-800">{value || '—'}</span>
  </div>
);

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
    <div className="bg-white px-4 py-2 border-b border-gray-200">
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">{title}</h3>
    </div>
    <div className="px-4 py-3 space-y-3">{children}</div>
  </div>
);

// ─── Multi-chip selector ──────────────────────────────────────────────────────

const ChipSelector = ({
  options,
  value,
  onChange
}: {
  options: readonly string[];
  value: string[];
  onChange: (v: string[]) => void;
}) => {
  const toggle = (opt: string) => {
    onChange(
      value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt]
    );
  };
  return (
    <div className="flex flex-wrap gap-2">
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

// ─── Severity buttons ─────────────────────────────────────────────────────────

const SeverityButtons = ({
  value,
  onChange
}: {
  value: string | null | undefined;
  onChange: (v: 'Low' | 'Medium' | 'High') => void;
}) => (
  <div className="flex gap-3">
    {NEAR_MISS_SEVERITY.map(level => (
      <button
        key={level}
        type="button"
        onClick={() => onChange(level)}
        className={`flex-1 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
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


// ─── Main Editor ──────────────────────────────────────────────────────────────

const UaUcReportInlineEditor = ({
  report,
  onCancel
}: {
  report: UaUcNearMissRecord;
  onCancel: () => void;
}) => {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [locationDepartment, setLocationDepartment] = useState(report.location_department ?? '');
  const [whatHappened, setWhatHappened] = useState(report.what_happened ?? '');
  const [equipmentInvolved, setEquipmentInvolved] = useState(report.equipment_involved ?? '');
  const [activityAtTime, setActivityAtTime] = useState(report.activity_at_time ?? '');

  // UA fields
  const [uaClassifications, setUaClassifications] = useState<string[]>(report.ua_classifications ?? []);
  const [uaOther, setUaOther] = useState(report.ua_other ?? '');

  // UC fields
  const [ucClassifications, setUcClassifications] = useState<string[]>(report.uc_classifications ?? []);
  const [ucOther, setUcOther] = useState(report.uc_other ?? '');
  const [ucSeverity, setUcSeverity] = useState<'Low' | 'Medium' | 'High' | null>(report.uc_severity ?? null);
  const [ucTemporaryControls, setUcTemporaryControls] = useState(report.uc_temporary_controls ?? '');

  // Near Miss fields
  const [nmPotentialInjury, setNmPotentialInjury] = useState(report.nm_potential_injury ?? '');
  const [nmWhatCouldHappen, setNmWhatCouldHappen] = useState(report.nm_what_could_happen ?? '');
  const [nmSeverity, setNmSeverity] = useState<'Low' | 'Medium' | 'High' | null>(report.nm_severity ?? null);
  const [capaPoints, setCapaPoints] = useState<CapaPoints>(
    report.capa_points ?? { corrective: [], preventive: [] }
  );

  const handleSave = async () => {
    setSaving(true);

    const payload: Record<string, unknown> = {
      location_department: locationDepartment,
      what_happened: whatHappened || null,
      equipment_involved: equipmentInvolved || null,
      activity_at_time: activityAtTime || null
    };

    if (report.observation_type === 'UA') {
      payload.ua_classifications = uaClassifications;
      payload.ua_other = uaOther || null;
    } else if (report.observation_type === 'UC') {
      payload.uc_classifications = ucClassifications;
      payload.uc_other = ucOther || null;
      payload.uc_severity = ucSeverity;
      payload.uc_temporary_controls = ucTemporaryControls || null;
    } else if (report.observation_type === 'NearMiss') {
      payload.nm_potential_injury = nmPotentialInjury || null;
      payload.nm_what_could_happen = nmWhatCouldHappen || null;
      payload.nm_severity = nmSeverity;
    }

    const normalizedCapa = {
      corrective: capaPoints.corrective.map(point => point.trim()).filter(Boolean),
      preventive: capaPoints.preventive.map(point => point.trim()).filter(Boolean)
    };
    if (
      report.capa_points ||
      normalizedCapa.corrective.length > 0 ||
      normalizedCapa.preventive.length > 0
    ) {
      payload.capa_points = normalizedCapa;
    }

    const { success } = await updateUaUcReportFull(report.id, payload);
    setSaving(false);

    if (success) {
      toast.success('Report saved successfully');
      router.refresh();
      onCancel();
    } else {
      toast.error('Failed to save report. Please try again.');
    }
  };

  const observationLabel: Record<string, string> = {
    UA: 'Unsafe Act (UA)',
    UC: 'Unsafe Condition (UC)',
    NearMiss: 'Near Miss'
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">

      {/* Editor header */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-primary">
          Editing — {report.report_no}
        </p>
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

      {/* Basic Information — read-only fields shown, editable ones use inputs */}
      <SectionCard title="Basic Information">
        <InfoRow label="Report No" value={<span className="font-mono">{report.report_no}</span>} />
        <InfoRow label="Reported By" value={`${report.reported_by_name}${report.employee_id ? ` (${report.employee_id})` : ''}`} />
        <InfoRow label="Type" value={
          <span className="inline-flex items-center bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded">
            {observationLabel[report.observation_type]}
          </span>
        } />
        <div>
          <Label>Location / Department</Label>
          <EditInput
            value={locationDepartment}
            onChange={e => setLocationDepartment(e.target.value)}
            placeholder="e.g. Warehouse B, Production Floor"
          />
        </div>
      </SectionCard>

      {/* Observation Details */}
      <SectionCard title="Observation Details (AI Analysis)">
        <div>
          <Label>What happened</Label>
          <EditTextarea
            value={whatHappened}
            onChange={e => setWhatHappened(e.target.value)}
            placeholder="What was observed or happened..."
          />
        </div>
        <div>
          <Label>Equipment involved</Label>
          <EditInput
            value={equipmentInvolved}
            onChange={e => setEquipmentInvolved(e.target.value)}
            placeholder="Equipment, tools, or materials involved"
          />
        </div>
        <div>
          <Label>Activity at time</Label>
          <EditInput
            value={activityAtTime}
            onChange={e => setActivityAtTime(e.target.value)}
            placeholder="Activity being performed at the time"
          />
        </div>
      </SectionCard>

      {/* Classification */}
      <SectionCard title="Classification (AI Classified)">
        {report.observation_type === 'UA' && (
          <>
            <div>
              <Label>UA Classification</Label>
              <ChipSelector
                options={UA_CLASSIFICATIONS}
                value={uaClassifications}
                onChange={setUaClassifications}
              />
            </div>
            <div>
              <Label>Other (custom unsafe act)</Label>
              <EditTextarea
                value={uaOther}
                onChange={e => setUaOther(e.target.value)}
                placeholder="Describe a custom unsafe act if not listed above..."
              />
            </div>
          </>
        )}

        {report.observation_type === 'UC' && (
          <>
            <div>
              <Label>UC Classification</Label>
              <ChipSelector
                options={UC_CLASSIFICATIONS}
                value={ucClassifications}
                onChange={setUcClassifications}
              />
            </div>
            <div>
              <Label>Other (custom unsafe condition)</Label>
              <EditTextarea
                value={ucOther}
                onChange={e => setUcOther(e.target.value)}
                placeholder="Describe a custom unsafe condition if not listed above..."
              />
            </div>
            <div>
              <Label>Risk Severity</Label>
              <SeverityButtons value={ucSeverity} onChange={setUcSeverity} />
            </div>
            <div>
              <Label>Temporary Controls Applied</Label>
              <EditTextarea
                value={ucTemporaryControls}
                onChange={e => setUcTemporaryControls(e.target.value)}
                placeholder="Immediate temporary controls applied to reduce risk..."
              />
            </div>
          </>
        )}

        {report.observation_type === 'NearMiss' && (
          <>
            <div>
              <Label>Potential Injury</Label>
              <EditInput
                value={nmPotentialInjury}
                onChange={e => setNmPotentialInjury(e.target.value)}
                placeholder="Potential injury that could have resulted"
              />
            </div>
            <div>
              <Label>What Could Happen</Label>
              <EditTextarea
                value={nmWhatCouldHappen}
                onChange={e => setNmWhatCouldHappen(e.target.value)}
                placeholder="Describe the potential outcome..."
              />
            </div>
            <div>
              <Label>Potential Severity</Label>
              <SeverityButtons value={nmSeverity} onChange={setNmSeverity} />
            </div>
          </>
        )}
      </SectionCard>

      <SectionCard title="CAPA Points">
        <CapaPointsEditor value={capaPoints} onChange={setCapaPoints} />
      </SectionCard>


      {/* Bottom save bar */}
      <div className="flex justify-end gap-2 pb-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default UaUcReportInlineEditor;
