'use client';
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PackageCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import SelectWithLabel from '@/components/inputs-fields/SelectWithLabel';
import InputFieldWithLabel from '@/components/inputs-fields/InputFieldWithLabel';
import ButtonSpinner from '@/components/ButtonSpinner';
import { updateOrderDetailsByWarehouseOperator } from '@/actions/warehouse-operator/order';

// Constants
const ORDER_STATUSES = [
  { value: 'Processing', label: 'Processing' },
  { value: 'Shipped', label: 'Shipped' },
  { value: 'Out For Delivery', label: 'Out For Delivery' },
  { value: 'Delivered', label: 'Delivered' },
  { value: 'Cancelled', label: 'Cancelled' }
];

type OrderStatus = (typeof ORDER_STATUSES)[number]['value'];

// Schema
const orderSchema = z.object({
  status: z.string(),
  estimatedDeliveryDate: z
    .string()
    .min(1, 'Estimated delivery date is required')
});

type OrderFormData = z.infer<typeof orderSchema>;

interface UpdateOrderStatusSectionProps {
  orderId: string;
  estimatedDeliveryDate?: string;
  orderStatus?: OrderStatus;
  isDelivered?: boolean;
}

const UpdateOrderStatusSection: React.FC<UpdateOrderStatusSectionProps> = ({
  orderId,
  estimatedDeliveryDate,
  orderStatus,
  isDelivered = false
}) => {
  const [loading, setLoading] = useState(false);
  const [showDeliveryConfirmation, setShowDeliveryConfirmation] =
    useState(false);
  const [pendingOrderData, setPendingOrderData] =
    useState<OrderFormData | null>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      estimatedDeliveryDate: estimatedDeliveryDate || '',
      status: orderStatus || 'Processing'
    }
  });

  const handleStatusUpdate = (data: OrderFormData): boolean => {
    if (data.status === 'Delivered') {
      setShowDeliveryConfirmation(true);
      setPendingOrderData(data);
      return false;
    }
    return true;
  };

  const handleUpdateOrder = async (data: OrderFormData) => {
    try {
      const response = await updateOrderDetailsByWarehouseOperator(orderId, {
        estimatedDeliveryDate: data.estimatedDeliveryDate,
        orderStatus: data.status
      });

      if (response.success) {
        toast.success('Order updated successfully!');
      } else {
        toast.error('Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('An error occurred while updating the order');
    }
  };

  const onSubmit = async (data: OrderFormData) => {
    if (!handleStatusUpdate(data)) return;

    setLoading(true);
    await handleUpdateOrder(data);
    setLoading(false);
  };

  const handleConfirmDelivery = async () => {
    if (!pendingOrderData) return;

    setLoading(true);
    await handleUpdateOrder(pendingOrderData);
    setShowDeliveryConfirmation(false);
    setLoading(false);
    setPendingOrderData(null);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-4 border-2 rounded-md h-full"
      >
        <h2 className="text-lg font-semibold pb-3 text-primary">
          Manage Order
        </h2>

        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <SelectWithLabel
              {...field}
              label="Delivery Status"
              options={ORDER_STATUSES}
              onChange={field.onChange}
              errorText={errors.status?.message}
              disabled={isDelivered}
            />
          )}
        />

        <InputFieldWithLabel
          type="date"
          label="Estimated Delivery Date"
          min={new Date().toISOString().split('T')[0]}
          required
          errorText={errors.estimatedDeliveryDate?.message}
          disabled={isDelivered}
          {...register('estimatedDeliveryDate')}
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            className="w-full lg:w-44"
            disabled={loading || isDelivered}
          >
            {loading && <ButtonSpinner />}
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>

      <AlertDialog
        open={showDeliveryConfirmation}
        onOpenChange={setShowDeliveryConfirmation}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-primary" />
              Confirm Order Delivery
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this order as delivered? This action
              cannot be undone, and the delivery status will be locked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setPendingOrderData(null);
                setShowDeliveryConfirmation(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelivery}
              disabled={loading}
            >
              {loading ? 'Confirming...' : 'Confirm Delivery'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UpdateOrderStatusSection;
