'use client';

import React from 'react';
import { IncidentAnalysisWithImageType } from '@/types/index.types';
import {
  ContributingFactorsType,
  FiveWhysAnalysisJsonType,
  FlowchartJsonType,
  RootCausesJsonType
} from '@/types/ehs.types';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-2 rounded mt-6 mb-3">
    {children}
  </h3>
);

const PageTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-base font-bold text-primary border-b-2 border-primary pb-2 mb-4">
    {children}
  </h2>
);

const Field = ({ label, value }: { label: string; value?: string | null }) => {
  if (!value) return null;
  return (
    <div className="mb-3">
      <p className="text-[10px] uppercase text-gray-500 font-medium mb-0.5">{label}</p>
      <p className="text-sm text-gray-900 whitespace-pre-wrap">{value}</p>
    </div>
  );
};

const YesNoField = ({ label, value }: { label: string; value?: boolean | null }) => {
  if (value === null || value === undefined) return null;
  return (
    <div className="mb-3">
      <p className="text-[10px] uppercase text-gray-500 font-medium mb-0.5">{label}</p>
      <p className={`text-sm font-bold ${value ? 'text-green-600' : 'text-red-600'}`}>
        {value ? 'Yes' : 'No'}
      </p>
    </div>
  );
};

const ChipList = ({ label, values }: { label: string; values?: string[] | null }) => {
  if (!values || values.length === 0) return null;
  return (
    <div className="mb-3">
      <p className="text-[10px] uppercase text-gray-500 font-medium mb-1">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v, i) => (
          <span key={i} className="text-xs text-primary border border-primary bg-orange-50 px-2 py-0.5 rounded-full">
            {v}
          </span>
        ))}
      </div>
    </div>
  );
};

const BulletList = ({ label, items }: { label: string; items?: string[] | null }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-3">
      <p className="text-[10px] uppercase text-gray-500 font-medium mb-1">{label}</p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-gray-900">
            <span className="text-primary mt-0.5">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const FieldGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0">{children}</div>
);

const FieldGroup = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-gray-50 rounded-md p-4 mb-4">{children}</div>
);

const Divider = () => <hr className="border-dashed border-gray-300 my-6" />;

