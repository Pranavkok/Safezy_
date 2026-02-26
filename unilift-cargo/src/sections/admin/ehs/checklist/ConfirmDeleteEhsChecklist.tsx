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
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { deleteChecklist } from '@/actions/admin/ehs/checklist';

export function ConfirmDeleteEhsChecklist({ id }: { id: number }) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await deleteChecklist(id);
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({ queryKey: ['allChecklistTopics'] });

        setOpen(false);
      } else {
        toast.error('Failed to delete EHS Checklist');
      }
    } catch (error) {
      console.error('Error deleting EHS checklist:', error);
      toast.error('An error occurred while deleting the checklist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Trash2 className=" h-5 w-5 text-primary cursor-pointer" />
      </DialogTrigger>
      <DialogContent className="bg-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            Do you really want to delete this EHS Checklist?
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
              'Delete checklist'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmDeleteEhsChecklist;
