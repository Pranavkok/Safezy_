'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { deleteContractor } from '@/actions/contractor/contractor';
import { AppRoutes } from '@/constants/AppRoutes';
const DeleteCustomerAccount = ({
  id,
  open,
  setIsOpen
}: {
  id: string;
  open: boolean;
  setIsOpen: (open: boolean) => void;
}) => {
  const user = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await deleteContractor(id);
      if (res.success) {
        await user.logout();
        toast.success(res.message);
        window.location.reload();
        router.push(AppRoutes.LOGIN);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.error('Error deleting contractor:', error);
      toast.error('Failed to delete contractor');
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogContent className="bg-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="mb-2">
            Are you sure you want to delete your account?
          </DialogTitle>
          <DialogDescription className="text-justify">
            Your account delete request will be sent to the admin. Please
            confirm that you want to proceed with the deletion of your account
            and you will not be able to login to your account until admin
            performs any action.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            className="h-9 lg:w-32 bg-white"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            className="text-sm capitalize h-9 lg:min-w-32"
            onClick={e => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <span className="loader mr-2" /> Deleting...
              </span>
            ) : (
              'Delete Account'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default DeleteCustomerAccount;
