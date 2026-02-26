import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DialogTrigger } from '@radix-ui/react-dialog';

const OrderDeliveryStateCheckModal = ({
  open,
  setIsOpen
}: {
  open: boolean;
  setIsOpen: (open: boolean) => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Proceed to Payment</Button>
      </DialogTrigger>
      <DialogContent className="w-[60%] max-w-md p-2 sm:p-4 bg-white">
        <DialogHeader className="px-2 sm:px-4">
          <DialogTitle className="text-base sm:text-lg">
            We are coming to your region soon!
          </DialogTitle>
          <p className="text-sm text-gray-600 text-justify">
            Our services are not yet available in your region, but we are
            actively expanding and hope to reach you soon. Please stay in touch
            or feel free to contact us for more information.
          </p>
          <DialogClose />
        </DialogHeader>
        <div className="px-2 sm:px-4 pt-2 flex justify-end">
          <Button
            className="text-xs sm:text-sm"
            size="sm"
            onClick={() => {
              setIsOpen(false);
            }}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDeliveryStateCheckModal;
