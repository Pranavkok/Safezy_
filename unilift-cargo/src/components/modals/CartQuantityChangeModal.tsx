import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { CartItemType, useCart } from '@/context/CartContext';
import InputFieldWithLabel from '../inputs-fields/InputFieldWithLabel';

// Define the form schema
const QuantitySchema = z.object({
  quantity: z.string({ required_error: 'Quantity is required' })
});

type QuantityFormDataType = z.infer<typeof QuantitySchema>;

const validateQuantity = (value: string) => {
  const num = parseInt(value);

  if (value.trim() === '') {
    return 'Please enter a quantity';
  }

  if (isNaN(num)) {
    return 'Please enter a valid number';
  }

  if (num < 1) {
    return 'The quantity cannot be less than 1';
  }

  if (!Number.isInteger(num)) {
    return 'Please enter a whole number';
  }

  return '';
};

const CartQuantityChangeModal = ({ item }: { item: CartItemType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { updateCartItemQuantity } = useCart();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset
  } = useForm<QuantityFormDataType>({
    resolver: zodResolver(QuantitySchema),
    defaultValues: {
      quantity: item.quantity.toString()
    }
  });

  const onSubmit = async (data: QuantityFormDataType) => {
    const validationError = validateQuantity(data.quantity);
    if (validationError) {
      setError('quantity', { message: validationError });
      return;
    }

    setLoading(true);
    try {
      await updateCartItemQuantity(item.id, +data.quantity);
      setIsOpen(false);
      reset();
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div
        onClick={() => setIsOpen(true)}
        className="h-8 px-3 flex items-center justify-center border-t border-b border-gray-200 bg-white min-w-[3rem] cursor-pointer"
      >
        <span className="text-sm">{item.quantity}</span>
      </div>

      <DialogContent
        className="bg-white"
        onInteractOutside={e => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{item.product.name} - Adjust Quantity</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <InputFieldWithLabel
              type="text"
              label="Quantity"
              defaultValue={item.quantity}
              errorText={errors.quantity?.message as string}
              {...register('quantity')}
              required
            />
          </div>

          <DialogFooter className="justify-center sm:justify-end">
            <DialogClose asChild>
              <Button
                className="h-9 lg:w-32 bg-white"
                variant="outline"
                disabled={loading}
              >
                Cancel
              </Button>
            </DialogClose>

            <Button
              type="submit"
              className="text-sm capitalize h-9 lg:min-w-32"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <span className="loader mr-2" /> Updating...
                </span>
              ) : (
                'Update Quantity'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CartQuantityChangeModal;
