'use client';

import { useCallback, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Upload,
  FileArchive,
  X,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { generateBulkUploadTemplate } from '@/actions/admin/generateBulkUploadTemplate';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/constants/constants';

// ─── Types ────────────────────────────────────────────────────────────────────

type RowResult = {
  row: number;
  productName: string;
  status: 'success' | 'skipped';
  reason?: string;
  warnings: string[];
};

type UploadResult = {
  success: boolean;
  totalRows: number;
  successCount: number;
  skippedCount: number;
  results: RowResult[];
};

type UploadState =
  | { phase: 'idle' }
  | { phase: 'selected'; file: File }
  | { phase: 'uploading' }
  | { phase: 'done'; result: UploadResult }
  | { phase: 'error'; message: string };

const MAX_ZIP_SIZE_MB = 100;

// ─── Sub-components ───────────────────────────────────────────────────────────

function DropZone({
  onFileSelect,
  file,
  onClear
}: {
  onFileSelect: (file: File) => void;
  file: File | null;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (f: File) => {
      if (!f.name.toLowerCase().endsWith('.zip')) {
        toast.error('Please upload a .zip file');
        return;
      }
      if (f.size > MAX_ZIP_SIZE_MB * 1024 * 1024) {
        toast.error(`ZIP file exceeds ${MAX_ZIP_SIZE_MB}MB limit`);
        return;
      }
      onFileSelect(f);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  if (file) {
    return (
      <div className="flex items-center justify-between border rounded-lg p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center gap-3">
          <FileArchive className="w-8 h-8 text-blue-500 shrink-0" />
          <div className="min-w-0">
            <p className="font-medium text-sm text-gray-900 truncate">
              {file.name}
            </p>
            <p className="text-xs text-gray-500">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="p-1 hover:bg-blue-100 rounded-full transition-colors shrink-0"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".zip"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = '';
        }}
      />
      <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
      <p className="text-sm font-medium text-gray-700">
        Drag & drop your ZIP file here
      </p>
      <p className="text-xs text-gray-500 mt-1">or click to browse</p>
      <p className="text-xs text-gray-400 mt-2">
        Max {MAX_ZIP_SIZE_MB}MB · Must contain products.xlsx + images/ folder
      </p>
    </div>
  );
}

function ResultsTable({ result }: { result: UploadResult }) {
  const [showSkipped, setShowSkipped] = useState(false);

  const displayRows = showSkipped
    ? result.results
    : result.results.filter(r => r.status === 'skipped' || r.warnings.length > 0)
        .concat(result.results.filter(r => r.status === 'success' && r.warnings.length === 0));

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-gray-50 border p-3 text-center">
          <p className="text-2xl font-bold text-gray-800">{result.totalRows}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total rows</p>
        </div>
        <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-center">
          <p className="text-2xl font-bold text-green-700">
            {result.successCount}
          </p>
          <p className="text-xs text-green-600 mt-0.5">Uploaded</p>
        </div>
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-center">
          <p className="text-2xl font-bold text-red-700">
            {result.skippedCount}
          </p>
          <p className="text-xs text-red-600 mt-0.5">Skipped</p>
        </div>
      </div>

      {/* Filter toggle */}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => setShowSkipped(prev => !prev)}
          className="text-xs text-blue-600 hover:underline"
        >
          {showSkipped
            ? 'Show only issues'
            : `Show all ${result.totalRows} rows`}
        </button>
      </div>

      {/* Rows table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-y-auto max-h-72">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600 w-12">
                  Row
                </th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600">
                  Product
                </th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600 w-24">
                  Status
                </th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-gray-600">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayRows.map(r => (
                <tr
                  key={r.row}
                  className={
                    r.status === 'success'
                      ? 'bg-white'
                      : 'bg-red-50'
                  }
                >
                  <td className="px-3 py-2 text-gray-500 text-xs">{r.row}</td>
                  <td className="px-3 py-2 text-gray-800 font-medium max-w-[180px] truncate">
                    {r.productName}
                  </td>
                  <td className="px-3 py-2">
                    {r.status === 'success' ? (
                      <span className="inline-flex items-center gap-1 text-green-700">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">Success</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-600">
                        <XCircle className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">Skipped</span>
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {r.reason && (
                      <p className="text-xs text-red-600">{r.reason}</p>
                    )}
                    {r.warnings.map((w, i) => (
                      <p
                        key={i}
                        className="text-xs text-amber-600 flex items-start gap-1"
                      >
                        <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                        {w}
                      </p>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BulkUploadSection({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [uploadState, setUploadState] = useState<UploadState>({ phase: 'idle' });
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const router = useRouter();

  const selectedFile =
    uploadState.phase === 'selected' ? uploadState.file : null;

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      if (uploadState.phase === 'uploading') return; // block close during upload
      setUploadState({ phase: 'idle' });
      onClose();
    }
  };

  const handleDownloadTemplate = async () => {
    setIsDownloadingTemplate(true);
    try {
      const { fileName, contentType, base64Data } =
        await generateBulkUploadTemplate();

      const byteCharacters = atob(base64Data);
      const byteArray = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
      }
      const blob = new Blob([byteArray], { type: contentType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(SUCCESS_MESSAGES.BULK_UPLOAD_TEMPLATE_DOWNLOADED);
    } catch {
      toast.error('Failed to download template. Please try again.');
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleUpload = async () => {
    if (uploadState.phase !== 'selected') return;

    const file = uploadState.file;
    setUploadState({ phase: 'uploading' });

    const formData = new FormData();
    formData.append('zipFile', file);

    try {
      const response = await fetch('/api/admin/bulk-upload', {
        method: 'POST',
        body: formData
      });

      let json: Record<string, unknown>;
      try {
        json = await response.json();
      } catch {
        const text = await response.text().catch(() => '');
        setUploadState({
          phase: 'error',
          message: `Server error ${response.status}${text ? ': ' + text.slice(0, 200) : ''}`
        });
        return;
      }

      if (!response.ok) {
        setUploadState({
          phase: 'error',
          message: (json.error as string) ?? ERROR_MESSAGES.BULK_UPLOAD_FAILED
        });
        return;
      }

      setUploadState({ phase: 'done', result: json as unknown as UploadResult });

      if ((json as unknown as UploadResult).successCount > 0) {
        router.refresh();
        toast.success(
          `${(json as unknown as UploadResult).successCount} product(s) uploaded successfully`
        );
      }
    } catch (err) {
      setUploadState({
        phase: 'error',
        message: err instanceof Error ? err.message : ERROR_MESSAGES.BULK_UPLOAD_FAILED
      });
    }
  };

  const handleReset = () => {
    setUploadState({ phase: 'idle' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="bg-white sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Products</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-1">
          {/* How it works */}
          {(uploadState.phase === 'idle' ||
            uploadState.phase === 'selected') && (
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 text-sm text-blue-800 space-y-1">
              <p className="font-semibold">How it works</p>
              <ol className="list-decimal list-inside space-y-0.5 text-xs text-blue-700">
                <li>Download the Excel template below</li>
                <li>Fill in product data (one row per product)</li>
                <li>
                  Create a ZIP containing: <code>products.xlsx</code> +{' '}
                  <code>images/</code> folder with all product images
                </li>
                <li>Upload the ZIP here</li>
              </ol>
            </div>
          )}

          {/* Download template */}
          {(uploadState.phase === 'idle' ||
            uploadState.phase === 'selected') && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadTemplate}
              disabled={isDownloadingTemplate}
              className="w-full"
            >
              {isDownloadingTemplate ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Download Excel Template
            </Button>
          )}

          {/* Upload area */}
          {(uploadState.phase === 'idle' ||
            uploadState.phase === 'selected') && (
            <DropZone
              onFileSelect={file =>
                setUploadState({ phase: 'selected', file })
              }
              file={selectedFile}
              onClear={handleReset}
            />
          )}

          {/* Uploading state */}
          {uploadState.phase === 'uploading' && (
            <div className="flex flex-col items-center justify-center gap-3 py-10">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-600 font-medium">
                Processing products...
              </p>
              <p className="text-xs text-gray-400">
                Validating, uploading images and inserting products. This may
                take a while for large batches.
              </p>
            </div>
          )}

          {/* Error state */}
          {uploadState.phase === 'error' && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{uploadState.message}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Done state */}
          {uploadState.phase === 'done' && (
            <ResultsTable result={uploadState.result} />
          )}

          {/* Action buttons */}
          {(uploadState.phase === 'selected' ||
            uploadState.phase === 'done') && (
            <div className="flex gap-3 justify-end pt-1">
              {uploadState.phase === 'done' && (
                <Button type="button" variant="outline" onClick={handleReset}>
                  Upload Another
                </Button>
              )}
              {uploadState.phase === 'selected' && (
                <Button type="button" onClick={handleUpload}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload ZIP
                </Button>
              )}
              {uploadState.phase === 'done' && (
                <Button type="button" onClick={onClose}>
                  Close
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
