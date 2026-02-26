'use client';

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
import { useState } from 'react';
import { UpdateWorksiteSchema } from '@/validations/contractor/add-worksite';
import { AddWorksiteType, UpdateWorksiteType } from '@/types/worksite.types';
import { updateWorkSite } from '@/actions/contractor/worksite';
import { useQueryClient } from '@tanstack/react-query';
import EditIcon from '@/components/svgs/EditIcon';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import WorksiteInformation from '@/components/modals/contractor/worksite/manage-worksite/WorksiteInformation';
import { WorksiteWithAddressType } from '@/types/index.types';

const UpdateWorksiteModal = ({
  worksiteDetails
}: {
  worksiteDetails: WorksiteWithAddressType;
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
    resolver: zodResolver(UpdateWorksiteSchema),
    defaultValues: {
      site_manager: worksiteDetails.site_manager as string,
      site_name: worksiteDetails.site_name,
      contact_number: worksiteDetails.contact_number as string,
      email: worksiteDetails.email as string,
      address1: worksiteDetails.address[0].street1,
      address2: worksiteDetails.address[0].street2 as string,
      locality: worksiteDetails.address[0].locality as string,
      city: worksiteDetails.address[0].city,
      state: worksiteDetails.address[0].state,
      country: worksiteDetails.address[0].country,
      zipcode: worksiteDetails.address[0].zipcode
    }
  });

  const onSubmit = async (data: UpdateWorksiteType) => {
    setLoading(true);
    try {
      const res = await updateWorkSite(data, worksiteDetails.id);

      if (res.success) {
        toast.success(SUCCESS_MESSAGES.WORKSITE_UPDATED);
        await client.invalidateQueries({
          queryKey: ['worksiteOptions']
        });
        await client.invalidateQueries({
          queryKey: ['worksiteOptionsWithAddress']
        });
        reset();
        setIsOpen(false);
      }
    } catch (error) {
      toast.error(ERROR_MESSAGES.WORKSITE_NOT_UPDATED);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="hover:bg-transparent">
          <EditIcon className="fill-gray-400 hover:fill-primary w-4 h-4 transition-colors duration-300" />
        </div>
      </DialogTrigger>

      <DialogContent
        className="w-[95vw] max-w-3xl bg-white "
        onInteractOutside={e => e.preventDefault()}
        onCloseClick={() => reset()}
      >
        <DialogHeader>
          <DialogTitle>Update Work Site</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <WorksiteInformation
            isUpdate={false}
            register={register}
            errors={errors}
          />

          <DialogFooter className="flex flex-col-reverse gap-2 justify-center sm:justify-end pt-2 ">
            <DialogClose asChild>
              <Button
                className="h-9 sm:w-32 bg-white"
                variant="outline"
                onClick={() => reset()}
                disabled={loading}
              >
                Cancel
              </Button>
            </DialogClose>

            <Button
              type="submit"
              className="text-sm capitalize h-9 sm:min-w-32"
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateWorksiteModal;
