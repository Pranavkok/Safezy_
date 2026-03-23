'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';
import { toggleStaffStatus } from '@/actions/admin/staff';

interface Props {
  id: number;
  isActive: boolean | null;
}

const ToggleStaffStatusSection = ({ id, isActive }: Props) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const result = await toggleStaffStatus(id, isActive ?? true);
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('An error occurred while changing the status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex gap-2">
        <DialogTrigger asChild>
          <button
            className={`px-3 py-1 flex justify-center items-center rounded-full text-xs font-semibold cursor-pointer shadow ${
              isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </button>
        </DialogTrigger>
      </div>

      <DialogContent className="bg-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            {`Do you really want to ${isActive ? 'deactivate' : 'activate'} this staff member?`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            className="h-9 lg:w-32 bg-white"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="text-sm h-9 lg:min-w-32"
            onClick={handleToggle}
            disabled={loading}
          >
            {loading
              ? isActive
                ? 'Deactivating...'
                : 'Activating...'
              : isActive
                ? 'Deactivate'
                : 'Activate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ToggleStaffStatusSection;
