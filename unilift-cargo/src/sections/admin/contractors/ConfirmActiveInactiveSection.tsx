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
import { deactivateUser, activateUser } from '@/actions'; // Assuming `activateUser` is an action like `deactivateUser`
import { toast } from 'react-hot-toast'; // Assuming you're using `react-hot-toast`
import { USER_ROLES } from '@/constants/constants';

interface ConfirmActiveInactiveSectionProps {
  id: string;
  isActive: boolean | null;
  userRole: string;
}

const ConfirmActiveInactiveSection = ({
  id,
  isActive,
  userRole
}: ConfirmActiveInactiveSectionProps) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleToggleStatus = async () => {
    setLoading(true);
    try {
      if (isActive) {
        // Deactivate if currently active
        const result = await deactivateUser(id, userRole);
        if (result.success) {
          toast.success(result.message); // Show success toast
        } else {
          toast.error(result.message); // Show error toast if failed
        }
      } else {
        // Activate if currently inactive
        const result = await activateUser(id, userRole);
        if (result.success) {
          toast.success(result.message); // Show success toast
        } else {
          toast.error(result.message); // Show error toast if failed
        }
      }

      setOpen(false); // Close the dialog on success
    } catch (error) {
      console.error('Error toggling contractor status:', error);
      toast.error('An error occurred while changing the status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex gap-2  ">
        <DialogTrigger asChild className="">
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
          <DialogDescription>{`Do you really want to  ${isActive ? 'inactivate' : 'activate'}  this 
          ${userRole === USER_ROLES.CONTRACTOR ? 'customer' : ''}
          ${userRole === USER_ROLES.WAREHOUSE_OPERATOR ? 'warehouse' : ''}? `}</DialogDescription>
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
            className="text-sm capitalize h-9 lg:min-w-32"
            onClick={handleToggleStatus}
            disabled={loading}
          >
            {loading
              ? isActive
                ? 'Inactivating...'
                : 'Activating...'
              : isActive
                ? 'Inactivate'
                : 'Activate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmActiveInactiveSection;
