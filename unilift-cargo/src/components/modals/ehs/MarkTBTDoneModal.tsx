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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import React, { useEffect, useState } from 'react';
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
import { ChevronDown, X } from 'lucide-react';
import { AppRoutes } from '@/constants/AppRoutes';

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selected = Array.from(event.target.files);
      // Guard against oversized files — Gmail rejects attachments over 25MB,
      // so keep each well under that to avoid a silent email-send failure.
      const withinLimit = selected.filter(
        file => file.size <= MAX_FILE_SIZE_MB * 1024 * 1024
      );
      const rejected = selected.length - withinLimit.length;
      if (rejected > 0) {
        toast.error(
          `${rejected} file(s) skipped — each file must be under ${MAX_FILE_SIZE_MB}MB.`
        );
      }
      setSelectedFiles(prev => [...prev, ...withinLimit]);
      // Reset so selecting the same file again still fires onChange
      event.target.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
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
        fetch('/api/send-email', { method: 'POST', body: formData }).catch(err =>
          console.error('[tbt] email send failed:', err)
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
        <button type="button" className="bg-primary rounded-md px-4 sm:px-6 py-2  text-white font-extrabold text-xs sm:text-sm md:text-base">
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
                    <p className="text-sm text-muted-foreground px-2 py-1">No staff emails found.</p>
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
                    <button type="button" onClick={() => removeAdditionalEmail(email)}>
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
              <div className="text-sm text-red-500">{errors.comments.message}</div>
            )}
          </div>

          <InputFieldWithLabel
            label="Upload Attendance Sheet"
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            required={false}
            onChange={handleFileChange}
          />
          <p className="text-xs text-gray-500">
            Images, PDF, Word or Excel files (max {MAX_FILE_SIZE_MB}MB each).
          </p>

          {selectedFiles.length > 0 && (
            <ul className="mt-2 text-sm text-gray-700 space-y-1">
              {selectedFiles.map((file, index) => (
                <li key={index} className="flex items-center justify-between gap-2">
                  <span className="truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    aria-label={`Remove ${file.name}`}
                    className="text-gray-400 hover:text-red-500 shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
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
