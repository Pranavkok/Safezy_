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
import { deleteEhsNews } from '@/actions/admin/ehs/news';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AppRoutes } from '@/constants/AppRoutes';

export function ConfirmDeleteNews({
  id,
  isFromListing = false
}: {
  id: number;
  isFromListing?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await deleteEhsNews(id);
      if (res.success) {
        toast.success('EHS News deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['EhsNews'] });
        router.push(AppRoutes.ADMIN_EHS_NEWS_LISTING);
        setOpen(false);
      } else {
        toast.error('Failed to delete EHS News');
      }
    } catch (error) {
      console.error('Error deleting EHS News:', error);
      toast.error('An error occurred while deleting the news.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isFromListing ? (
          <Trash2 className=" h-5 w-5 text-primary cursor-pointer" />
        ) : (
          <Button variant="destructive" size="sm" className="flex items-center">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete News
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            Do you really want to delete this EHS News item?
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
              'Delete News'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmDeleteNews;
