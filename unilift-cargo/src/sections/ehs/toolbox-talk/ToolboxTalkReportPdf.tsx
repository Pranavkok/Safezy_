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
import { isImageUrl, getAttachmentLabel } from '@/utils';

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
    paddingTop: 88,
    paddingBottom: 48,
    paddingHorizontal: 28,
    fontFamily: 'Inter'
  },
  header: {
    backgroundColor: '#FF914D',
    paddingHorizontal: 28,
    paddingVertical: 14,
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 72,
    zIndex: 3
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 14, fontWeight: 'bold', color: 'white', marginBottom: 2 },
  headerSub: { fontSize: 8, color: 'white', opacity: 0.9 },
  headerDate: { fontSize: 8, color: 'white', textAlign: 'right' },
  footer: {
    backgroundColor: '#FF914D',
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 36,
    paddingHorizontal: 28,
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
  watermarkImg: { width: '65%', transform: 'rotate(-45deg)' },
  // Page title
  pageTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF914D',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: '1.5px solid #FF914D'
  },
  // Status banner
  completedBanner: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 3,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  completedBannerText: { fontSize: 9, color: '#15803D', fontWeight: 'bold' },
  // Section
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 5,
    marginTop: 8,
    borderRadius: 2
  },
  fieldGroup: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 3,
    marginBottom: 4
  },
  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  col2: { width: '50%', paddingHorizontal: 4, marginBottom: 5 },
  col3: { width: '33.33%', paddingHorizontal: 4, marginBottom: 5 },
  colFull: { width: '100%', paddingHorizontal: 4, marginBottom: 5 },
  // Fields
  label: { fontSize: 7, color: '#6B7280', marginBottom: 1, textTransform: 'uppercase' },
  value: { fontSize: 9, color: '#111827' },
  // Chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    backgroundColor: '#FFF3EC',
    borderWidth: 1,
    borderColor: '#FF914D',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 3
  },
  chipText: { fontSize: 7, color: '#FF914D' },
  // Images grid
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -3 },
  imageCell: { width: '50%', paddingHorizontal: 3, marginBottom: 6 },
  imageThumb: { height: 110, objectFit: 'contain', borderRadius: 3, backgroundColor: '#F9FAFB' },
  imageLabel: { fontSize: 7, color: '#6B7280', textAlign: 'center', marginTop: 2 },
  // Non-image attachment row
  docRow: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'solid',
    borderRadius: 3,
    padding: 6,
    marginBottom: 4,
    backgroundColor: '#F9FAFB'
  },
  docText: { fontSize: 8, color: '#374151' },
  docUrl: { fontSize: 7, color: '#6B7280', marginTop: 2 }
});

const PageHeader = ({ topicName, date }: { topicName: string; date: string }) => (
  <View style={S.header} fixed>
    <View style={S.headerRow}>
      <View>
        <Text style={S.headerTitle}>EHS Toolbox Talk — Completion Report</Text>
        <Text style={S.headerSub}>{topicName}</Text>
      </View>
      <Text style={S.headerDate}>{date}</Text>
    </View>
  </View>
);

const PageFooter = () => (
  <View style={S.footer} fixed>
    <Text style={{ fontSize: 7, color: '#FFF', opacity: 0.85 }}>Confidential — Safezy EHS Report</Text>
    <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#FFFFFF' }}>Page 1 of 1</Text>
  </View>
);

const Watermark = () => (
  <View style={S.watermark} fixed>
    <Image src={ASSETS.IMG.SAFEZY_TEXT.src} style={S.watermarkImg} />
  </View>
);

const GridField = ({ label, value, full, third }: { label: string; value?: string | null; full?: boolean; third?: boolean }) => {
  if (!value) return null;
  return (
    <View style={full ? S.colFull : third ? S.col3 : S.col2}>
      <Text style={S.label}>{label}</Text>
      <Text style={S.value}>{value}</Text>
    </View>
  );
};

const StarRatingPdf = ({ rating }: { rating: number | null }) => {
  if (!rating) return <Text style={[S.value, { color: '#9CA3AF' }]}>Not rated</Text>;
  return (
    <Text style={{ fontSize: 12, color: '#F59E0B', letterSpacing: 1 }}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
      <Text style={{ fontSize: 8, color: '#6B7280' }}> {rating}/5</Text>
    </Text>
  );
};

const ToolboxTalkReportPdf = ({ report }: { report: ToolboxTalkCompletionReport }) => {
  const completionDate = formatDate(report.created_at);
  const superiorEmails = report.superior_email.split(',').map(e => e.trim()).filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={S.page}>
        <Watermark />
        <PageHeader topicName={report.topic_name} date={completionDate} />

        <Text style={S.pageTitle}>Toolbox Talk Completion Report</Text>

        {/* Status */}
        <View style={S.completedBanner}>
          <Text style={S.completedBannerText}>✓  COMPLETED</Text>
        </View>

        {/* Participant + Topic in one row */}
        <Text style={S.sectionTitle}>Participant & Session Details</Text>
        <View style={S.fieldGroup}>
          <View style={S.grid}>
            <GridField label="Full Name" value={`${report.first_name} ${report.last_name}`} />
            <GridField label="Email" value={report.email} />
            <GridField label="Topic" value={report.topic_name} />
            <GridField label="Completed On" value={completionDate} />
            <GridField label="Session Duration" value={formatDuration(report.duration_seconds)} third />
            <View style={S.col3}>
              <Text style={S.label}>Rating</Text>
              <StarRatingPdf rating={report.rating} />
            </View>
            {report.comments && <GridField label="Comments / Remarks" value={report.comments} third />}
          </View>
        </View>

        {/* Notified Superiors */}
        <Text style={S.sectionTitle}>Notified Superiors</Text>
        <View style={S.fieldGroup}>
          <View style={S.chipRow}>
            {superiorEmails.map((email, i) => (
              <View key={i} style={S.chip}>
                <Text style={S.chipText}>{email}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Attendance Sheets — images as a thumbnail grid, docs as link rows */}
        {report.attendance_images.length > 0 && (
          <>
            <Text style={S.sectionTitle}>Attendance Sheets</Text>
            <View style={S.imageGrid}>
              {report.attendance_images
                .filter(url => isImageUrl(url))
                .map((url, i) => (
                  <View key={i} style={S.imageCell}>
                    <Image src={url} style={S.imageThumb} />
                    {report.attendance_images.filter(u => isImageUrl(u)).length > 1 && (
                      <Text style={S.imageLabel}>Sheet {i + 1}</Text>
                    )}
                  </View>
                ))}
            </View>
            {report.attendance_images
              .filter(url => !isImageUrl(url))
              .map((url, i) => (
                <View key={i} style={S.docRow}>
                  <Text style={S.docText}>
                    {getAttachmentLabel(url)} attachment
                  </Text>
                  <Text style={S.docUrl}>{url}</Text>
                </View>
              ))}
          </>
        )}

        <PageFooter />
      </Page>
    </Document>
  );
};

export default ToolboxTalkReportPdf;
