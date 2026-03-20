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
import { DeleteIcon } from '@/components/svgs';
import { deactivateUser } from '@/actions';
import toast from 'react-hot-toast';

export interface DeleteWarehousePropsType {
  storeName: string;
  id: string;
}

export function ConfirmDeleteWarehouse({
  storeName,
  id
}: DeleteWarehousePropsType) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false); // Manage dialog open state

  const handleDelete = async () => {
    setLoading(true);
    try {
      const result = await deactivateUser(id);
      if (result.success) {
        toast.success(result.message); // Show success toast
      } else {
        toast.error(result.message); // Show error toast if failed
      }
      setOpen(false);
    } catch (error) {
      console.error('Error deleting warehouse:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="hover:bg-transparent">
          <DeleteIcon className="fill-gray-400 hover:fill-primary w-5 h-5 transition-colors duration-300" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{' '}
            <strong>
              {storeName} {id}
            </strong>
            ? This action cannot be undone and will permanently remove all
            associated data from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            className="h-9 lg:w-32 bg-white"
            variant="outline"
            onClick={() => setOpen(false)} // Close the dialog when cancel is clicked
          >
            Cancel
          </Button>
          <Button
            className="text-sm capitalize h-9 lg:min-w-32"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete Warehouse'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
