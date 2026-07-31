'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addToolboxUserDetails } from '@/actions/admin/ehs/toolbox-talk';
import { addToolboxUserType } from '@/types/ehs.types';
import { AddToolboxTalkUserSchema } from '@/validations/admin/add-toolbox-talk';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { uploadMultipleFiles } from '@/utils';
import { useUser } from '@/context/UserContext';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import CustomRating from '@/components/CustomRating';
import { getStaffList } from '@/actions/admin/staff';
import {
  Camera,
  ChevronDown,
  Download,
  ExternalLink,
  Eye,
  FileText,
  X
} from 'lucide-react';
import { AppRoutes } from '@/constants/AppRoutes';
import Image from 'next/image';

function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function getFileExtension(file: File): string {
  return file.name.split('.').pop()?.toLowerCase() ?? '';
}

function isImageFile(file: File): boolean {
  return (
    file.type.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'].includes(
      getFileExtension(file)
    )
  );
}

function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || getFileExtension(file) === 'pdf';
}

function openLocalFile(file: File) {
  const objectUrl = URL.createObjectURL(file);
  window.open(objectUrl, '_blank', 'noopener,noreferrer');
  // Keep the URL alive long enough for a browser or device app to load it.
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}

function downloadLocalFile(file: File) {
  const objectUrl = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}

const PhotoCaptureModal = ({
  onCaptured,
  onClose
}: {
  onCaptured: (file: File) => void;
  onClose: () => void;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error('Camera capture is not supported in this browser.');
      onClose();
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
        setIsReady(true);
      })
      .catch(() => {
        toast.error('Camera access denied. Please allow camera permission.');
        onClose();
      });

    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, [onClose]);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (
      !video ||
      !canvas ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      toast.error('Camera is not ready yet. Please try again.');
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    canvas.toBlob(
      blob => {
        if (!blob) {
          toast.error('Could not capture the photo. Please try again.');
          return;
        }
        onCaptured(
          new File([blob], `attendance_photo_${Date.now()}.jpg`, {
            type: 'image/jpeg'
          })
        );
        onClose();
      },
      'image/jpeg',
      0.92
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md space-y-4 rounded-xl bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Take Attendance Photo</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close camera"
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <video
          ref={videoRef}
          muted
          playsInline
          className="aspect-video w-full rounded-lg bg-black object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        <div className="flex justify-center">
          <Button
            type="button"
            onClick={handleCapture}
            disabled={!isReady}
            className="gap-2 rounded-full px-5"
          >
            <Camera className="h-4 w-4" />
            Capture Photo
          </Button>
        </div>
      </div>
    </div>
  );
};

const SelectedAttachmentRow = ({
  file,
  onPreview,
  onRemove
}: {
  file: File;
  onPreview: () => void;
  onRemove: () => void;
}) => {
  const isImage = isImageFile(file);
  const isPdf = isPdfFile(file);
  const canPreview = isImage || isPdf;
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isImage) return;
    const objectUrl = URL.createObjectURL(file);
    setThumbnailUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file, isImage]);

  return (
    <li className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-2">
      <button
        type="button"
        onClick={canPreview ? onPreview : undefined}
        disabled={!canPreview}
        aria-label={canPreview ? `Preview ${file.name}` : undefined}
        className={`relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-white ${
          canPreview ? 'cursor-zoom-in hover:border-primary' : 'cursor-default'
        }`}
      >
        {isImage && thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt=""
            width={48}
            height={48}
            unoptimized
            className="h-full w-full object-cover"
          />
        ) : (
          <FileText className="h-5 w-5 text-gray-400" />
        )}
      </button>

      <button
        type="button"
        onClick={canPreview ? onPreview : undefined}
        disabled={!canPreview}
        className={`min-w-0 flex-1 text-left ${canPreview ? 'cursor-zoom-in' : 'cursor-default'}`}
      >
        <span className="block truncate text-sm text-gray-700">
          {file.name}
        </span>
        {canPreview && (
          <span className="mt-0.5 flex items-center gap-1 text-xs font-medium text-primary">
            <Eye className="h-3 w-3" /> Preview {isImage ? 'image' : 'PDF'}
          </span>
        )}
        {!canPreview && (
          <span className="mt-0.5 block text-xs text-gray-400">
            Open or download file
          </span>
        )}
      </button>

      {!canPreview && (
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => openLocalFile(file)}
            title={`Open ${file.name}`}
            aria-label={`Open ${file.name}`}
            className="rounded-full p-1.5 text-gray-500 hover:bg-primary/10 hover:text-primary"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => downloadLocalFile(file)}
            title={`Download ${file.name}`}
            aria-label={`Download ${file.name}`}
            className="rounded-full p-1.5 text-gray-500 hover:bg-primary/10 hover:text-primary"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
        className="shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
      >
        <X className="h-4 w-4" />
      </button>
    </li>
  );
};

