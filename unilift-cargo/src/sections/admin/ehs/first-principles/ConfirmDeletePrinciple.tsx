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
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { deleteFirstPrinciple } from '@/actions/admin/ehs/first-principles';
import { DeleteIcon } from '@/components/svgs';

export const ConfirmFirstPrincipleDelete = ({ id }: { id: number }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await deleteFirstPrinciple(id);
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({ queryKey: ['firstPrinciples'] });
        setOpen(false);
      } else {
        toast.error('Failed to delete EHS First Principle');
      }
    } catch (error) {
      console.error('Error deleting EHS First Principle:', error);
      toast.error('An error occurred while deleting the first principle.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="hover:bg-transparent">
          <DeleteIcon className="fill-gray-400 hover:fill-primary w-4 h-4 transition-colors duration-300" />
        </div>
      </DialogTrigger>
      <DialogContent className="bg-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            Do you really want to delete this EHS First Principle?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            className="h-9 lg:w-32 bg-white"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            className="text-sm capitalize h-9 lg:min-w-32"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <span className="loader mr-2" />
                Deleting...
              </span>
            ) : (
              'Delete Principle'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmFirstPrincipleDelete;
