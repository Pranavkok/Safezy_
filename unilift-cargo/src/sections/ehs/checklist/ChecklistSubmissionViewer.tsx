'use client';

import React from 'react';
import { CheckCircle2, XCircle, MinusCircle, MapPin, User, Calendar, ClipboardList } from 'lucide-react';

type Answer = {
  question: string;
  weightage: number;
  answer: string;
  remark: string;
};

type ChecklistSubmission = {
  id: number;
  topic_name: string;
  date: string;
  site_name: string;
  inspected_by: string;
  progress: { date: string; progress: number }[];
  answers: Answer[];
};

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
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

const AnswerBadge = ({ answer }: { answer: string }) => {
  if (answer === 'Yes') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
        <CheckCircle2 className="w-3 h-3" /> Yes
      </span>
    );
  }
  if (answer === 'No') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
        <XCircle className="w-3 h-3" /> No
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
      <MinusCircle className="w-3 h-3" /> N/A
    </span>
  );
};

const ChecklistSubmissionViewer = ({ submission }: { submission: ChecklistSubmission }) => {
  const latestScore = submission.progress?.length
    ? submission.progress[submission.progress.length - 1].progress
    : null;

  const yesCount = submission.answers.filter(a => a.answer === 'Yes').length;
  const noCount = submission.answers.filter(a => a.answer === 'No').length;
  const naCount = submission.answers.filter(a => a.answer === 'N/A').length;

  return (
    <div className="space-y-5 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-200">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">EHS Checklist</p>
          <h1 className="text-2xl font-bold text-gray-900">{submission.topic_name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Submitted on {formatDate(submission.date)}</p>
        </div>
        <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border bg-green-50 text-green-600 border-green-200">
          <CheckCircle2 className="w-4 h-4" />
          Completed
        </span>
      </div>

      {/* Section 1 — Submission Info */}
      <SectionCard title="Submission Details">
        <InfoRow
          label="Date"
          value={
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              {formatDate(submission.date)}
            </span>
          }
        />
        <InfoRow
          label="Site Name"
          value={
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              {submission.site_name}
            </span>
          }
        />
        <InfoRow
          label="Inspected By"
          value={
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-gray-400" />
              {submission.inspected_by}
            </span>
          }
        />
        {latestScore !== null && (
          <InfoRow
            label="Score"
            value={<span className="text-sm font-semibold text-primary">{latestScore}%</span>}
          />
        )}
      </SectionCard>

      {/* Section 2 — Summary */}
      <SectionCard title="Answer Summary">
        <div className="flex gap-6 py-1">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{yesCount}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Yes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{noCount}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">No</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-500">{naCount}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">N/A</p>
          </div>
        </div>
      </SectionCard>

      {/* Section 3 — Questions & Answers */}
      <SectionCard title={`Questions & Answers (${submission.answers.length})`}>
        <div className="space-y-4 py-1">
          {submission.answers.map((answer, idx) => (
            <div key={idx} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="flex gap-2 flex-1">
                  <span className="text-xs font-bold text-gray-400 mt-0.5 flex-shrink-0">
                    {idx + 1}.
                  </span>
                  <p className="text-sm text-gray-800">{answer.question}</p>
                </div>
                <div className="flex-shrink-0 ml-6 sm:ml-0">
                  <AnswerBadge answer={answer.answer} />
                </div>
              </div>
              {answer.remark && (
                <p className="mt-2 ml-5 text-xs text-gray-500 italic">
                  Remark: {answer.remark}
                </p>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

    </div>
  );
};

export default ChecklistSubmissionViewer;
