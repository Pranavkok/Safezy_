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
import { ToolboxTalkType } from '@/types/index.types';

Font.register({
  family: 'Inter',
  fonts: [{ src: '/fonts/Inter-Regular.ttf' }]
});

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

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
  topicBanner: {
    backgroundColor: '#FF914D',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14
  },
  topicText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center'
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 6,
    marginTop: 10,
    borderRadius: 2
  },
  contentBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8
  },
  contentText: {
    fontSize: 9,
    color: '#111827',
    lineHeight: 1.6
  },
  pdfImage: {
    width: '100%',
    objectFit: 'contain',
    borderRadius: 3,
    marginTop: 6
  }
});

const PageHeader = ({ topicName }: { topicName: string }) => (
  <View style={S.header} fixed>
    <View style={S.headerRow}>
      <View>
        <Text style={S.headerTitle}>EHS Toolbox Talk</Text>
        <Text style={S.headerSub}>{topicName}</Text>
      </View>
      <Text style={S.headerDate}>Safezy</Text>
    </View>
  </View>
);

const PageFooter = () => (
  <View style={S.footer} fixed>
    <Text style={{ fontSize: 7, color: '#FFF', opacity: 0.85 }}>Confidential — Safezy EHS</Text>
    <Text
      style={{ fontSize: 8, fontWeight: 'bold', color: '#FFFFFF' }}
      render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
    />
  </View>
);

const Watermark = () => (
  <View style={S.watermark} fixed>
    <Image src={ASSETS.IMG.SAFEZY_TEXT.src} style={S.watermarkImg} />
  </View>
);

const ToolboxTalkContentPdf = ({ toolboxTalk }: { toolboxTalk: ToolboxTalkType }) => {
  const plainDescription = toolboxTalk.description ? stripHtml(toolboxTalk.description) : null;
  const plainSummarize = toolboxTalk.summarized ? stripHtml(toolboxTalk.summarized) : null;

  return (
    <Document>
      <Page size="A4" style={S.page}>
        <Watermark />
        <PageHeader topicName={toolboxTalk.topic_name} />

        <View style={S.topicBanner}>
          <Text style={S.topicText}>{toolboxTalk.topic_name.toUpperCase()}</Text>
        </View>

        {plainDescription && (
          <>
            <Text style={S.sectionTitle}>Content</Text>
            <View style={S.contentBox}>
              <Text style={S.contentText}>{plainDescription}</Text>
            </View>
          </>
        )}

        {plainSummarize && (
          <>
            <Text style={S.sectionTitle}>Summary</Text>
            <View style={S.contentBox}>
              <Text style={S.contentText}>{plainSummarize}</Text>
            </View>
          </>
        )}

        {toolboxTalk.pdf_url && (
          <>
            <Text style={S.sectionTitle}>Reference Image</Text>
            <Image src={toolboxTalk.pdf_url} style={S.pdfImage} />
          </>
        )}

        <PageFooter />
      </Page>
    </Document>
  );
};

export default ToolboxTalkContentPdf;
