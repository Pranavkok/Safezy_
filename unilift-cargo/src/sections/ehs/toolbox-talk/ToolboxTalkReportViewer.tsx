'use client';

import React from 'react';
import { ToolboxTalkCompletionReport } from '@/types/ehs.types';
import { CheckCircle2, Clock, Star, Mail, ImageIcon } from 'lucide-react';

function formatDate(str: string) {
  return new Date(str).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
}

function formatDuration(seconds: number | null) {
  if (!seconds) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);
  return parts.join(' ');
}

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

const StarRating = ({ rating }: { rating: number | null }) => {
  if (!rating) return <span className="text-sm text-gray-400 italic">Not rated</span>;
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
        />
      ))}
      <span className="text-sm text-gray-600 ml-1">{rating}/5</span>
    </div>
  );
};

const ToolboxTalkReportViewer = ({ report }: { report: ToolboxTalkCompletionReport }) => {
  const superiorEmails = report.superior_email.split(',').map(e => e.trim()).filter(Boolean);

  return (
    <div className="space-y-5 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-200">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">EHS Report</p>
          <h1 className="text-2xl font-bold text-gray-900">Toolbox Talk</h1>
          <p className="text-sm text-gray-500 mt-0.5 font-medium">{report.topic_name}</p>
        </div>
        <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border bg-green-50 text-green-600 border-green-200">
          <CheckCircle2 className="w-4 h-4" />
          Completed
        </span>
      </div>

      {/* Section 1 — Participant Info */}
      <SectionCard title="Participant Information">
        <InfoRow label="Name" value={`${report.first_name} ${report.last_name}`} />
        <InfoRow label="Email" value={report.email} />
        <InfoRow label="Completed On" value={formatDate(report.created_at)} />
        <InfoRow
          label="Session Duration"
          value={
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {formatDuration(report.duration_seconds)}
            </span>
          }
        />
      </SectionCard>

      {/* Section 2 — Topic */}
      <SectionCard title="Topic Details">
        <InfoRow label="Topic Name" value={<span className="font-semibold text-primary">{report.topic_name}</span>} />
        <InfoRow
          label="Rating"
          value={<StarRating rating={report.rating} />}
        />
        {report.comments && (
          <InfoRow label="Comments / Remarks" value={report.comments} />
        )}
      </SectionCard>

      {/* Section 3 — Notified Superiors */}
      <SectionCard title="Notified Superiors">
        <div className="space-y-1.5 py-1">
          {superiorEmails.map(email => (
            <div key={email} className="flex items-center gap-2 text-sm text-gray-700">
              <Mail className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              {email}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Section 4 — Attendance Sheets */}
      {report.attendance_images.length > 0 && (
        <SectionCard title="Attendance Sheets">
          <div className="space-y-4">
            {report.attendance_images.map((url, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <ImageIcon className="w-4 h-4" /> Attendance Sheet {report.attendance_images.length > 1 ? i + 1 : ''}
                </div>
                <img src={url} alt={`Attendance ${i + 1}`} className="max-h-64 object-contain rounded border border-gray-200" />
              </div>
            ))}
          </div>
        </SectionCard>
      )}

    </div>
  );
};

export default ToolboxTalkReportViewer;
