'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateOrderDetails } from '@/actions/contractor/order';
import { OrderFormType } from '@/types/order.types';
import { sendOrderConfirmation } from '@/actions/email';
import { orderSchema } from '@/validations/admin/manage-order';
import SelectWithLabel from '../inputs-fields/SelectWithLabel';
import toast from 'react-hot-toast';
import { ERROR_MESSAGES } from '@/constants/constants';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ManageOrderModal = ({
  warehouseList,
  orderId,
  warehouse_operator_id
}: {
  warehouseList:
    | { id: string; store_name: string; email: string }[]
    | undefined;
  orderId: string;
  warehouse_operator_id: string;
}) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const isWarehouseAssigned = Boolean(warehouse_operator_id);
  const assignedWarehouse = warehouseList?.find(
    warehouse => warehouse.id === warehouse_operator_id?.toString()
  );

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<OrderFormType>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      warehouse: warehouse_operator_id?.toString() || undefined
    }
  });

  const onSubmit = async (data: OrderFormType) => {
    setLoading(true);

    const res = await updateOrderDetails(orderId, {
      warehouseId: data.warehouse
    });

    if (res.success) {
      const warehouseOperatorEmail = warehouseList?.find(
        warehouse => warehouse.id === data.warehouse
      )?.email;

      if (warehouseOperatorEmail) await handleSendEmail(warehouseOperatorEmail);
      setOpen(false);
      setLoading(false);
    } else {
      toast.error(res.message);
    }
  };

  const warehouseOptions =
    warehouseList?.map(warehouse => ({
      value: warehouse.id,
      label: warehouse.store_name,
      email: warehouse.email
    })) || [];

  const handleSendEmail = async (warehouseOperatorEmail: string) => {
    try {
      const response = await sendOrderConfirmation(
        orderId,
        warehouseOperatorEmail
      );
      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(ERROR_MESSAGES.EMAIL_NOT_SENT);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="w-56">
          Manage Order
        </Button>
      </DialogTrigger>
      <DialogContent
        className="bg-white"
        onInteractOutside={e => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Manage Order</DialogTitle>
        </DialogHeader>

        {isWarehouseAssigned ? (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription>
              This order is already assigned to warehouse:{' '}
              <strong>{assignedWarehouse?.store_name}</strong>
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="max-w-md">
              <Controller
                name="warehouse"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <SelectWithLabel
                    {...field}
                    label="Select Warehouse"
                    options={warehouseOptions}
                    onChange={value => field.onChange(value)}
                    errorText={errors.warehouse?.message}
                  />
                )}
              />
            </div>

            <DialogFooter className="justify-center sm:justify-end">
              <DialogClose asChild>
                <Button
                  className="h-9 lg:w-32 bg-white"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </DialogClose>

              <Button
                className="text-sm capitalize h-9 lg:min-w-32"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="loader mr-2" /> Assigning...
                  </span>
                ) : (
                  'Assign'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ManageOrderModal;
