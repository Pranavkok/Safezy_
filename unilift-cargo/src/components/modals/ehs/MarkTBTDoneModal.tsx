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
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [rating, setRating] = useState(0);
  const [staffEmails, setStaffEmails] = useState<string[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [emailPopoverOpen, setEmailPopoverOpen] = useState(false);
  const [emailError, setEmailError] = useState('');

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

  const toggleEmail = (email: string) => {
    setSelectedEmails(prev =>
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
    setEmailError('');
  };

  const removeEmail = (email: string) => {
    setSelectedEmails(prev => prev.filter(e => e !== email));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const handleReset = () => {
    reset();
    setSelectedFiles([]);
    setSelectedEmails([]);
    setEmailError('');
    setRating(0);
  };

  const onSubmit = async (data: addToolboxUserType) => {
    if (selectedEmails.length === 0) {
      setEmailError("Please select at least one superior's email");
      return;
    }

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

      const superiorEmail = selectedEmails.join(',');

      const res = await addToolboxUserDetails(
        { ...data, superior_email: superiorEmail },
        imageUrls,
        toolboxTalkId,
        rating,
        durationSeconds
      );

      const firstName = user.firstName as string;
      const lastName = user.lastName as string;

      const formData = new FormData();
      formData.append('superior_email', superiorEmail);
      formData.append('topicName', toolboxTopic);
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('comments', data.comments || '');
      selectedFiles.forEach(file => formData.append('file', file));

      if (res?.success) {
        const result = await fetch('/api/send-email', {
          method: 'POST',
          body: formData
        });

        if (result.ok) {
          toast.success(res?.message);
          localStorage.removeItem(storageKey);
          handleReset();
        } else {
          toast.error('Failed to send email');
        }
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
        <button className="bg-primary rounded-md px-4 sm:px-6 py-2  text-white font-extrabold text-xs sm:text-sm md:text-base">
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
          {/* Multi-select email dropdown */}
          <div className="space-y-2 pb-5">
            <label className="capitalize">
              Add Superior&apos;s Email
              <span className="ml-[2px] text-red-500">*</span>
            </label>
            <Popover open={emailPopoverOpen} onOpenChange={setEmailPopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring min-h-[36px]"
                >
                  <span className="text-muted-foreground">
                    {selectedEmails.length === 0
                      ? 'Select email(s)...'
                      : `${selectedEmails.length} selected`}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-2" align="start">
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {staffEmails.length === 0 ? (
                    <p className="text-sm text-muted-foreground px-2 py-1">No staff emails found.</p>
                  ) : (
                    staffEmails.map(email => (
                      <div
                        key={email}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-accent cursor-pointer"
                        onClick={() => toggleEmail(email)}
                      >
                        <Checkbox
                          checked={selectedEmails.includes(email)}
                          onCheckedChange={() => toggleEmail(email)}
                        />
                        <span className="text-sm">{email}</span>
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Selected email badges */}
            {selectedEmails.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedEmails.map(email => (
                  <span
                    key={email}
                    className="flex items-center gap-1 bg-primary/10 text-primary text-xs rounded-full px-2 py-0.5"
                  >
                    {email}
                    <button type="button" onClick={() => removeEmail(email)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {emailError && <div className="text-sm text-red-500">{emailError}</div>}
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
            accept="image/*"
            required={false}
            onChange={handleFileChange}
          />

          {selectedFiles.length > 0 && (
            <ul className="mt-2 text-sm text-gray-700">
              {selectedFiles.map((file, index) => (
                <li key={index}>{file.name}</li>
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
