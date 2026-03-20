'use client';

import { getComplaintByOrderId } from '@/actions/contractor/complaint';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Spinner from '../loaders/Spinner';
import { useState } from 'react';

const ComplaintStatusModal = ({ order_id }: { order_id: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    data: response,
    error,
    isFetching
  } = useQuery({
    queryKey: ['complaintsById', isOpen],
    queryFn: () => getComplaintByOrderId(order_id),
    enabled: isOpen
  });

  const isDataValid = response?.success && response.data;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <p className="border-2 border-white py-1 px-4 rounded bg-white cursor-pointer">
          Complaint
        </p>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-md w-full bg-white"
        onInteractOutside={e => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Complaint Details</DialogTitle>
          <DialogDescription>
            Details of the complaint submitted by the user.
          </DialogDescription>
        </DialogHeader>

        {isFetching && (
          <div className="flex items-center justify-center">
            <Spinner />
          </div>
        )}

        {!isFetching && (!isDataValid || error) && (
          <div className="flex items-center justify-center">No data found</div>
        )}

        {!isFetching && isDataValid && (
          <div className="space-y-4">
            <div className="w-full flex justify-center">
              <Image
                height={400}
                width={400}
                src={response?.data?.image as string}
                alt="Complaint Image"
                className="rounded-md max-h-48 w-auto object-cover"
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="font-semibold">Description:</div>
              <div>{response?.data?.description}</div>
            </div>
          </div>
        )}

        <DialogFooter className="justify-center sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="default">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ComplaintStatusModal;
