'use client';

import React from 'react';
import { UaUcNearMissRecord } from '@/types/ehs.types';
import { Mic, FileVideo, ImageIcon, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
}

const observationLabel: Record<string, string> = {
  UA: 'Unsafe Act (UA)',
  UC: 'Unsafe Condition (UC)',
  NearMiss: 'Near Miss'
};

// Parses "1. foo 2. bar" or newline-separated numbered text into list items
function parseNumberedList(text: string): string[] | null {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  // If already on separate lines and start with a number, use them directly
  if (lines.length > 1 && lines.every(l => /^\d+\./.test(l))) {
    return lines.map(l => l.replace(/^\d+\.\s*/, ''));
  }
  // Fall back: split inline "1. ... 2. ..." pattern
  const parts = text.split(/(?=\d+\.\s)/).map(s => s.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);
  return parts.length > 1 ? parts : null;
}

function NumberedList({ text }: { text: string }) {
  const items = parseNumberedList(text);
  if (!items) return <span className="text-sm text-gray-800">{text}</span>;
  return (
    <ol className="list-decimal list-outside pl-4 space-y-1">
      {items.map((item, i) => (
        <li key={i} className="text-sm text-gray-800">{item}</li>
      ))}
    </ol>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-2">
    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide sm:w-44 flex-shrink-0">
      {label}
    </span>
    <span className="text-sm text-gray-800">{value || '—'}</span>
  </div>
);

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
    <div className="bg-white px-4 py-2 border-b border-gray-200">
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">{title}</h3>
    </div>
    <div className="px-4 py-3 bg-white">{children}</div>
  </div>
);

// ─── Classification display ────────────────────────────────────────────────────

const ClassificationList = ({ items, other }: { items: string[]; other?: string | null }) => {
  if (items.length === 0 && !other) return <p className="text-sm text-gray-400 italic">None selected</p>;
  return (
    <ul className="space-y-1">
      {items.map(item => (
        <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
          {item}
        </li>
      ))}
      {other && (
        <li className="flex items-center gap-2 text-sm text-gray-700">
          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
          Other: {other}
        </li>
      )}
    </ul>
  );
};

// ─── Media Evidence ───────────────────────────────────────────────────────────

const MediaEvidence = ({ url, type }: { url: string; type: string }) => {
  if (type === 'image') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <ImageIcon className="w-4 h-4" /> Image
        </div>
        <img src={url} alt="Evidence" className="max-h-64 object-contain rounded border" />
      </div>
    );
  }
  if (type === 'video') {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <FileVideo className="w-4 h-4" /> Video
        </div>
        <video src={url} controls className="w-full max-h-64 rounded border" />
      </div>
    );
  }
  // voice
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Mic className="w-4 h-4" /> Voice note
      </div>
      <div className="flex items-center gap-3 bg-gray-50 border rounded p-3">
        <Mic className="w-5 h-5 text-primary flex-shrink-0" />
        <audio src={url} controls className="flex-1" />
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

// ─── Severity badge ───────────────────────────────────────────────────────────

const SeverityBadge = ({ level }: { level: string }) => {
  const colors: Record<string, string> = {
    Low: 'bg-green-100 text-green-700 border-green-200',
    Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    High: 'bg-red-100 text-red-700 border-red-200'
  };
  return (
    <span className={`inline-flex items-center border rounded-full px-3 py-0.5 text-xs font-semibold ${colors[level] ?? 'bg-gray-100 text-gray-600'}`}>
      {level}
    </span>
  );
};

// ─── Main Viewer ──────────────────────────────────────────────────────────────