const IncidentReportHtmlViewer = ({
  incidentDetails
}: {
  incidentDetails: IncidentAnalysisWithImageType;
}) => {
  const fiveWhyAnalysis = incidentDetails.viva_analysis as FiveWhysAnalysisJsonType;
  const flowchart = incidentDetails.flowchart_points as FlowchartJsonType[];
  const contributingFactors = incidentDetails.contributing_factors as ContributingFactorsType;
  const rootCauses = incidentDetails.root_causes as RootCausesJsonType;
  const systemGaps = incidentDetails.system_gaps as string[];
  const correctiveActions = incidentDetails.corrective_actions as string[];
  const preventiveActions = incidentDetails.preventive_actions as string[];
  const controlsFailed = incidentDetails.controls_failed as string[];
  const pressureConstraints = incidentDetails.pressure_constraints as string[];

  const refId = `IR-${incidentDetails.id}`;
  const createdDate = formatDate(incidentDetails.created_at);

  return (
    <div className="bg-white font-sans text-gray-900">
      {/* Report Header */}
      <div className="bg-primary text-white px-6 py-4 rounded-t-lg flex justify-between items-start">
        <div>
          <p className="text-base font-bold">Incident Investigation Report</p>
          <p className="text-xs opacity-90 mt-0.5">Ref: {refId} · {incidentDetails.title}</p>
        </div>
        <p className="text-xs opacity-80 text-right">Created: {createdDate}</p>
      </div>

      <div className="p-6 space-y-2">
        {/* ── Page 1: Incident Snapshot & Narration ── */}
        <PageTitle>Incident Snapshot &amp; Narration</PageTitle>

        <SectionTitle>Section 1 — Incident Snapshot</SectionTitle>
        <FieldGroup>
          <Field label="Incident Title" value={incidentDetails.title} />
          <FieldGrid>
            <Field label="Incident Type" value={incidentDetails.incident_type} />
            <Field label="Severity" value={incidentDetails.severity_level} />
            <Field label="Location" value={incidentDetails.location} />
            <Field label="Date" value={incidentDetails.date} />
            <Field label="Time" value={incidentDetails.time} />
          </FieldGrid>
        </FieldGroup>

        <SectionTitle>Section 2 — Incident Narration</SectionTitle>
        <FieldGroup>
          <FieldGrid>
            <Field label="Activity Type" value={incidentDetails.activity_type} />
            <Field label="What Failed or Went Wrong" value={incidentDetails.failure_type} />
          </FieldGrid>
          <Field label="What was happening before the incident" value={incidentDetails.pre_incident_activity} />
          <Field label="Incident Description" value={incidentDetails.narrative} />
          <Field label="How was it stopped" value={incidentDetails.how_stopped} />
        </FieldGroup>

        <Divider />

        {/* ── Page 2: System Analysis & Impact ── */}
        <PageTitle>System Analysis &amp; Impact</PageTitle>

        <SectionTitle>Section 3 — Why the System Allowed It</SectionTitle>
        <FieldGroup>
          <ChipList label="Controls Present but Failed" values={controlsFailed} />
          <YesNoField label="Deviation from SOP?" value={incidentDetails.sop_deviation} />
          {(incidentDetails as any).sop_deviation_remarks && (
            <Field label="SOP Deviation Details" value={(incidentDetails as any).sop_deviation_remarks} />
          )}
          <YesNoField label="Authorization / Competence Verified?" value={incidentDetails.authorization_competence} />
          {(incidentDetails as any).authorization_competence_remarks && (
            <Field label="Authorization Details" value={(incidentDetails as any).authorization_competence_remarks} />
          )}
          <ChipList label="Pressure or Constraints Present" values={pressureConstraints} />
          <Field label="Historical Incident Date" value={incidentDetails.historical_incident_date} />
          <Field label="Past Similar Incidents" value={incidentDetails.past_incidents_text} />
        </FieldGroup>

        <SectionTitle>Section 4 — Impact &amp; Immediate Action</SectionTitle>
        <FieldGroup>
          <Field label="Described Impact" value={incidentDetails.impact_description} />
          <Field label="Worst-Case Potential" value={incidentDetails.worst_case_potential} />
          <Field label="Immediate Actions Taken" value={incidentDetails.immediate_actions} />
        </FieldGroup>

        <Divider />

        {/* ── Page 3: 10 Whys & Root Cause Analysis ── */}
        <PageTitle>10 Whys &amp; Root Cause Analysis (AI Analysis)</PageTitle>

        {fiveWhyAnalysis?.points?.length > 0 && (
          <>
            <SectionTitle>10 WHYs Analysis</SectionTitle>
            <FieldGroup>
              <div className="space-y-2">
                {fiveWhyAnalysis.points.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-xs font-bold text-primary min-w-[28px]">W{i + 1}</span>
                    <p className="text-sm text-gray-900">{item.answer}</p>
                  </div>
                ))}
              </div>
            </FieldGroup>
          </>
        )}

        {incidentDetails.immediate_cause && (
          <FieldGroup>
            <Field label="Immediate Cause" value={incidentDetails.immediate_cause} />
          </FieldGroup>
        )}

        {contributingFactors && (
          <>
            <SectionTitle>Contributing Factors</SectionTitle>
            <div className="border border-gray-200 rounded-md overflow-hidden mb-4">
              <div className="grid grid-cols-[120px_1fr] bg-gray-100 text-[10px] uppercase text-gray-500 font-medium px-3 py-2">
                <span>Category</span>
                <span>Description</span>
              </div>
              {(['people', 'process', 'equipment', 'environment'] as const).map(key =>
                contributingFactors[key] ? (
                  <div key={key} className="grid grid-cols-[120px_1fr] px-3 py-2 border-t border-gray-200 text-sm">
                    <span className="capitalize text-gray-600">{key}</span>
                    <span className="text-gray-900">{contributingFactors[key]}</span>
                  </div>
                ) : null
              )}
            </div>
          </>
        )}

        {rootCauses?.points?.length > 0 && (
          <>
            <SectionTitle>Root Causes (Why-Why Chain)</SectionTitle>
            <div className="border border-gray-200 rounded-md overflow-hidden mb-4">
              <div className="grid grid-cols-2 bg-gray-100 text-[10px] uppercase text-gray-500 font-medium px-3 py-2">
                <span>Cause</span>
                <span>Effect</span>
              </div>
              {rootCauses.points.map((point, i) => (
                <div key={i} className="grid grid-cols-2 px-3 py-2 border-t border-gray-200 text-sm">
                  <span className="text-gray-900 pr-2">{point.cause}</span>
                  <span className="text-gray-900">{point.effect}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <BulletList label="System Gaps Identified" items={systemGaps} />

        {incidentDetails.rca_conclusion && (
          <FieldGroup>
            <Field label="RCA Conclusion" value={incidentDetails.rca_conclusion} />
          </FieldGroup>
        )}

        <Divider />

        {/* ── Page 4: CAPA + Flowchart + Images ── */}
        <PageTitle>CAPA &amp; Flow Chart of Events (AI Analysis)</PageTitle>

        <SectionTitle>Corrective &amp; Preventive Actions (CAPA)</SectionTitle>
        <FieldGroup>
          <BulletList label="Corrective Actions" items={correctiveActions} />
          <BulletList label="Preventive Actions" items={preventiveActions} />
        </FieldGroup>

        {flowchart?.length > 0 && (
          <>
            <SectionTitle>Flowchart of Events</SectionTitle>
            <div className="space-y-1 mb-4">
              {flowchart.map((step, i) => (
                <div key={step.no}>
                  <div className="border border-gray-200 rounded-md p-3 bg-white">
                    <p className="text-[10px] text-gray-500 mb-0.5">Step {step.no}</p>
                    <p className="text-sm font-semibold text-gray-800 mb-0.5">{step.title}</p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                  {i < flowchart.length - 1 && (
                    <div className="flex justify-center py-1 text-primary text-lg">↓</div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {incidentDetails.images?.length > 0 && (
          <>
            <SectionTitle>Evidence Photos</SectionTitle>
            <div className="space-y-4">
              {incidentDetails.images.map((img, i) => (
                <div key={img.id} className="text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.image_url}
                    alt={`Evidence photo ${i + 1}`}
                    className="max-h-80 object-contain mx-auto rounded border border-gray-200"
                  />
                  <p className="text-xs text-gray-500 mt-1">Photo #{i + 1}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Report Footer */}
      <div className="bg-primary text-white text-xs px-6 py-3 rounded-b-lg flex justify-between">
        <span className="opacity-85">Confidential — Safezy Incident Investigation Report</span>
        <span className="font-bold">{refId}</span>
      </div>
    </div>
  );
};

export default IncidentReportHtmlViewer;
