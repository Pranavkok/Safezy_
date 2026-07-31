'use client';

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
  Link
} from '@react-pdf/renderer';
import ASSETS from '@/assets';
import { UaUcNearMissRecord } from '@/types/ehs.types';

// ─── Font ─────────────────────────────────────────────────────────────────────

Font.register({
  family: 'Inter',
  fonts: [{ src: '/fonts/Inter-Regular.ttf' }]
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (str: string | null) => {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

const formatDateTime = (str: string) =>
  new Date(str).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });

const OBSERVATION_LABEL: Record<string, string> = {
  UA: 'Unsafe Act (UA)',
  UC: 'Unsafe Condition (UC)',
  NearMiss: 'Near Miss'
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  page: {
    backgroundColor: 'white',
    paddingTop: 95,
    paddingBottom: 55,
    paddingHorizontal: 30,
    fontFamily: 'Inter'
  },
  // Header / Footer
  header: {
    backgroundColor: '#FF914D',
    padding: '20px 30px',
    color: 'white',
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 80,
    zIndex: 3
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4, color: 'white' },
  headerSub: { fontSize: 9, opacity: 0.9, color: 'white' },
  headerDate: { fontSize: 9, textAlign: 'right', color: 'white' },
  footer: {
    backgroundColor: '#FF914D',
    color: '#FFFFFF',
    fontSize: 9,
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 40,
    paddingHorizontal: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 3
  },
  // Watermark
  watermark: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
  watermarkImg: { width: '70%', transform: 'rotate(-45deg)' },
  // Layout
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
  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
  col2: { width: '50%', paddingHorizontal: 5, marginBottom: 8 },
  colFull: { width: '100%', paddingHorizontal: 5, marginBottom: 8 },
  // Field
  label: { fontSize: 8, color: '#6B7280', marginBottom: 2, textTransform: 'uppercase' },
  value: { fontSize: 10, color: '#111827' },
  // Bullet
  bulletRow: { flexDirection: 'row', marginBottom: 4 },
  bulletDot: { fontSize: 10, marginRight: 6, color: '#FF914D' },
  actionNumber: { width: 18, fontSize: 9, color: '#FF914D' },
  actionText: { flex: 1, fontSize: 10, color: '#111827', lineHeight: 1.4 },
  // Chip
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
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
  // Status banners
  openBanner: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    borderRadius: 4,
    padding: 10,
    marginBottom: 8
  },
  openBannerText: { fontSize: 10, color: '#C2410C', fontWeight: 'bold' },
  closedBanner: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 4,
    padding: 10,
    marginBottom: 8
  },
  closedBannerText: { fontSize: 10, color: '#15803D', fontWeight: 'bold' },
  // Severity badge
  severityLow:    { backgroundColor: '#DCFCE7', color: '#15803D' },
  severityMedium: { backgroundColor: '#FEF9C3', color: '#854D0E' },
  severityHigh:   { backgroundColor: '#FEE2E2', color: '#B91C1C' },
  severityBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 2
  },
  severityBadgeText: { fontSize: 9, fontWeight: 'bold' }
});

// ─── Sub-components ───────────────────────────────────────────────────────────

const PageHeader = ({ reportNo, type, date }: { reportNo: string; type: string; date: string }) => (
  <View style={S.header} fixed>
    <View style={S.headerRow}>
      <View>
        <Text style={S.headerTitle}>UA / UC / Near Miss Report</Text>
        <Text style={S.headerSub}>{type} · Ref: {reportNo}</Text>
      </View>
      <Text style={S.headerDate}>Date: {date}</Text>
    </View>
  </View>
);

const PageFooter = () => (
  <View style={S.footer} fixed>
    <Text style={{ fontSize: 8, color: '#FFF', opacity: 0.85 }}>
      Confidential — Safezy EHS Report
    </Text>
    <Text
      style={{ fontSize: 10, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'right' }}
      render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
    />
  </View>
);

const Watermark = () => (
  <View style={S.watermark} fixed>
    <Image src={ASSETS.IMG.SAFEZY_TEXT.src} style={S.watermarkImg} />
  </View>
);

const Field = ({ label, value }: { label: string; value?: string | null }) => {
  if (!value) return null;
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={S.label}>{label}</Text>
      <Text style={S.value}>{value}</Text>
    </View>
  );
};

const GridField = ({ label, value, full }: { label: string; value?: string | null; full?: boolean }) => {
  if (!value) return null;
  return (
    <View style={full ? S.colFull : S.col2}>
      <Text style={S.label}>{label}</Text>
      <Text style={S.value}>{value}</Text>
    </View>
  );
};

