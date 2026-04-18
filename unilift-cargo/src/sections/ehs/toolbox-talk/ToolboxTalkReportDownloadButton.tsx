'use client';

import { useState, useEffect } from 'react';
import { Download, Loader, Shield, AlertCircle } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';
import ToolboxTalkReportPdf from './ToolboxTalkReportPdf';
import { ToolboxTalkCompletionReport } from '@/types/ehs.types';

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function checkAndRequestStoragePermission(): Promise<boolean> {
  try {
    const permissionStatus = await Filesystem.checkPermissions();
    if (permissionStatus.publicStorage === 'granted') return true;

    const requestResult = await Filesystem.requestPermissions();
    if (requestResult.publicStorage === 'granted') return true;

    if (Capacitor.getPlatform() === 'android') {
      const testFile = 'permission-test.txt';
      await Filesystem.writeFile({ path: testFile, data: 'test', directory: Directory.Data });
      await Filesystem.deleteFile({ path: testFile, directory: Directory.Data });
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

async function handleNativeDownload(blob: Blob, fileName: string) {
  try {
    const hasPermission = await checkAndRequestStoragePermission();
    if (!hasPermission) {
      alert('Storage permission is required to save files. Please enable it in your device settings.');
      return;
    }

    const base64Data = await blobToBase64(blob);
    const base64 = base64Data.split(',')[1];
    const directory = Capacitor.getPlatform() === 'android' ? Directory.Data : Directory.Documents;

    const saved = await Filesystem.writeFile({
      path: fileName,
      data: base64,
      directory,
      recursive: true
    });

    await FileOpener.open({ filePath: saved.uri, contentType: 'application/pdf' });
  } catch (error) {
    if (error instanceof Error) {
      alert(`Failed to save or open file: ${error.message}`);
    } else {
      alert('Failed to save or open file on device.');
    }
  }
}

const ToolboxTalkReportDownloadButton = ({ report }: { report: ToolboxTalkCompletionReport }) => {
  const isNativeMobile =
    typeof Capacitor !== 'undefined' &&
    Capacitor.isNativePlatform &&
    Capacitor.isNativePlatform();

  const [permissionStatus, setPermissionStatus] = useState<'checking' | 'granted' | 'denied' | 'unknown'>('checking');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  useEffect(() => {
    if (isNativeMobile) {
      checkPermissionStatus();
    } else {
      setPermissionStatus('granted');
    }
  }, [isNativeMobile]);

  const checkPermissionStatus = async () => {
    try {
      if (Capacitor.getPlatform() === 'android') {
        const testFile = 'permission-test.txt';
        try {
          await Filesystem.writeFile({ path: testFile, data: 'test', directory: Directory.Data });
          await Filesystem.deleteFile({ path: testFile, directory: Directory.Data });
          setPermissionStatus('granted');
        } catch {
          setPermissionStatus('denied');
        }
      } else {
        const status = await Filesystem.checkPermissions();
        setPermissionStatus(status.publicStorage === 'granted' ? 'granted' : 'denied');
      }
    } catch {
      setPermissionStatus('unknown');
    }
  };

  const handleRequestPermission = async () => {
    setIsRequestingPermission(true);
    try {
      const ok = await checkAndRequestStoragePermission();
      setPermissionStatus(ok ? 'granted' : 'denied');
    } catch {
      setPermissionStatus('denied');
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const fileName = `toolbox_talk_${report.id}_report.pdf`;

  const handleDownload = async (blob: Blob | null) => {
    if (!blob) return;
    if (isNativeMobile) await handleNativeDownload(blob, fileName);
  };

  return (
    <div className="flex flex-col gap-2">
      {isNativeMobile && permissionStatus !== 'granted' && (
        <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center gap-2">
            {permissionStatus === 'denied'
              ? <AlertCircle size={16} className="text-yellow-600" />
              : <Shield size={16} className="text-yellow-600" />}
            <span className="text-sm text-yellow-800">
              {permissionStatus === 'checking'
                ? 'Checking storage permission...'
                : 'Storage permission required to save files'}
            </span>
          </div>
          {permissionStatus === 'denied' && (
            <button
              onClick={handleRequestPermission}
              disabled={isRequestingPermission}
              className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 flex items-center gap-1"
            >
              {isRequestingPermission ? <Loader size={12} className="animate-spin" /> : <Shield size={12} />}
              {isRequestingPermission ? 'Requesting...' : 'Enable'}
            </button>
          )}
        </div>
      )}

      <PDFDownloadLink
        document={<ToolboxTalkReportPdf report={report} />}
        fileName={fileName}
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
      >
        {({ loading, blob }) => (
          <button
            onClick={() => handleDownload(blob!)}
            disabled={loading || !blob || (isNativeMobile && permissionStatus !== 'granted')}
            className="flex items-center gap-2 w-full h-full"
          >
            {loading ? <Loader size={16} className="animate-spin" /> : <Download size={16} />}
            {loading ? 'Preparing PDF...' : 'Download PDF'}
          </button>
        )}
      </PDFDownloadLink>
    </div>
  );
};

export default ToolboxTalkReportDownloadButton;
