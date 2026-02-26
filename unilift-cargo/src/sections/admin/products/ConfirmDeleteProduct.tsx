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
import { deleteProduct } from '@/actions/admin/product';

interface DeleteProductProps {
  productName: string;
  id: string;
}
export function ConfirmDeleteProduct({ productName, id }: DeleteProductProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await deleteProduct(id);
      if (res.success) {
        toast.success(res.message);
        setOpen(false);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('An error occurred while deleting the product.');
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
            Do you really want to delete <strong>{productName}</strong> product?
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
              'Delete Product'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmDeleteProduct;
