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
  fonts: [{ src: '/fonts/Inter-Regular.ttf', fontWeight: 'normal' }]
});

// ── HTML parser ───────────────────────────────────────────────────────────

type Seg = { text: string; bold: boolean };
type Block =
  | { kind: 'heading'; segs: Seg[] }
  | { kind: 'subheading'; segs: Seg[] }
  | { kind: 'para'; segs: Seg[] }
  | { kind: 'li'; segs: Seg[] };

function decode(s: string) {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function parseInline(html: string): Seg[] {
  const segs: Seg[] = [];
  const parts = html.split(/(<(?:strong|b)[^>]*>[\s\S]*?<\/(?:strong|b)>)/gi);
  for (const part of parts) {
    const m = /^<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>$/i.exec(part);
    if (m) {
      const t = decode(m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
      if (t) segs.push({ text: t, bold: true });
    } else {
      const t = decode(part.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
      if (t) segs.push({ text: t, bold: false });
    }
  }
  return segs.filter(s => s.text.length > 0);
}

function parseHtml(html: string): Block[] {
  const blocks: Block[] = [];
  const re = /<(h[1-6]|p|li)[^>]*>([\s\S]*?)<\/\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const tag = m[1].toLowerCase();
    const segs = parseInline(m[2]);
    if (!segs.length) continue;
    if (tag === 'h1' || tag === 'h2') blocks.push({ kind: 'heading', segs });
    else if (/^h[3-6]$/.test(tag)) blocks.push({ kind: 'subheading', segs });
    else if (tag === 'p') blocks.push({ kind: 'para', segs });
    else blocks.push({ kind: 'li', segs });
  }
  return blocks;
}

function stripHtmlPlain(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ── Styles ────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  page: {
    backgroundColor: 'white',
    paddingTop: 90,
    paddingBottom: 48,
    paddingHorizontal: 28,
    fontFamily: 'Inter'
  },
  header: {
    backgroundColor: '#FF914D',
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 74,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 3
  },
  logoBox: {
    backgroundColor: 'white',
    borderRadius: 4,
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14
  },
  logo: { width: 44, height: 44, objectFit: 'contain' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  topicBar: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#FF914D',
    alignItems: 'center'
  },
  topicBarText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
    textDecoration: 'underline'
  },
  introPara: {
    fontSize: 8.5,
    color: '#374151',
    lineHeight: 1.65,
    marginBottom: 10,
    textAlign: 'justify'
  },
  twoCol: { flexDirection: 'row', gap: 12 },
  leftCol: { flex: 1 },
  rightCol: { width: 182 },
  heading: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
    marginBottom: 3,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#FF914D'
  },
  subheading: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 6,
    marginBottom: 2
  },
  para: {
    fontSize: 8,
    color: '#4B5563',
    lineHeight: 1.6,
    marginBottom: 5,
    textAlign: 'justify'
  },
  bulletRow: { flexDirection: 'row', marginBottom: 3 },
  bullet: { fontSize: 8, color: '#FF914D', marginRight: 4, marginTop: 1 },
  bulletText: { flex: 1, fontSize: 8, color: '#4B5563', lineHeight: 1.5 },
  topicImage: {
    width: '100%',
    objectFit: 'contain',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  summaryBox: {
    marginTop: 12,
    backgroundColor: '#FFF7ED',
    borderRadius: 4,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FF914D'
  },
  summaryTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4
  },
  summaryText: { fontSize: 8, color: '#4B5563', lineHeight: 1.6 },
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
  watermarkImg: { width: '65%', transform: 'rotate(-45deg)' }
});

// ── Helpers ───────────────────────────────────────────────────────────────

function InlineText({ segs, style }: { segs: Seg[]; style: object }) {
  return (
    <Text style={style}>
      {segs.map((s, i) => (
        <Text key={i} style={s.bold ? { color: '#111827' } : {}}>
          {s.text}
        </Text>
      ))}
    </Text>
  );
}

function renderBlock(block: Block, i: number) {
  switch (block.kind) {
    case 'heading':
      return <InlineText key={i} segs={block.segs} style={S.heading} />;
    case 'subheading':
      return <InlineText key={i} segs={block.segs} style={S.subheading} />;
    case 'para':
      return <InlineText key={i} segs={block.segs} style={S.para} />;
    case 'li':
      return (
        <View key={i} style={S.bulletRow}>
          <Text style={S.bullet}>•</Text>
          <Text style={S.bulletText}>
            {block.segs.map((s, j) => (
              <Text key={j} style={s.bold ? { color: '#111827' } : {}}>
                {s.text}
              </Text>
            ))}
          </Text>
        </View>
      );
  }
}

// ── Component ─────────────────────────────────────────────────────────────

const ToolboxTalkContentPdf = ({ toolboxTalk }: { toolboxTalk: ToolboxTalkType }) => {
  const blocks = toolboxTalk.description ? parseHtml(toolboxTalk.description) : [];

  // Hoist first paragraph (before any heading) as full-width intro
  let intro: Block | null = null;
  let body = blocks;
  if (blocks.length > 0 && blocks[0].kind === 'para') {
    intro = blocks[0];
    body = blocks.slice(1);
  }

  const plainSummary = toolboxTalk.summarized
    ? stripHtmlPlain(toolboxTalk.summarized)
    : null;

  const hasImage = !!toolboxTalk.pdf_url;

  return (
    <Document>
      <Page size="A4" style={S.page}>
        <View style={S.watermark} fixed>
          <Image src={ASSETS.IMG.SAFEZY_TEXT.src} style={S.watermarkImg} />
        </View>

        <View style={S.header} fixed>
          <View style={S.logoBox}>
            <Image src={ASSETS.IMG.APP_LOGO.src} style={S.logo} />
          </View>
          <View style={S.headerCenter}>
            <Text style={S.headerTitle}>EHS Toolbox Talk</Text>
          </View>
        </View>

        <View style={S.topicBar}>
          <Text style={S.topicBarText}>{toolboxTalk.topic_name}</Text>
        </View>

        {intro && <InlineText segs={intro.segs} style={S.introPara} />}

        <View style={hasImage ? S.twoCol : {}}>
          <View style={hasImage ? S.leftCol : {}}>
            {body.map((b, i) => renderBlock(b, i))}
          </View>
          {hasImage && (
            <View style={S.rightCol}>
              <Image src={toolboxTalk.pdf_url as string} style={S.topicImage} />
            </View>
          )}
        </View>

        {plainSummary && (
          <View style={S.summaryBox}>
            <Text style={S.summaryTitle}>Summary</Text>
            <Text style={S.summaryText}>{plainSummary}</Text>
          </View>
        )}

        <View style={S.footer} fixed>
          <Text style={{ fontSize: 7, color: '#FFF', opacity: 0.85 }}>
            Confidential — Safezy EHS
          </Text>
          <Text
            style={{ fontSize: 8, color: '#FFFFFF' }}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
};

export default ToolboxTalkContentPdf;
