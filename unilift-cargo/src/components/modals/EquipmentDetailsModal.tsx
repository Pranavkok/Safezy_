'use client';

import { useState } from 'react';
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
import { ERROR_MESSAGES } from '@/constants/constants';
import toast from 'react-hot-toast';
import EyeIcon from '@/components/svgs/EyeIcon';
import { fetchOrderedProductDetailsModal } from '@/actions/contractor/inventory';
import { OrderedProductDetailsModalType } from '@/types/inventory.types';

const EquipmentDetailsModal = ({ equipmentId }: { equipmentId: number }) => {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<OrderedProductDetailsModalType[]>([]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetchOrderedProductDetailsModal(equipmentId);
      if (res.success) {
        setHistory(res.data as OrderedProductDetailsModalType[]);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error(error.message || ERROR_MESSAGES.UNEXPECTED_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setIsOpen(isOpen);
    if (isOpen) {
      fetchHistory();
    } else {
      setHistory([]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <div className="flex items-center pl-2">
          <EyeIcon className="fill-gray-400 hover:fill-primary w-5 h-5 transition-colors duration-300" />
        </div>
      </DialogTrigger>

      <DialogContent
        className="bg-white min-w-[320px]"
        onInteractOutside={e => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl uppercase">Details</DialogTitle>
          <hr className="border-gray-300 mt-3" />
        </DialogHeader>

        <div>
          {loading && <p>Loading...</p>}
          {!loading && history.length === 0 && <p>No data available.</p>}
          {!loading && history.length > 0 && (
            <div>
              {history.map((item, index) => (
                <div key={index}>
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-2">
                      <div className="min-w-[150px]">Name</div>
                      <div>: {item.employeeName}</div>
                    </div>
                    <div className="flex gap-2">
                      <div className="min-w-[150px]">ID</div>
                      <div>: {item.id}</div>
                    </div>
                    <div className="flex gap-2">
                      <div className="min-w-[150px]">Remaining Life</div>
                      <div>: {item.remainingLife} days</div>
                    </div>
                  </div>
                  <hr className="border-gray-300 mt-3" />
                  <div>
                    <div className="font-bold mt-2 text-lg">
                      Assigned History
                    </div>
                    <div className="flex flex-col gap-1 mt-2">
                      <div className="flex gap-2">
                        <div className="min-w-[150px]">Assigned Date</div>
                        <div>: {item.assignedDate || ''}</div>
                      </div>
                      <div className="flex gap-2">
                        <div className="min-w-[150px]">Unassigned Date</div>
                        <div>: {item.unassignedDate || null}</div>
                      </div>
                      <div className="flex gap-2">
                        <div className="min-w-[150px]">Current Status</div>
                        <div>: {item.status}</div>
                      </div>
                    </div>
                  </div>
                  <hr className="border-gray-300 mt-3" />
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="justify-center sm:justify-end mt-5">
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

export default EquipmentDetailsModal;
