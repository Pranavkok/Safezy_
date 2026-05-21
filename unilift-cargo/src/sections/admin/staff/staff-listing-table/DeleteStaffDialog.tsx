'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import ButtonSpinner from '@/components/ButtonSpinner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

import { deleteStaffUser, StaffMember } from '@/actions/admin/staff';

interface Props {
  staff: StaffMember;
}

const DeleteStaffDialog = ({ staff }: Props) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      const response = await deleteStaffUser(String(staff.id));
      if (response.success) {
        toast.success(response.message);
        setOpen(false);
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
          <Trash2 size={15} />
        </button>
      </DialogTrigger>

      <DialogContent className="bg-white sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Delete Staff Member</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-600 mt-1">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-gray-900">
            {staff.first_name} {staff.last_name}
          </span>
          ? This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3 mt-4">
          <Button
            type="button"
            variant="outline"
            className="h-9"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="h-9 min-w-24"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? <ButtonSpinner /> : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteStaffDialog;
