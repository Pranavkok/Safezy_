'use client';

import { useState, useEffect } from 'react';
import { Download, Loader } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';
import ToolboxTalkContentPdf from './ToolboxTalkContentPdf';
import { ToolboxTalkType } from '@/types/index.types';

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function handleNativeDownload(blob: Blob, fileName: string) {
  try {
    const base64Data = await blobToBase64(blob);
    const base64 = base64Data.split(',')[1];
    const directory = Capacitor.getPlatform() === 'android' ? Directory.Data : Directory.Documents;
    const saved = await Filesystem.writeFile({ path: fileName, data: base64, directory, recursive: true });
    await FileOpener.open({ filePath: saved.uri, contentType: 'application/pdf' });
  } catch (error) {
    alert(error instanceof Error ? `Failed to save file: ${error.message}` : 'Failed to save file on device.');
  }
}

const ToolboxTalkContentDownloadButton = ({ toolboxTalk }: { toolboxTalk: ToolboxTalkType }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { setIsClient(true); }, []);

  if (!isClient) return null;

  const isNativeMobile =
    typeof Capacitor !== 'undefined' &&
    Capacitor.isNativePlatform &&
    Capacitor.isNativePlatform();

  const fileName = `toolbox_talk_${toolboxTalk.id}_${toolboxTalk.topic_name.replace(/\s+/g, '_').toLowerCase()}.pdf`;

  const handleDownload = async (blob: Blob | null) => {
    if (!blob || !isNativeMobile) return;
    await handleNativeDownload(blob, fileName);
  };

  return (
    <PDFDownloadLink
      document={<ToolboxTalkContentPdf toolboxTalk={toolboxTalk} />}
      fileName={fileName}
    >
      {({ loading, blob }) => (
        <button
          onClick={() => handleDownload(blob!)}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-primary rounded-md px-4 sm:px-6 py-2 text-white font-extrabold text-xs sm:text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader size={15} className="animate-spin" /> : <Download size={15} />}
          {loading ? 'Preparing PDF...' : 'Download PDF'}
        </button>
      )}
    </PDFDownloadLink>
  );
};

export default ToolboxTalkContentDownloadButton;
