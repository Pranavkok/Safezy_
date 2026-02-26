'use client';

import { Download, Loader, Shield, AlertCircle } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import IncidentReportPdf from './IncidentReportPdf';
import { IncidentAnalysisWithImageType } from '@/types/index.types';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';
import { useState, useEffect } from 'react';

function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function requestAndroidStoragePermission(): Promise<boolean> {
  try {
    // For Android, we'll use a different approach
    // Since Capacitor's Filesystem plugin doesn't automatically request storage permissions,
    // we'll try to use Directory.Data which doesn't require storage permissions
    // and also provide a manual permission request flow

    if (Capacitor.getPlatform() === 'android') {
      // Try to write to Directory.Data first (no permissions required)
      try {
        const testFileName = 'permission-test.txt';
        await Filesystem.writeFile({
          path: testFileName,
          data: 'test',
          directory: Directory.Data
        });

        // Clean up test file
        await Filesystem.deleteFile({
          path: testFileName,
          directory: Directory.Data
        });

        return true;
      } catch (error) {
        return false;
      }
    }

    return false;
  } catch (error) {
    return false;
  }
}

async function checkAndRequestStoragePermission(): Promise<boolean> {
  try {
    // Check current permission status
    const permissionStatus = await Filesystem.checkPermissions();

    // For Android, we need to check if we have access to the Documents directory
    // The permission status might vary based on Android version
    if (permissionStatus.publicStorage === 'granted') {
      return true;
    }

    // If permission is not granted, request it using Android's native permission system

    // Try the Filesystem plugin's requestPermissions first
    const requestResult = await Filesystem.requestPermissions();

    if (requestResult.publicStorage === 'granted') {
      return true;
    }

    // If Filesystem plugin doesn't work, try Android native permission request
    const androidPermission = await requestAndroidStoragePermission();

    if (androidPermission) {
      return true;
    }

    return false;
  } catch (error) {
    // Fallback: try to write a test file to check if we have access
    try {
      const testFileName = 'permission-test.txt';
      const directory =
        Capacitor.getPlatform() === 'android'
          ? Directory.Data
          : Directory.Documents;

      await Filesystem.writeFile({
        path: testFileName,
        data: 'test',
        directory: directory
      });

      // Clean up test file
      await Filesystem.deleteFile({
        path: testFileName,
        directory: directory
      });

      return true;
    } catch (fallbackError) {
      return false;
    }
  }
}

async function handleNativeDownload(blob: Blob, fileName: string) {
  if (!blob) return;

  try {
    // Check and request storage permission
    const hasPermission = await checkAndRequestStoragePermission();

    if (!hasPermission) {
      alert(
        'Storage permission is required to save files. Please enable storage permission in your device settings and try again.'
      );
      return;
    }

    // Convert blob to base64 string
    const base64Data = await blobToBase64(blob); // data:application/pdf;base64,...

    // Extract only base64 content after the comma
    const base64 = base64Data.split(',')[1];

    // Write base64 file to filesystem on Android device
    // Use Directory.Data for Android to avoid storage permission issues
    const directory =
      Capacitor.getPlatform() === 'android'
        ? Directory.Data
        : Directory.Documents;

    const saved = await Filesystem.writeFile({
      path: fileName,
      data: base64,
      directory: directory,
      recursive: true
    });

    // Open the saved PDF using the native file opener
    await FileOpener.open({
      filePath: saved.uri,
      contentType: 'application/pdf'
    });
  } catch (error) {
    // More specific error handling
    if (error instanceof Error) {
      if (
        error.message.includes('permission') ||
        error.message.includes('Permission')
      ) {
        alert(
          'Storage permission denied. Please enable storage permission in your device settings and try again.'
        );
      } else if (
        error.message.includes('No such file') ||
        error.message.includes('ENOENT')
      ) {
        alert(
          'Unable to access device storage. Please check your device storage and try again.'
        );
      } else {
        alert(`Failed to save or open file: ${error.message}`);
      }
    } else {
      alert('Failed to save or open file on device.');
    }
  }
}

const IncidentReportDownloadButton = ({
  incidentDetails
}: {
  incidentDetails: IncidentAnalysisWithImageType;
}) => {
  const isNativeMobile =
    typeof Capacitor !== 'undefined' &&
    Capacitor.isNativePlatform &&
    Capacitor.isNativePlatform();
  const [permissionStatus, setPermissionStatus] = useState<
    'checking' | 'granted' | 'denied' | 'unknown'
  >('checking');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  // Check permission status on component mount
  useEffect(() => {
    if (isNativeMobile) {
      checkPermissionStatus();
    } else {
      setPermissionStatus('granted'); // Web doesn't need storage permissions
    }
  }, [isNativeMobile]);

  const checkPermissionStatus = async () => {
    try {
      // For Android, we'll use Directory.Data which doesn't require storage permissions
      // For other platforms, check the normal permission status
      if (Capacitor.getPlatform() === 'android') {
        // Test if we can write to Directory.Data
        try {
          const testFileName = 'permission-test.txt';
          await Filesystem.writeFile({
            path: testFileName,
            data: 'test',
            directory: Directory.Data
          });

          // Clean up test file
          await Filesystem.deleteFile({
            path: testFileName,
            directory: Directory.Data
          });

          setPermissionStatus('granted');
        } catch (error) {
          setPermissionStatus('denied');
        }
      } else {
        const permissionStatus = await Filesystem.checkPermissions();
        if (permissionStatus.publicStorage === 'granted') {
          setPermissionStatus('granted');
        } else {
          setPermissionStatus('denied');
        }
      }
    } catch (error) {
      setPermissionStatus('unknown');
    }
  };

  const handleRequestPermission = async () => {
    setIsRequestingPermission(true);
    try {
      const hasPermission = await checkAndRequestStoragePermission();
      setPermissionStatus(hasPermission ? 'granted' : 'denied');
    } catch (error) {
      setPermissionStatus('denied');
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const handleDownload = async (blob: Blob | null) => {
    if (!blob) return;

    const fileName = `incident-report.pdf`;

    if (isNativeMobile) {
      await handleNativeDownload(blob, fileName);
    } else {
      // createDownloadLinkFromBlob(blob, fileName);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      {/* Permission Status and Request Button */}
      {isNativeMobile && permissionStatus !== 'granted' && (
        <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center gap-2">
            {permissionStatus === 'denied' ? (
              <AlertCircle size={16} className="text-yellow-600" />
            ) : (
              <Shield size={16} className="text-yellow-600" />
            )}
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
              className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {isRequestingPermission ? (
                <Loader size={12} className="animate-spin" />
              ) : (
                <Shield size={12} />
              )}
              {isRequestingPermission ? 'Requesting...' : 'Enable'}
            </button>
          )}
        </div>
      )}

      {/* Download Button */}
      <div className="flex space-x-2">
        <PDFDownloadLink
          document={<IncidentReportPdf incidentDetails={incidentDetails} />}
          fileName={`incident-report-${incidentDetails.title.replace(/\s+/g, '-').toLowerCase()}.pdf`}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
        >
          {({ loading, blob }) => (
            <button
              onClick={() => handleDownload(blob!)}
              disabled={
                loading ||
                !blob ||
                (isNativeMobile && permissionStatus !== 'granted')
              }
              className="flex items-center gap-2 w-full h-full"
            >
              {loading ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              {loading ? 'Preparing PDF...' : 'Download PDF'}
            </button>
          )}
        </PDFDownloadLink>
      </div>
    </div>
  );
};

export default IncidentReportDownloadButton;
