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
import toast from 'react-hot-toast';
import { deleteWorksite } from '@/actions/contractor/worksite';

export function ConfirmDeleteWorskite({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await deleteWorksite(id);
      if (res.success) {
        toast.success(res.message);
        setOpen(false);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.error('Error deleting worskite:', error);
      toast.error('An error occurred while deleting the worksite.');
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
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            Do you really want to delete this Worskite?
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
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <span className="loader mr-2" /> Deleting...
              </span>
            ) : (
              'Delete Worskite'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmDeleteWorskite;
