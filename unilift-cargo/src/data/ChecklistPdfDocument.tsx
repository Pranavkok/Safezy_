import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 9, fontFamily: 'Helvetica', color: '#333' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottom: '2px solid #FF914D'
  },
  headerTitle: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#FF914D' },
  headerSub: { fontSize: 9, color: '#888' },
  topicBanner: {
    backgroundColor: '#FF914D',
    padding: '7 12',
    marginBottom: 12,
    borderRadius: 3
  },
  topicText: { color: 'white', fontSize: 11, fontFamily: 'Helvetica-Bold', textAlign: 'center' },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
    border: '1px solid #E2E8F0',
    borderRadius: 3
  },
  infoItem: {
    width: '33%',
    padding: '5 8',
    borderRight: '1px solid #E2E8F0',
    borderBottom: '1px solid #E2E8F0'
  },
  infoLabel: { fontSize: 7, color: '#999', textTransform: 'uppercase', marginBottom: 2 },
  infoValue: { fontSize: 9, color: '#222', fontFamily: 'Helvetica-Bold' },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
    padding: '8 10',
    backgroundColor: '#FFF5EB',
    borderRadius: 3,
    border: '1px solid #FFDDB8'
  },
  summaryItem: { alignItems: 'center', flex: 1 },
  summaryNum: { fontSize: 14, fontFamily: 'Helvetica-Bold' },
  summaryLabel: { fontSize: 7, color: '#888', textTransform: 'uppercase' },
  sectionTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#FF914D',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 5
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#FF914D',
    padding: '5 8',
    borderRadius: '3 3 0 0'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #F0F0F0',
    padding: '5 8',
    alignItems: 'flex-start'
  },
  tableRowAlt: { backgroundColor: '#FAFAFA' },
  colNum: { width: '5%', fontSize: 8 },
  colQ: { width: '50%', fontSize: 8 },
  colAns: { width: '12%', fontSize: 8, textAlign: 'center' },
  colWt: { width: '10%', fontSize: 8, textAlign: 'center', color: '#FF914D', fontFamily: 'Helvetica-Bold' },
  colRmk: { width: '23%', fontSize: 7, color: '#666' },
  thText: { color: 'white', fontSize: 8, fontFamily: 'Helvetica-Bold' },
  yes: { color: '#38A169', fontFamily: 'Helvetica-Bold' },
  no: { color: '#E53E3E', fontFamily: 'Helvetica-Bold' },
  na: { color: '#718096' },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '1px solid #E2E8F0',
    paddingTop: 5
  },
  footerText: { fontSize: 7, color: '#BBB' }
});

export type ChecklistPdfData = {
  topicName: string;
  siteName: string;
  inspectedBy: string;
  date: string;
  headerValues?: { label: string; value: string }[];
  answers: { question: string; answer: string; remark: string; weightage: number }[];
  totalScore?: number;
};

function fmt(str: string) {
  try {
    return new Date(str).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return str;
  }
}

const ChecklistPdfDocument = ({ data }: { data: ChecklistPdfData }) => {
  const yesCount = data.answers.filter(a => a.answer === 'Yes').length;
  const noCount = data.answers.filter(a => a.answer === 'No').length;
  const naCount = data.answers.filter(a => a.answer === 'N/A').length;

  const infoFields = [
    { label: 'Site Name', value: data.siteName },
    { label: 'Inspected By', value: data.inspectedBy },
    { label: 'Date of Inspection', value: fmt(data.date) },
    ...(data.headerValues?.filter(hv => hv.value) ?? []).map(hv => ({ label: hv.label, value: hv.value }))
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SAFEZY</Text>
          <Text style={styles.headerSub}>EHS Checklist Report</Text>
        </View>

        {/* Topic */}
        <View style={styles.topicBanner}>
          <Text style={styles.topicText}>{data.topicName.toUpperCase()}</Text>
        </View>

        {/* Info grid */}
        <View style={styles.infoGrid}>
          {infoFields.map((f, i) => (
            <View key={i} style={styles.infoItem}>
              <Text style={styles.infoLabel}>{f.label}</Text>
              <Text style={styles.infoValue}>{f.value || '—'}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { color: '#38A169' }]}>{yesCount}</Text>
            <Text style={styles.summaryLabel}>Yes</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { color: '#E53E3E' }]}>{noCount}</Text>
            <Text style={styles.summaryLabel}>No</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { color: '#718096' }]}>{naCount}</Text>
            <Text style={styles.summaryLabel}>N/A</Text>
          </View>
          {data.totalScore !== undefined && (
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNum, { color: '#FF914D' }]}>{data.totalScore}</Text>
              <Text style={styles.summaryLabel}>Score</Text>
            </View>
          )}
        </View>

        {/* Table */}
        <Text style={styles.sectionTitle}>Questions &amp; Answers</Text>
        <View>
          <View style={styles.tableHeader}>
            <Text style={[styles.thText, styles.colNum]}>#</Text>
            <Text style={[styles.thText, styles.colQ]}>Question</Text>
            <Text style={[styles.thText, styles.colAns]}>Answer</Text>
            <Text style={[styles.thText, styles.colWt, { color: 'white' }]}>Wt.</Text>
            <Text style={[styles.thText, styles.colRmk]}>Remarks</Text>
          </View>
          {data.answers.map((a, idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.colNum, { color: '#AAA' }]}>{idx + 1}</Text>
              <Text style={styles.colQ}>{a.question}</Text>
              <Text style={[styles.colAns, a.answer === 'Yes' ? styles.yes : a.answer === 'No' ? styles.no : styles.na]}>
                {a.answer || 'N/A'}
              </Text>
              <Text style={styles.colWt}>{a.weightage}</Text>
              <Text style={styles.colRmk}>{a.remark || ''}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Generated by Safezy EHS Platform</Text>
          <Text style={styles.footerText}>{fmt(data.date)}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ChecklistPdfDocument;
