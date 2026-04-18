'use client';

import React from 'react';
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
import { ToolboxTalkCompletionReport } from '@/types/ehs.types';

Font.register({
  family: 'Inter',
  fonts: [{ src: '/fonts/Inter-Regular.ttf' }]
});

const formatDate = (str: string) =>
  new Date(str).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });

const formatDuration = (seconds: number | null) => {
  if (!seconds) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);
  return parts.join(' ');
};

const S = StyleSheet.create({
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
  watermark: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 0,
    justifyContent: 'center',
    alignItems: 'center'
  },
  watermarkImg: { width: '70%', transform: 'rotate(-45deg)' },
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
  col2: { width: '50%', paddingHorizontal: 5, marginBottom: 8 },
  colFull: { width: '100%', paddingHorizontal: 5, marginBottom: 8 },
  label: { fontSize: 8, color: '#6B7280', marginBottom: 2, textTransform: 'uppercase' },
  value: { fontSize: 10, color: '#111827' },
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
  completedBanner: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 4,
    padding: 10,
    marginBottom: 8
  },
  completedBannerText: { fontSize: 11, color: '#15803D', fontWeight: 'bold' }
});

const PageHeader = ({ topicName, date }: { topicName: string; date: string }) => (
  <View style={S.header} fixed>
    <View style={S.headerRow}>
      <View>
        <Text style={S.headerTitle}>EHS Toolbox Talk — Completion Report</Text>
        <Text style={S.headerSub}>{topicName}</Text>
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

const StarRatingPdf = ({ rating }: { rating: number | null }) => {
  if (!rating) return <Text style={[S.value, { color: '#9CA3AF' }]}>Not rated</Text>;
  const filled = '★'.repeat(rating);
  const empty = '☆'.repeat(5 - rating);
  return (
    <Text style={{ fontSize: 14, color: '#F59E0B', letterSpacing: 2 }}>
      {filled}{empty} <Text style={{ fontSize: 10, color: '#6B7280' }}>{rating}/5</Text>
    </Text>
  );
};

const ToolboxTalkReportPdf = ({ report }: { report: ToolboxTalkCompletionReport }) => {
  const completionDate = formatDate(report.created_at);
  const superiorEmails = report.superior_email.split(',').map(e => e.trim()).filter(Boolean);
  const pageProps = { size: 'A4' as const, style: S.page };

  return (
    <Document>
      <Page {...pageProps}>
        <Watermark />
        <PageHeader topicName={report.topic_name} date={completionDate} />

        <Text style={S.pageTitle}>Toolbox Talk Completion Report</Text>

        {/* Completed banner */}
        <View style={S.completedBanner}>
          <Text style={S.completedBannerText}>Status: COMPLETED ✓</Text>
        </View>

        {/* Section 1 — Participant Info */}
        <Text style={S.sectionTitle}>Section 1 — Participant Information</Text>
        <View style={S.fieldGroup}>
          <View style={S.grid}>
            <GridField label="Full Name" value={`${report.first_name} ${report.last_name}`} />
            <GridField label="Email" value={report.email} />
            <GridField label="Completed On" value={completionDate} />
            <GridField label="Session Duration" value={formatDuration(report.duration_seconds)} />
          </View>
        </View>

        {/* Section 2 — Topic Details */}
        <Text style={S.sectionTitle}>Section 2 — Topic Details</Text>
        <View style={S.fieldGroup}>
          <Field label="Topic Name" value={report.topic_name} />
          <View style={{ marginBottom: 8 }}>
            <Text style={S.label}>Rating</Text>
            <StarRatingPdf rating={report.rating} />
          </View>
          {report.comments && <Field label="Comments / Remarks" value={report.comments} />}
        </View>

        {/* Section 3 — Notified Superiors */}
        <Text style={S.sectionTitle}>Section 3 — Notified Superiors</Text>
        <View style={S.fieldGroup}>
          <View style={S.chipRow}>
            {superiorEmails.map((email, i) => (
              <View key={i} style={S.chip}>
                <Text style={S.chipText}>{email}</Text>
              </View>
            ))}
          </View>
        </View>

        <PageFooter />
      </Page>

      {/* Page 2 — Attendance Sheets (only if images exist) */}
      {report.attendance_images.length > 0 && (
        <Page {...pageProps}>
          <Watermark />
          <PageHeader topicName={report.topic_name} date={completionDate} />
          <Text style={S.pageTitle}>Section 4 — Attendance Sheets</Text>
          {report.attendance_images.map((url, i) => (
            <View key={i} style={{ marginBottom: 16 }}>
              <Text style={S.sectionTitle}>
                Attendance Sheet {report.attendance_images.length > 1 ? i + 1 : ''}
              </Text>
              <Image
                src={url}
                style={{ maxHeight: 400, objectFit: 'contain', borderRadius: 4 }}
              />
            </View>
          ))}
          <PageFooter />
        </Page>
      )}
    </Document>
  );
};

export default ToolboxTalkReportPdf;
