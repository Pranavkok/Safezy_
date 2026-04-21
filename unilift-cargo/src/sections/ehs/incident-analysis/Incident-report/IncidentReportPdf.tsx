'use client';

import React from 'react';
import { IncidentAnalysisWithImageType } from '@/types/index.types';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font
} from '@react-pdf/renderer';
import ASSETS from '@/assets';
import {
  ContributingFactorsType,
  FiveWhysAnalysisJsonType,
  FlowchartJsonType,
  RootCausesJsonType
} from '@/types/ehs.types';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

Font.register({
  family: 'Inter',
  fonts: [{ src: '/fonts/Inter-Regular.ttf' }]
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: 'white',
    paddingTop: 95,
    paddingBottom: 55,
    paddingHorizontal: 30,
    fontFamily: 'Inter'
  },
  header: {
    backgroundColor: '#FF914D',
    padding: '20px 30px',
    color: 'white',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    zIndex: 3
  },
  headerContent: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  headerTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  headerSubtitle: { fontSize: 9, opacity: 0.9 },
  headerDate: { fontSize: 9, textAlign: 'right' },
  footer: {
    backgroundColor: '#FF914D',
    color: '#FFFFFF',
    fontSize: 9,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    paddingHorizontal: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 3
  },
  pageNumber: {
    textAlign: 'right',
    fontWeight: 'bold',
    fontSize: 10,
    color: '#FFFFFF'
  },
  watermark: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  watermarkImage: { width: '70%', transform: 'rotate(-45deg)' },
  // Content
  pageTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FF914D',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottom: '1.5px solid #FF914D'
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
    backgroundColor: '#F3F4F6',
    padding: '6px 10px',
    marginBottom: 8,
    marginTop: 12,
    borderRadius: 3
  },
  fieldGroup: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 4,
    marginBottom: 8
  },
  grid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6
  },
  gridItem: { width: '50%', paddingHorizontal: 6, marginBottom: 8 },
  gridItem3: { width: '33.33%', paddingHorizontal: 6, marginBottom: 8 },
  fullWidth: { width: '100%' },
  fieldLabel: { fontSize: 8, color: '#6B7280', marginBottom: 2, fontWeight: 'medium', textTransform: 'uppercase' },
  fieldValue: { fontSize: 10, color: '#111827' },
  bullet: { flexDirection: 'row', marginBottom: 3 },
  bulletDot: { fontSize: 10, marginRight: 6, color: '#FF914D' },
  chip: {
    backgroundColor: '#FFF3EC',
    borderWidth: 1,
    borderColor: '#FF914D',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 4,
    marginBottom: 4
  },
  chipText: { fontSize: 8, color: '#FF914D' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  table: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 8
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  tableHeader: { backgroundColor: '#F3F4F6' },
  tableCell: { fontSize: 9, padding: 7, flex: 1 },
  tableHeaderCell: { fontSize: 8, fontWeight: 'medium', color: '#6B7280', textTransform: 'uppercase' },
  yesNo: { fontSize: 10, fontWeight: 'bold' },
  yesColor: { color: '#059669' },
  noColor: { color: '#DC2626' }
});

// ─── Shared Header/Footer/Watermark ──────────────────────────────────────────

const PageHeader = ({ title, refId, date }: { title: string; refId: string; date: string }) => (
  <View style={styles.header} fixed>
    <View style={styles.headerContent}>
      <View>
        <Text style={styles.headerTitle}>Incident Investigation Report</Text>
        <Text style={styles.headerSubtitle}>Ref: {refId} · {title}</Text>
      </View>
      <View>
        <Text style={styles.headerDate}>Created: {date}</Text>
      </View>
    </View>
  </View>
);

const PageFooter = () => (
  <View style={styles.footer} fixed>
    <Text style={{ fontSize: 8, color: '#FFF', opacity: 0.85 }}>
      Confidential — Safezy Incident Investigation Report
    </Text>
    <Text
      style={styles.pageNumber}
      render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
    />
  </View>
);

const Watermark = () => (
  <View style={styles.watermark} fixed>
    <Image src={ASSETS.IMG.SAFEZY_TEXT.src} style={styles.watermarkImage} />
  </View>
);

// ─── Field helpers ────────────────────────────────────────────────────────────

const Field = ({ label, value }: { label: string; value?: string | null }) => {
  if (!value) return null;
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
};

const FieldGrid = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.grid}>{children}</View>
);

const GridField = ({ label, value, full }: { label: string; value?: string | null; full?: boolean }) => {
  if (!value) return null;
  return (
    <View style={full ? [styles.gridItem, styles.fullWidth] : styles.gridItem}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
};

const YesNoField = ({ label, value }: { label: string; value?: boolean | null }) => {
  if (value === null || value === undefined) return null;
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={[styles.yesNo, value ? styles.yesColor : styles.noColor]}>
        {value ? 'Yes' : 'No'}
      </Text>
    </View>
  );
};