const AttendanceAttachmentPreview = ({
  file,
  onClose
}: {
  file: File;
  onClose: () => void;
}) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const isImage = isImageFile(file);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setFileUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Preview ${file.name}`}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={event => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b px-4 py-3">
          <p className="truncate text-sm font-semibold text-gray-800">
            {file.name}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close attachment preview"
            className="shrink-0 rounded-full p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div
          className={`flex min-h-0 flex-1 items-center justify-center ${
            isImage ? 'bg-gray-950 p-3' : 'bg-gray-200'
          }`}
        >
          {fileUrl && isImage && (
            <Image
              src={fileUrl}
              alt={`Preview of ${file.name}`}
              width={1600}
              height={1200}
              unoptimized
              className="max-h-[80vh] w-auto max-w-full object-contain"
            />
          )}
          {fileUrl && !isImage && (
            <iframe
              src={fileUrl}
              title={`Preview of ${file.name}`}
              className="h-[80vh] w-full bg-white"
            />
          )}
        </div>
      </div>
    </div>
  );
};

const MarkTBTDoneModal = ({
  toolboxTalkId,
  toolboxTopic,
  sessionStartRef,
  storageKey
}: {
  toolboxTalkId: number;
  toolboxTopic: string;
  sessionStartRef: React.MutableRefObject<number>;
  storageKey: string;
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [rating, setRating] = useState(0);
  const FIXED_EMAIL = 'Admin@safezy.in';
  const [staffEmails, setStaffEmails] = useState<string[]>([]);
  const [additionalEmails, setAdditionalEmails] = useState<string[]>([]);
  const [emailPopoverOpen, setEmailPopoverOpen] = useState(false);
  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<addToolboxUserType>({
    resolver: zodResolver(AddToolboxTalkUserSchema)
  });

  const user = useUser();

  useEffect(() => {
    getStaffList().then(res => {
      if (res.success && res.data) {
        setStaffEmails(res.data.map(s => s.email));
      }
    });
  }, []);

  const toggleAdditionalEmail = (email: string) => {
    setAdditionalEmails(prev =>
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };

  const removeAdditionalEmail = (email: string) => {
    setAdditionalEmails(prev => prev.filter(e => e !== email));
  };

  // Keep in sync with the file input's `accept` attribute below.
  const MAX_FILE_SIZE_MB = 20;

  const addSelectedFiles = (files: File[]): number => {
    // Guard against oversized files — Gmail rejects attachments over 25MB,
    // so keep each well under that to avoid a silent email-send failure.
    const withinLimit = files.filter(
      file => file.size <= MAX_FILE_SIZE_MB * 1024 * 1024
    );
    const rejected = files.length - withinLimit.length;
    if (rejected > 0) {
      toast.error(
        `${rejected} file(s) skipped — each file must be under ${MAX_FILE_SIZE_MB}MB.`
      );
    }
    setSelectedFiles(prev => [...prev, ...withinLimit]);
    return withinLimit.length;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    addSelectedFiles(Array.from(event.target.files ?? []));
    // Reset so selecting the same file again still fires onChange
    event.target.value = '';
  };

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const addedCount = addSelectedFiles(Array.from(event.target.files ?? []));
    event.target.value = '';
    if (addedCount > 0) {
      toast.success('Photo added to the attendance attachments.');
    }
  };

  const handleCapturedPhoto = (file: File) => {
    if (addSelectedFiles([file]) > 0) {
      toast.success('Photo added to the attendance attachments.');
    }
  };

  const handleRemoveFile = (index: number) => {
    const fileToRemove = selectedFiles[index];
    if (previewFile === fileToRemove) setPreviewFile(null);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const handleReset = () => {
    reset();
    setSelectedFiles([]);
    setAdditionalEmails([]);
    setRating(0);
    setShowPhotoCapture(false);
    setPreviewFile(null);
  };

  const onSubmit = async (data: addToolboxUserType) => {
    setLoading(true);

    try {
      const durationSeconds = sessionStartRef.current
        ? Math.floor((Date.now() - sessionStartRef.current) / 1000)
        : undefined;

      const uploadedImages = await uploadMultipleFiles(
        selectedFiles,
        'product_images',
        'images'
      );

      const imageUrls = uploadedImages.map(img => ({
        publicUrl: img.publicUrl
      }));

      const superiorEmail = [FIXED_EMAIL, ...additionalEmails].join(',');

      const res = await addToolboxUserDetails(
        { ...data, superior_email: superiorEmail },
        imageUrls,
        toolboxTalkId,
        rating,
        durationSeconds
      );

      if (res?.success) {
        const firstName = user.firstName as string;
        const lastName = user.lastName as string;

        const formData = new FormData();
        formData.append('superior_email', superiorEmail);
        formData.append('topicName', toolboxTopic);
        formData.append('firstName', firstName);
        formData.append('lastName', lastName);
        formData.append('comments', data.comments || '');
        selectedFiles.forEach(file => formData.append('file', file));

        // Email is non-fatal — fire and forget so a slow SMTP connection
        // never blocks the user from reaching the success screen.
        fetch('/api/send-email', { method: 'POST', body: formData }).catch(
          err => console.error('[tbt] email send failed:', err)
        );

        toast.success(res.message);
        sessionStorage.removeItem(storageKey);
        handleReset();
        router.push(AppRoutes.EHS_TOOLBOX_TALK_REPORT(toolboxTalkId));
      } else {
        toast.error(res?.message || 'Failed to save details');
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error('Could not complete the process');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="bg-primary rounded-md px-4 sm:px-6 py-2  text-white font-extrabold text-xs sm:text-sm md:text-base"
        >
          MARK AS TBT DONE
        </button>
      </DialogTrigger>
      <DialogContent
        className="bg-white"
        onInteractOutside={e => e.preventDefault()}
        onCloseClick={() => handleReset()}
      >
        <DialogHeader>
          <DialogTitle className="font-bold text-xl">Confirmation</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          {/* Field 1 — Superior Email (fixed) */}
          <div className="space-y-2 pb-3">
            <label className="capitalize">
              Superior&apos;s Email
              <span className="ml-[2px] text-red-500">*</span>
            </label>
            <div className="flex w-full items-center rounded-md border border-input bg-muted/40 px-3 py-2 text-sm min-h-[36px] cursor-not-allowed select-none">
              <span className="flex items-center gap-1 bg-primary/10 text-primary text-xs rounded-full px-2 py-0.5">
                {FIXED_EMAIL}
              </span>
            </div>
          </div>

          {/* Field 2 — Additional Emails (multi-select) */}
          <div className="space-y-2 pb-5">
            <label className="capitalize">Additional Email</label>
            <Popover open={emailPopoverOpen} onOpenChange={setEmailPopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring min-h-[36px]"
                >
                  <span className="text-muted-foreground">
                    {additionalEmails.length === 0
                      ? 'Select email(s)...'
                      : `${additionalEmails.length} selected`}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-2" align="start">
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {staffEmails.filter(e => e !== FIXED_EMAIL).length === 0 ? (
                    <p className="text-sm text-muted-foreground px-2 py-1">
                      No staff emails found.
                    </p>
                  ) : (
                    staffEmails
                      .filter(e => e !== FIXED_EMAIL)
                      .map(email => (
                        <div
                          key={email}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-accent cursor-pointer"
                          onClick={() => toggleAdditionalEmail(email)}
                        >
                          <Checkbox
                            checked={additionalEmails.includes(email)}
                            onCheckedChange={() => toggleAdditionalEmail(email)}
                          />
                          <span className="text-sm">{email}</span>
                        </div>
                      ))
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {additionalEmails.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {additionalEmails.map(email => (
                  <span
                    key={email}
                    className="flex items-center gap-1 bg-primary/10 text-primary text-xs rounded-full px-2 py-0.5"
                  >
                    {email}
                    <button
                      type="button"
                      onClick={() => removeAdditionalEmail(email)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Comments/Remarks */}
          <div className="space-y-2 pb-5">
            <label className="capitalize" htmlFor="comments">
              Comments / Remarks
            </label>
            <Textarea
              id="comments"
              placeholder="Enter any comments or remarks..."
              {...register('comments')}
            />
            {errors.comments?.message && (
              <div className="text-sm text-red-500">
                {errors.comments.message}
              </div>
            )}
          </div>

          <InputFieldWithLabel
            label="Upload Attendance Sheet / Image"
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            required={false}
            onChange={handleFileChange}
          />
          <p className="text-xs text-gray-500">
            Images, PDF, Word or Excel files (max {MAX_FILE_SIZE_MB}MB each).
          </p>

          {/* Opens the rear camera on supported mobile devices. The captured
              image follows the same upload, storage and email flow as files. */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleCameraCapture}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              isMobileDevice()
                ? cameraInputRef.current?.click()
                : setShowPhotoCapture(true)
            }
            disabled={loading}
            className="w-full gap-2 border-primary text-primary hover:bg-primary/5 hover:text-primary"
          >
            <Camera className="h-4 w-4" />
            Take Photo
          </Button>

          {showPhotoCapture && (
            <PhotoCaptureModal
              onCaptured={handleCapturedPhoto}
              onClose={() => setShowPhotoCapture(false)}
            />
          )}

          {selectedFiles.length > 0 && (
            <ul className="mt-2 space-y-2">
              {selectedFiles.map((file, index) => (
                <SelectedAttachmentRow
                  key={`${file.name}-${file.lastModified}-${index}`}
                  file={file}
                  onPreview={() => setPreviewFile(file)}
                  onRemove={() => handleRemoveFile(index)}
                />
              ))}
            </ul>
          )}

          {previewFile && (
            <AttendanceAttachmentPreview
              file={previewFile}
              onClose={() => setPreviewFile(null)}
            />
          )}
          <div className="space-y-2">
            <label>Rate this toolbox talk</label>
            <CustomRating
              initialRating={rating}
              onRatingChange={handleRatingChange}
              size={40}
            />
          </div>

          <DialogFooter className="justify-center sm:justify-end">
            <DialogClose asChild>
              <Button
                className="h-9 lg:w-32 bg-white"
                variant="outline"
                onClick={handleReset}
                disabled={loading}
              >
                Cancel
              </Button>
            </DialogClose>

            <Button
              type="submit"
              className="text-sm capitalize h-9 lg:min-w-32"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <span className="loader mr-2" /> Submitting...
                </span>
              ) : (
                'Submit'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MarkTBTDoneModal;
