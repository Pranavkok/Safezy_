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
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import { ERROR_MESSAGES } from '@/constants/constants';
import {
  addToolboxNote,
  updateToolboxNote
} from '@/actions/contractor/toolbox-talk';
import { ToolboxNoteType } from '@/types/ehs.types';
import { AddToolboxNoteSchema } from '@/validations/contractor/add-toolbox-note';
import { useUser } from '@/context/UserContext';
import TextAreaWithLabel from '@/components/inputs-fields/TextareaWithLabel';

const ToolboxNoteModal = ({
  toolboxId,
  noteData
}: {
  toolboxId: number;
  noteData: ToolboxNoteType;
}) => {
  const [loading, setLoading] = useState(false);
  const user = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ToolboxNoteType>({
    resolver: zodResolver(AddToolboxNoteSchema),
    defaultValues: { note: (noteData as string) || '' }
  });

  const onSubmit = async (data: ToolboxNoteType) => {
    setLoading(true);
    try {
      let res;

      if (noteData || noteData === '') {
        res = await updateToolboxNote(
          data.note as string,
          toolboxId,
          user.userId as string
        );
      } else {
        res = await addToolboxNote(
          data.note as string,
          toolboxId,
          user.userId as string
        );
      }

      if (res.success) {
        toast.success(res.message);
        reset();
      }
    } catch (error) {
      toast.error(ERROR_MESSAGES.TOOLBOX_NOTE_NOT_UPDATED);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="bg-primary rounded-md px-4 sm:px-6 py-2  text-white font-extrabold text-xs sm:text-sm md:text-base">
          ADD A NOTE
        </button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Toolbox Talk Note</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <TextAreaWithLabel
            label="Enter Note"
            {...register('note')}
            placeholder="Enter your note here..."
          />
          {errors.note && <p className="text-red-500">{errors.note.message}</p>}

          <DialogFooter className="justify-center sm:justify-end">
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
              className="h-9 lg:min-w-32"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ToolboxNoteModal;