const ChipList = ({ label, items, extra }: { label: string; items: string[]; extra?: string | null }) => {
  if (items.length === 0 && !extra) return null;
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={S.label}>{label}</Text>
      <View style={S.chipRow}>
        {items.map((item, i) => (
          <View key={i} style={S.chip}>
            <Text style={S.chipText}>{item}</Text>
          </View>
        ))}
        {extra && (
          <View style={S.chip}>
            <Text style={S.chipText}>Other: {extra}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const ActionList = ({
  label,
  items
}: {
  label: string;
  items: string[];
}) => (
  <View style={[S.fieldGroup, { marginBottom: 12 }]}>
    <Text style={[S.label, { marginBottom: 6 }]}>{label}</Text>
    {items.length === 0 ? (
      <Text style={[S.value, { color: '#9CA3AF' }]}>No points added.</Text>
    ) : (
      items.map((item, index) => (
        <View key={index} style={S.bulletRow} wrap={false}>
          <Text style={S.actionNumber}>{index + 1}.</Text>
          <Text style={S.actionText}>{item}</Text>
        </View>
      ))
    )}
  </View>
);

// ─── Main PDF ─────────────────────────────────────────────────────────────────

const UaUcReportPdf = ({ report }: { report: UaUcNearMissRecord }) => {
  const observationLabel = OBSERVATION_LABEL[report.observation_type] ?? report.observation_type;
  const createdDate = formatDateTime(report.reported_at);
  const isOpen = report.status === 'Open';

  const pageProps = { size: 'A4' as const, style: S.page };

  return (
    <Document>
      {/* ══════════════════════════════════════════════
          PAGE 1 — Main Report
      ══════════════════════════════════════════════ */}
      <Page {...pageProps}>
        <Watermark />
        <PageHeader reportNo={report.report_no} type={observationLabel} date={createdDate} />

        <Text style={S.pageTitle}>{observationLabel} — Observation Report</Text>

        {/* Section 1 — Basic Information */}
        <Text style={S.sectionTitle}>Section 1 — Basic Information</Text>
        <View style={S.fieldGroup}>
          <View style={S.grid}>
            <GridField label="Report No" value={report.report_no} />
            <GridField label="Date & Time" value={createdDate} />
            <GridField label="Location / Department" value={report.location_department} />
            <GridField label="Reported By" value={`${report.reported_by_name}${report.employee_id ? ` (${report.employee_id})` : ''}`} />
            <GridField label="Type of Observation" value={observationLabel} full />
          </View>
        </View>

        {/* Section 2 — Observation Details */}
        <Text style={S.sectionTitle}>Section 2 — Observation Details (AI Analysis)</Text>
        <View style={S.fieldGroup}>
          <Field label="What happened / was observed" value={report.what_happened} />
          <Field label="Equipment / tools involved" value={report.equipment_involved} />
          <Field label="Activity at time of report" value={report.activity_at_time} />
        </View>

        {/* Section 3 — Classification */}
        <Text style={S.sectionTitle}>Section 3 — Classification (AI Classified)</Text>
        <View style={S.fieldGroup}>
          {report.observation_type === 'UA' && (
            <>
              <ChipList
                label="Unsafe Act Type(s)"
                items={report.ua_classifications ?? []}
                extra={report.ua_other}
              />
              {report.ua_classifications?.length === 0 && !report.ua_other && (
                <Text style={[S.value, { color: '#9CA3AF' }]}>None selected</Text>
              )}
            </>
          )}

          {report.observation_type === 'UC' && (
            <>
              <ChipList
                label="Unsafe Condition Type(s)"
                items={report.uc_classifications ?? []}
                extra={report.uc_other}
              />
              {report.uc_classifications?.length === 0 && !report.uc_other && (
                <Text style={[S.value, { color: '#9CA3AF' }]}>None selected</Text>
              )}
            </>
          )}

          {report.observation_type === 'NearMiss' && (
            <View style={S.grid}>
              <GridField label="Potential Injury Type" value={report.nm_potential_injury} />
              <View style={S.col2}>
                <Text style={S.label}>Severity Potential</Text>
                {report.nm_severity && (
                  <View style={[
                    S.severityBadge,
                    report.nm_severity === 'Low'    ? S.severityLow :
                    report.nm_severity === 'Medium' ? S.severityMedium :
                    S.severityHigh
                  ]}>
                    <Text style={S.severityBadgeText}>{report.nm_severity}</Text>
                  </View>
                )}
              </View>
              <View style={S.colFull}>
                <Text style={S.label}>What Could Have Happened</Text>
                <Text style={S.value}>{report.nm_what_could_happen ?? '—'}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Section 4 — Status & Action */}
        <Text style={S.sectionTitle}>Section 4 — Status & Immediate Action</Text>
        {isOpen ? (
          <View style={S.openBanner}>
            <Text style={S.openBannerText}>Status: OPEN — Action needs to be taken</Text>
          </View>
        ) : (
          <View style={S.closedBanner}>
            <Text style={[S.closedBannerText, { marginBottom: 6 }]}>Status: CLOSED</Text>
            <View style={S.fieldGroup}>
              <Field label="Action Taken" value={report.action_taken} />
              <View style={S.grid}>
                <GridField label="By Whom" value={report.action_by} />
                <GridField label="Date" value={formatDate(report.action_date)} />
              </View>
              {report.closure_image_url && (
                <View style={{ marginTop: 8 }}>
                  <Text style={[S.label, { marginBottom: 4 }]}>CLOSURE EVIDENCE</Text>
                  <Image
                    src={report.closure_image_url}
                    style={{ maxHeight: 200, objectFit: 'contain', borderRadius: 4 }}
                  />
                </View>
              )}
            </View>
          </View>
        )}

        <PageFooter />
      </Page>

      {/* ══════════════════════════════════════════════
          PAGE 2 — CAPA Points
      ══════════════════════════════════════════════ */}
      <Page {...pageProps}>
        <Watermark />
        <PageHeader reportNo={report.report_no} type={observationLabel} date={createdDate} />
        <Text style={S.pageTitle}>Section 5 — CAPA Points</Text>

        {report.capa_points ? (
          <>
            <ActionList
              label="Corrective Actions — immediate actions to correct the issue"
              items={report.capa_points.corrective ?? []}
            />
            <ActionList
              label="Preventive Actions — long-term actions to prevent recurrence"
              items={report.capa_points.preventive ?? []}
            />
          </>
        ) : (
          <View style={S.fieldGroup}>
            <Text style={[S.value, { color: '#6B7280' }]}>CAPA points are not yet available.</Text>
          </View>
        )}

        <PageFooter />
      </Page>

      {/* ══════════════════════════════════════════════
          PAGE 3 — Evidence (only if image)
          For video/voice: show link + note instead
      ══════════════════════════════════════════════ */}
      {(() => {
        const urls = report.media_urls?.length ? report.media_urls : (report.media_url ? [report.media_url] : []);
        const types = report.media_types?.length ? report.media_types : (report.media_type ? [report.media_type] : []);
        if (!urls.length) return null;
        return (
          <Page {...pageProps}>
            <Watermark />
            <PageHeader reportNo={report.report_no} type={observationLabel} date={createdDate} />
            <Text style={S.pageTitle}>Section 6 — Evidence</Text>
            {urls.map((url, i) => {
              const type = types[i] ?? 'image';
              return (
                <View key={i} style={{ marginBottom: 16 }}>
                  {type === 'image' && (
                    <View>
                      <Text style={S.sectionTitle}>Photo {urls.length > 1 ? `${i + 1}` : ''}</Text>
                      <Image
                        src={url}
                        style={{ maxHeight: 400, objectFit: 'contain', borderRadius: 4 }}
                      />
                      <Text style={{ fontSize: 8, color: '#6B7280', textAlign: 'center', marginTop: 6 }}>
                        Photo submitted with this report
                      </Text>
                    </View>
                  )}
                  {type === 'video' && (
                    <View style={S.fieldGroup}>
                      <Text style={S.sectionTitle}>Video {urls.length > 1 ? `${i + 1}` : ''}</Text>
                      <Text style={[S.value, { marginBottom: 6 }]}>
                        A video was submitted with this report. It cannot be embedded in the PDF.
                      </Text>
                      <Text style={S.label}>Video URL</Text>
                      <Link src={url} style={{ fontSize: 9, color: '#FF914D' }}>{url}</Link>
                    </View>
                  )}
                  {type === 'voice' && (
                    <View style={S.fieldGroup}>
                      <Text style={S.sectionTitle}>Voice Note {urls.length > 1 ? `${i + 1}` : ''}</Text>
                      <Text style={[S.value, { marginBottom: 6 }]}>
                        A voice note was submitted with this report. It cannot be embedded in the PDF.
                      </Text>
                      <Text style={S.label}>Audio URL</Text>
                      <Link src={url} style={{ fontSize: 9, color: '#FF914D' }}>{url}</Link>
                    </View>
                  )}
                </View>
              );
            })}
            <PageFooter />
          </Page>
        );
      })()}
    </Document>
  );
};

export default UaUcReportPdf;
