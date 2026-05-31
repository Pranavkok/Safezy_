import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { paddingTop: 30, paddingBottom: 40, paddingLeft: 30, paddingRight: 30, fontSize: 9, fontFamily: 'Helvetica', color: '#333333' },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: '#FF914D', borderBottomStyle: 'solid' },
  headerTitle: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#FF914D' },
  headerSub: { fontSize: 9, color: '#888888' },

  // Topic
  topicBanner: { backgroundColor: '#FF914D', paddingTop: 7, paddingBottom: 7, paddingLeft: 12, paddingRight: 12, marginBottom: 12, borderRadius: 3 },
  topicText: { color: '#FFFFFF', fontSize: 11, fontFamily: 'Helvetica-Bold', textAlign: 'center' },

  // Info grid
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'solid', borderRadius: 3 },
  infoItem: { width: '33.33%', paddingTop: 5, paddingBottom: 5, paddingLeft: 8, paddingRight: 8, borderRightWidth: 1, borderRightColor: '#E2E8F0', borderRightStyle: 'solid', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', borderBottomStyle: 'solid' },
  infoLabel: { fontSize: 7, color: '#999999', marginBottom: 2 },
  infoValue: { fontSize: 9, color: '#222222', fontFamily: 'Helvetica-Bold' },

  // Summary
  summaryRow: { flexDirection: 'row', marginBottom: 12, paddingTop: 8, paddingBottom: 8, paddingLeft: 10, paddingRight: 10, backgroundColor: '#FFF5EB', borderRadius: 3, borderWidth: 1, borderColor: '#FFDDB8', borderStyle: 'solid' },
  summaryItem: { alignItems: 'center', flex: 1 },
  summaryNum: { fontSize: 14, fontFamily: 'Helvetica-Bold' },
  summaryLabel: { fontSize: 7, color: '#888888' },

  // Table
  sectionTitle: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#FF914D', marginBottom: 4 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#FF914D', paddingTop: 5, paddingBottom: 5, paddingLeft: 8, paddingRight: 8 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', borderBottomStyle: 'solid', paddingTop: 5, paddingBottom: 5, paddingLeft: 8, paddingRight: 8 },
  tableRowAlt: { backgroundColor: '#FAFAFA' },
  colNum: { width: '5%', fontSize: 8 },
  colQ: { width: '50%', fontSize: 8 },
  colAns: { width: '13%', fontSize: 8, textAlign: 'center' },
  colWt: { width: '10%', fontSize: 8, textAlign: 'center', color: '#FF914D', fontFamily: 'Helvetica-Bold' },
  colRmk: { width: '22%', fontSize: 7, color: '#666666' },
  thText: { color: '#FFFFFF', fontSize: 8, fontFamily: 'Helvetica-Bold' },
  thWt: { color: '#FFFFFF', fontSize: 8, fontFamily: 'Helvetica-Bold', textAlign: 'center' },
  thAns: { color: '#FFFFFF', fontSize: 8, fontFamily: 'Helvetica-Bold', textAlign: 'center' },
  yes: { color: '#38A169', fontFamily: 'Helvetica-Bold', fontSize: 8, textAlign: 'center' },
  no: { color: '#E53E3E', fontFamily: 'Helvetica-Bold', fontSize: 8, textAlign: 'center' },
  na: { color: '#718096', fontSize: 8, textAlign: 'center' },

  // Footer
  footer: { position: 'absolute', bottom: 20, left: 30, right: 30, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#E2E8F0', borderTopStyle: 'solid', paddingTop: 5 },
  footerText: { fontSize: 7, color: '#BBBBBB' }
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

        <View style={styles.header}>
          <Text style={styles.headerTitle}>SAFEZY</Text>
          <Text style={styles.headerSub}>EHS Checklist Report</Text>
        </View>

        <View style={styles.topicBanner}>
          <Text style={styles.topicText}>{data.topicName.toUpperCase()}</Text>
        </View>

        <View style={styles.infoGrid}>
          {infoFields.map((f, i) => (
            <View key={i} style={styles.infoItem}>
              <Text style={styles.infoLabel}>{f.label}</Text>
              <Text style={styles.infoValue}>{f.value || '-'}</Text>
            </View>
          ))}
        </View>

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

        <Text style={styles.sectionTitle}>QUESTIONS AND ANSWERS</Text>
        <View>
          <View style={styles.tableHeader}>
            <Text style={[styles.thText, { width: '5%' }]}>#</Text>
            <Text style={[styles.thText, { width: '50%' }]}>Question</Text>
            <Text style={[styles.thAns, { width: '13%' }]}>Answer</Text>
            <Text style={[styles.thWt, { width: '10%' }]}>Wt.</Text>
            <Text style={[styles.thText, { width: '22%' }]}>Remarks</Text>
          </View>
          {data.answers.map((a, idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.colNum, { color: '#AAAAAA' }]}>{idx + 1}</Text>
              <Text style={styles.colQ}>{a.question}</Text>
              <Text style={a.answer === 'Yes' ? styles.yes : a.answer === 'No' ? styles.no : styles.na}>
                {a.answer || 'N/A'}
              </Text>
              <Text style={styles.colWt}>{a.weightage}</Text>
              <Text style={styles.colRmk}>{a.remark || ''}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Generated by Safezy EHS Platform</Text>
          <Text style={styles.footerText}>{fmt(data.date)}</Text>
        </View>

      </Page>
    </Document>
  );
};

export default ChecklistPdfDocument;
