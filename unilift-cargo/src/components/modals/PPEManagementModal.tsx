'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
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
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import toast from 'react-hot-toast';
import { fetchOrderedProductsForModal } from '@/actions/contractor/inventory';
import { assignPPEToEmployee } from '@/actions/contractor/employee';
import { useSearchParams } from 'next/navigation';
import { OrderedProductType } from '@/types/inventory.types';
import Spinner from '../loaders/Spinner';

interface PPEManagementModalProps {
  employeeId: number;
}

const PPEManagementModal: React.FC<PPEManagementModalProps> = ({
  employeeId
}) => {
  const searchParams = useSearchParams();
  const worksite = searchParams.get('worksite');

  const [isOpen, setIsOpen] = useState(false);
  const [selectedInventoryIds, setSelectedInventoryIds] = useState<{
    [key: string]: boolean;
  }>({});

  // Fetch ordered products for assignment
  const {
    data: orderedProducts = [],
    isLoading: isProductsLoading,
    refetch: refetchOrderedProducts
  } = useQuery({
    queryKey: ['inventoryProduct', worksite],
    queryFn: async () => {
      if (!worksite) return [];

      const res = await fetchOrderedProductsForModal(worksite);
      if (!res.success || !res.data) {
        toast.error(ERROR_MESSAGES.INVENTORY_NOT_FETCHED);
        return [];
      }

      return res.data.reduce(
        (acc, product) => {
          if (
            product.product_id &&
            product.id &&
            product.quantity !== undefined &&
            (product.quantity as number) > 0
          ) {
            const existingProduct = acc.find(
              item => item.product_id === product.product_id
            );

            if (existingProduct) {
              existingProduct.quantity! += product.quantity as number;
              existingProduct.inventoryIds.push(product.id);
            } else {
              acc.push({
                product_id: product.product_id,
                name: product.name ?? '',
                quantity: product.quantity,
                inventoryIds: [product.id]
              });
            }
          }
          return acc;
        },
        [] as (Partial<OrderedProductType> & { inventoryIds: string[] })[]
      );
    },
    enabled: isOpen
  });

  // Mutation for assigning PPE
  const assignPPEMutation = useMutation({
    mutationFn: async () => {
      const inventoryIdsToAssign = Object.entries(selectedInventoryIds)
        .filter(([, isSelected]) => isSelected)
        .map(([inventoryId]) => inventoryId);

      if (inventoryIdsToAssign.length === 0) {
        throw new Error('No products selected to assign.');
      }

      const res = await assignPPEToEmployee(employeeId, inventoryIdsToAssign);
      if (!res.success) {
        throw new Error(res.message);
      }

      await refetchOrderedProducts();
      return res;
    },
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.PPE_ASSIGNED);
      setSelectedInventoryIds({});
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || ERROR_MESSAGES.PPE_NOT_ASSIGNED);
    }
  });

  const toggleProductSelection = (inventoryId: string) => {
    setSelectedInventoryIds(prev => ({
      ...prev,
      [inventoryId]: !prev[inventoryId]
    }));
  };

  const renderAssignList = (
    products: Array<Partial<OrderedProductType> & { inventoryIds: string[] }>
  ) => {
    if (isProductsLoading || assignPPEMutation.isPending) {
      return (
        <div className="flex justify-center items-center py-4">
          <Spinner className="w-8 h-8 W" />
        </div>
      );
    }

    if (products.length === 0) {
      return (
        <div className="text-center py-6 bg-secondary/10 rounded-lg">
          <p className="text-base font-medium text-foreground">
            No PPE Available
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Check inventory or contact management
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
        {products.map(product => {
          const inventoryId = product.inventoryIds[0];
          const isSelected = selectedInventoryIds[inventoryId];

          return (
            <div
              key={product.product_id}
              onClick={() => toggleProductSelection(inventoryId)}
              className={`
                group flex items-center justify-between p-3 
                border rounded-lg cursor-pointer 
                transition-all duration-200 ease-in-out
                hover:shadow-md hover:border-primary/30
                ${isSelected ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white hover:bg-gray-50/80'}
              `}
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Quantity available: {product.quantity}
                </p>
              </div>

              <div
                className={`
                  w-5 h-5 rounded-full flex items-center justify-center
                  border-2 transition-all duration-300
                  ${isSelected ? 'bg-primary border-primary text-primary-foreground' : 'bg-white border-border'}
                `}
              >
                {isSelected && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          Assign PPE
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-white sm:max-w-[500px] rounded-xl shadow-2xl">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-bold flex items-center space-x-2">
            <span>Assign PPE</span>
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-[150px]">{renderAssignList(orderedProducts)}</div>

        <DialogFooter className=" flex justify-between items-center border-t pt-4 gap-2">
          <DialogClose asChild>
            <Button variant="outline" size="sm" className=" w-full">
              Cancel
            </Button>
          </DialogClose>

          <Button
            size="sm"
            onClick={() => assignPPEMutation.mutate()}
            disabled={
              assignPPEMutation.isPending ||
              Object.keys(selectedInventoryIds).filter(
                key => selectedInventoryIds[key]
              ).length === 0
            }
            className={`
              bg-primary text-primary-foreground hover:bg-primary/90 w-full
              ${assignPPEMutation.isPending ? 'opacity-70 cursor-not-allowed' : ''}
            `}
          >
            {assignPPEMutation.isPending ? 'Assigning...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PPEManagementModal;
