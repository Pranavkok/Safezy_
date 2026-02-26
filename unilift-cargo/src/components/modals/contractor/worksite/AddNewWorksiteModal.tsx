'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { AddWorksiteSchema } from '@/validations/contractor/add-worksite';
import { AddWorksiteType } from '@/types/worksite.types';
import { addWorkSite } from '@/actions/contractor/worksite';
import { useQueryClient } from '@tanstack/react-query';
import WorksiteInformation from '@/components/modals/contractor/worksite/manage-worksite/WorksiteInformation';

const AddNewWorksiteModal = ({
  isForCartPage = false
}: {
  isForCartPage: boolean;
}) => {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const client = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<AddWorksiteType>({
    resolver: zodResolver(AddWorksiteSchema)
  });

  const onSubmit = async (data: AddWorksiteType) => {
    setLoading(true);
    try {
      const res = await addWorkSite(data);

      if (res.success) {
        toast.success('worksite added successfully.');
        await client.invalidateQueries({
          queryKey: ['worksiteOptionsWithAddress']
        });
        await client.invalidateQueries({ queryKey: ['worksiteOptions'] });
        reset();
        setIsOpen(false);
      }
    } catch (error) {
      toast.error('Failed to add worksite.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)}>
          <Plus className=" w-5 h-5 sm:mr-2" />
          <span className="hidden sm:block">
            {isForCartPage ? 'Add Shipping Location' : 'Add new worksite'}
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent
        className="w-[95vw] max-w-3xl bg-white "
        onInteractOutside={e => e.preventDefault()}
        onCloseClick={() => reset()}
      >
        <DialogHeader>
          <DialogTitle>ADD WORK SITES</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <WorksiteInformation
            isUpdate={false}
            register={register}
            errors={errors}
          />

          <div className="flex  gap-2 justify-center sm:justify-end pt-2 ">
            <Button
              className="text-sm capitalize w-32 "
              variant="outline"
              onClick={() => reset()}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="text-sm capitalize h-9 w-32"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <span className="loader mr-2" /> Saving...
                </span>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddNewWorksiteModal;