const UaUcReportViewer = ({ report }: { report: UaUcNearMissRecord }) => {
  const isOpen = report.status === 'Open';

  return (
    <div className="space-y-5 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-200">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">EHS Report</p>
          <h1 className="text-2xl font-bold text-gray-900">
            {observationLabel[report.observation_type] ?? report.observation_type}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Report No: <span className="font-mono font-semibold text-primary">{report.report_no}</span></p>
        </div>
        <span className={`self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${
          isOpen
            ? 'bg-orange-50 text-orange-600 border-orange-200'
            : 'bg-green-50 text-green-600 border-green-200'
        }`}>
          {isOpen ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {report.status}
        </span>
      </div>

      {/* Section 1 — Basic Information */}
      <SectionCard title="Basic Information">
        <InfoRow label="Report No" value={<span className="font-mono">{report.report_no}</span>} />
        <InfoRow label="Date & Time" value={formatDateTime(report.reported_at)} />
        <InfoRow label="Location / Dept" value={report.location_department} />
        <InfoRow label="Reported By" value={`${report.reported_by_name}${report.employee_id ? ` (${report.employee_id})` : ''}`} />
        <InfoRow label="Type" value={
          <span className="inline-flex items-center bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded">
            {observationLabel[report.observation_type]}
          </span>
        } />
      </SectionCard>

      {/* Section 3 — Observation Details */}
      <SectionCard title="Observation Details (AI Analysis)">
        <InfoRow label="What happened" value={report.what_happened} />
        <InfoRow label="Equipment involved" value={report.equipment_involved} />
        <InfoRow label="Activity at time" value={report.activity_at_time} />
      </SectionCard>

      {/* Section 4 — Classification */}
      <SectionCard title="Classification (AI Classified)">
        {report.observation_type === 'UA' && (
          <ClassificationList items={report.ua_classifications ?? []} other={report.ua_other} />
        )}
        {report.observation_type === 'UC' && (
          <ClassificationList items={report.uc_classifications ?? []} other={report.uc_other} />
        )}
        {report.observation_type === 'NearMiss' && (
          <div className="space-y-2">
            <InfoRow label="Potential injury" value={report.nm_potential_injury} />
            <InfoRow label="What could happen" value={report.nm_what_could_happen} />
            <InfoRow label="Severity" value={report.nm_severity ? <SeverityBadge level={report.nm_severity} /> : '—'} />
          </div>
        )}
      </SectionCard>

      {/* Section 5 — Evidence */}
      {(() => {
        const urls = report.media_urls?.length ? report.media_urls : (report.media_url ? [report.media_url] : []);
        const types = report.media_types?.length ? report.media_types : (report.media_type ? [report.media_type] : []);
        if (!urls.length) return null;
        return (
          <SectionCard title="Evidence">
            <div className="space-y-4">
              {urls.map((url, i) => (
                <MediaEvidence key={i} url={url} type={types[i] ?? 'image'} />
              ))}
            </div>
          </SectionCard>
        );
      })()}

      {/* Section 6 — Status */}
      <SectionCard title="Status & Action">
        {isOpen ? (
          <div className="flex items-center gap-3 py-2">
            <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
            <p className="text-sm font-medium text-orange-700">
              This report is <strong>Open</strong> — action needs to be taken.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <InfoRow label="Action taken" value={report.action_taken ? <NumberedList text={report.action_taken} /> : undefined} />
            <InfoRow label="By whom" value={report.action_by} />
            <InfoRow label="Date" value={formatDate(report.action_date)} />
            {report.closure_image_url && (
              <div className="pt-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
                  Closure Evidence
                </span>
                {/\.(mp4|mov|webm|avi|mkv)(\?|$)/i.test(report.closure_image_url) ? (
                  <video src={report.closure_image_url} controls className="max-h-64 rounded border border-gray-200 w-full" />
                ) : (
                  <img src={report.closure_image_url} alt="Closure evidence" className="max-h-64 object-contain rounded border border-gray-200" />
                )}
              </div>
            )}
          </div>
        )}
      </SectionCard>

      {/* Section 7 — CAPA Points */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <div className="bg-white px-4 py-2 border-b border-gray-200">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">
            CAPA Points
          </h3>
        </div>
        <div className="px-4 py-3 bg-white">
          {!report.capa_points ? (
            /* CAPA points are still generating or not yet available */
            <div className="flex items-center gap-2 py-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <p className="text-sm text-gray-400 italic">
                CAPA points are being generated by Safezy AI…
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Corrective Actions */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-700">
                    Corrective Actions
                  </span>
                  <span className="text-xs text-gray-400">Immediate steps to fix the unsafe situation</span>
                </div>
                {report.capa_points.corrective.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">None generated</p>
                ) : (
                  <ol className="list-decimal list-outside pl-5 space-y-1.5">
                    {report.capa_points.corrective.map((point, i) => (
                      <li key={i} className="text-sm text-gray-800 leading-relaxed">
                        {point}
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              <div className="border-t border-gray-100" />

              {/* Preventive Actions */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                    Preventive Actions
                  </span>
                  <span className="text-xs text-gray-400">Long-term measures to prevent recurrence</span>
                </div>
                {report.capa_points.preventive.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">None generated</p>
                ) : (
                  <ol className="list-decimal list-outside pl-5 space-y-1.5">
                    {report.capa_points.preventive.map((point, i) => (
                      <li key={i} className="text-sm text-gray-800 leading-relaxed">
                        {point}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default UaUcReportViewer;