const ChipList = ({ label, values }: { label: string; values?: string[] | null }) => {
  if (!values || values.length === 0) return null;
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.chipRow}>
        {values.map((v, i) => (
          <View key={i} style={styles.chip}>
            <Text style={styles.chipText}>{v}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const BulletList = ({ label, items }: { label: string; items?: string[] | null }) => {
  if (!items || items.length === 0) return null;
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={[styles.fieldLabel, { marginBottom: 4 }]}>{label}</Text>
      {items.map((item, i) => (
        <View key={i} style={styles.bullet}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.fieldValue}>{item}</Text>
        </View>
      ))}
    </View>
  );
};

// ─── Main PDF Component ───────────────────────────────────────────────────────

const IncidentReportPdf = ({
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

  const pageProps = {
    size: 'A4' as const,
    style: styles.page
  };

  return (
    <Document>
      {/* ══════════════════════════════════════════════
          PAGE 1 — Incident Snapshot + Narration
      ══════════════════════════════════════════════ */}
      <Page {...pageProps}>
        <Watermark />
        <PageHeader title={incidentDetails.title} refId={refId} date={createdDate} />

        <Text style={styles.pageTitle}>Incident Assessment Report</Text>

        {/* Section 1 */}
        <Text style={styles.sectionTitle}>Section 1 — Incident Snapshot</Text>
        <View style={styles.fieldGroup}>
          <FieldGrid>
            <GridField label="Incident Title" value={incidentDetails.title} full />
            <GridField label="Incident Type" value={incidentDetails.incident_type} />
            <GridField label="Severity" value={incidentDetails.severity_level} />
            <GridField label="Location" value={incidentDetails.location} />
            <GridField label="Date" value={incidentDetails.date} />
            <GridField label="Time" value={incidentDetails.time} />
          </FieldGrid>
        </View>

        {/* Section 2 */}
        <Text style={styles.sectionTitle}>Section 2 — Incident Narration</Text>
        <View style={styles.fieldGroup}>
          <FieldGrid>
            <GridField label="Activity Type" value={incidentDetails.activity_type} />
            <GridField label="What Failed or Went Wrong" value={incidentDetails.failure_type} />
            <GridField label="What was happening before the incident" value={incidentDetails.pre_incident_activity} full />
            <GridField label="Incident Description" value={incidentDetails.narrative} full />
            <GridField label="How was it stopped" value={incidentDetails.how_stopped} full />
          </FieldGrid>
        </View>

        <PageFooter />
      </Page>

      {/* ══════════════════════════════════════════════
          PAGE 2 — System Analysis + Impact
      ══════════════════════════════════════════════ */}
      <Page {...pageProps}>
        <Watermark />
        <PageHeader title={incidentDetails.title} refId={refId} date={createdDate} />

        <Text style={styles.pageTitle}>System Analysis & Impact</Text>

        {/* Section 3 */}
        <Text style={styles.sectionTitle}>Section 3 — Why the System Allowed It</Text>
        <View style={styles.fieldGroup}>
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
        </View>

        {/* Section 4 */}
        <Text style={styles.sectionTitle}>Section 4 — Impact & Immediate Action</Text>
        <View style={styles.fieldGroup}>
          <Field label="Described Impact" value={incidentDetails.impact_description} />
          <Field label="Worst-Case Potential" value={incidentDetails.worst_case_potential} />
          <Field label="Corrective Measures" value={incidentDetails.immediate_actions} />
          <Field
            label="Any Findings From Initial Investigations"
            value={incidentDetails.initial_investigation_findings}
          />
        </View>

        <PageFooter />
      </Page>

      {/* ══════════════════════════════════════════════
          PAGE 3 — Five Whys + Root Cause Analysis
      ══════════════════════════════════════════════ */}
      <Page {...pageProps}>
        <Watermark />
        <PageHeader title={incidentDetails.title} refId={refId} date={createdDate} />

        <Text style={styles.pageTitle}>10 Whys & Root Cause Analysis (AI Analysis)</Text>

        {/* 5 Whys */}
        {fiveWhyAnalysis?.points?.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>10 WHYs Analysis</Text>
            <View style={styles.fieldGroup}>
              {fiveWhyAnalysis.points.map((item, i) => (
                <View key={i} style={[styles.bullet, { marginBottom: 6 }]}>
                  <Text style={[styles.bulletDot, { minWidth: 18 }]}>W{i + 1}</Text>
                  <Text style={styles.fieldValue}>{item.answer}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Immediate Cause */}
        {incidentDetails.immediate_cause && (
          <View style={styles.fieldGroup} wrap={false}>
            <Text style={styles.fieldLabel}>Immediate Cause</Text>
            <Text style={styles.fieldValue}>{incidentDetails.immediate_cause}</Text>
          </View>
        )}

        {/* Contributing Factors */}
        {contributingFactors && (
          <View wrap={false}>
            <Text style={styles.sectionTitle}>Contributing Factors</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, styles.tableHeaderCell, { flex: 0.4 }]}>Category</Text>
                <Text style={[styles.tableCell, styles.tableHeaderCell]}>Description</Text>
              </View>
              {(['people', 'process', 'equipment', 'environment'] as const).map(key =>
                contributingFactors[key] ? (
                  <View key={key} style={styles.tableRow} wrap={false}>
                    <Text style={[styles.tableCell, { flex: 0.4, textTransform: 'capitalize' }]}>{key}</Text>
                    <Text style={styles.tableCell}>{contributingFactors[key]}</Text>
                  </View>
                ) : null
              )}
            </View>
          </View>
        )}

        {/* Root Causes */}
        {rootCauses?.points?.length > 0 && (
          <View wrap={false}>
            <Text style={styles.sectionTitle}>Root Causes (Why-Why Chain)</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, styles.tableHeaderCell]}>Cause</Text>
                <Text style={[styles.tableCell, styles.tableHeaderCell]}>Effect</Text>
              </View>
              {rootCauses.points.map((point, i) => (
                <View key={i} style={styles.tableRow} wrap={false}>
                  <Text style={styles.tableCell}>{point.cause}</Text>
                  <Text style={styles.tableCell}>{point.effect}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* System Gaps */}
        <BulletList label="System Gaps Identified" items={systemGaps} />

        {/* RCA Conclusion */}
        {incidentDetails.rca_conclusion && (
          <View style={styles.fieldGroup} wrap={false}>
            <Text style={styles.fieldLabel}>RCA Conclusion</Text>
            <Text style={styles.fieldValue}>{incidentDetails.rca_conclusion}</Text>
          </View>
        )}

        <PageFooter />
      </Page>

      {/* ══════════════════════════════════════════════
          PAGE 4 — CAPA + Flowchart + Images
      ══════════════════════════════════════════════ */}
      <Page {...pageProps}>
        <Watermark />
        <PageHeader title={incidentDetails.title} refId={refId} date={createdDate} />

        <Text style={styles.pageTitle}>CAPA & Flow Chart of Events (AI Analysis)</Text>

        {/* CAPA */}
        <Text style={styles.sectionTitle}>Corrective & Preventive Actions (CAPA)</Text>
        <BulletList label="Corrective Actions" items={correctiveActions} />
        <BulletList label="Preventive Actions" items={preventiveActions} />

        {/* Flowchart */}
        {flowchart?.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Flowchart of Events</Text>
            {flowchart.map((step, i) => (
              <View key={step.no}>
                <View style={[styles.fieldGroup, { borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: 'white' }]} wrap={false}>
                  <Text style={{ fontSize: 9, color: '#6B7280', marginBottom: 2 }}>Step {step.no}</Text>
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1F2937', marginBottom: 2 }}>{step.title}</Text>
                  <Text style={{ fontSize: 9, color: '#6B7280' }}>{step.description}</Text>
                </View>
                {i < flowchart.length - 1 && (
                  <View style={{ alignItems: 'center', marginVertical: 2 }}>
                    <Text style={{ fontSize: 12, color: '#FF914D' }}>↓</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Evidence Images */}
        {incidentDetails.images?.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Evidence Photos</Text>
            {incidentDetails.images.map((img, i) => (
              <View key={img.id} style={{ marginBottom: 12 }} wrap={false}>
                <Image src={img.image_url} style={{ maxHeight: 220, objectFit: 'contain' }} />
                <Text style={{ textAlign: 'center', fontSize: 8, color: '#6B7280', marginTop: 4 }}>
                  Photo #{i + 1}
                </Text>
              </View>
            ))}
          </View>
        )}

        {(incidentDetails as any).closure_image_url && (
          <View wrap={false}>
            <Text style={styles.sectionTitle}>Closure Evidence</Text>
            <Image
              src={(incidentDetails as any).closure_image_url}
              style={{ maxHeight: 220, objectFit: 'contain', borderRadius: 4 }}
            />
            <Text style={{ textAlign: 'center', fontSize: 8, color: '#6B7280', marginTop: 4 }}>
              Uploaded at time of closure
            </Text>
          </View>
        )}

        <PageFooter />
      </Page>
    </Document>
  );
};

export default IncidentReportPdf;
