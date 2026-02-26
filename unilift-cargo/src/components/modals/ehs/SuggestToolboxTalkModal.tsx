'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import { ERROR_MESSAGES } from '@/constants/constants';
import { addSuggestionType } from '@/types/ehs.types';
import { addToolboxTalkSuggestion } from '@/actions/admin/ehs/toolbox-talk';
import { AddSuggestionSchema } from '@/validations/admin/add-ehs-suggestions';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';

const SuggestToolboxTalkModal = ({
  isOpen,
  setIsOpen
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<addSuggestionType>({
    resolver: zodResolver(AddSuggestionSchema)
  });

  const onSubmit = async (data: addSuggestionType) => {
    setLoading(true);
    try {
      const res = await addToolboxTalkSuggestion(data);

      if (res.success) {
        toast.success(res.message);
        setIsOpen(false);
        reset();
      } else {
        toast.error(ERROR_MESSAGES.TOOLBOX_SUGGESTION_NOT_ADDED);
      }
    } catch (error) {
      toast.error(ERROR_MESSAGES.TOOLBOX_SUGGESTION_NOT_ADDED);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="bg-white"
        onInteractOutside={e => e.preventDefault()}
        onCloseClick={() => reset()}
      >
        <DialogHeader>
          <DialogTitle>Suggest Toolbox Talk</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <InputFieldWithLabel
            label="Add Topic Name"
            type="text"
            required
            errorText={errors.topic_name?.message as string}
            {...register('topic_name')}
          />

          <DialogFooter className="justify-center sm:justify-end ">
            <DialogClose asChild>
              <Button
                className="h-9 lg:w-32 bg-white"
                variant="outline"
                onClick={() => reset()}
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

export default SuggestToolboxTalkModal;
