'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/context/CartContext';
import { useCartCalculations } from '@/hooks/useCartCalculations';
import toast from 'react-hot-toast';
import CartHeaderSection from './CartHeaderSection';
import GroupedCartItemSection from './GroupCartItemSection';
import OrderSummarySection from './OrderSummarySection';
import { Button } from '@/components/ui/button';
import { PackageOpen, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AddressSelectionSection from './AddressSelectionSection';
import { getProductLeadTimeFromLeadTimeTiers } from '@/utils';
import BackButtonHeader from '@/components/BackButton';
import NavigationBreadcrumbs from '@/components/NavigationBreadcrumbs';
import { AppRoutes } from '@/constants/AppRoutes';
import { WorksiteAddressType } from '@/actions/contractor/worksite';

const EmptyCartState = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-8">
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary-500/20 to-primary-500/20 blur" />
        <div className="relative bg-white p-4 rounded-full">
          <PackageOpen className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
        Your cart is empty
      </h2>

      <p className="text-gray-500 text-center max-w-md mb-8">
        Looks like you haven&#39;t added anything to your cart yet. Explore our
        collection and find something you&#39;ll love!
      </p>

      <Button
        onClick={() => router.push(AppRoutes.PRODUCT_LISTING)}
        className="flex items-center gap-2 text-white px-6 py-3 rounded-full transition-all duration-200 shadow-md  capitalize"
      >
        <ShoppingBag className="w-4 h-4" />
        Start Shopping
      </Button>
    </div>
  );
};

const breadcrumbItems = [
  { label: 'Home', route: '/' },
  { label: 'Cart', route: '/cart' }
] as const;

const CartDetailsSection = () => {
  const { state, clearCartItems } = useCart();
  const { groupedItems, subtotal, shipping, total, totalGST } =
    useCartCalculations(state.cartItems);

  const [isClearing, setIsClearing] = useState(false);
  const [selectedWorksite, setSelectedWorksite] = useState<{
    worksite_id: string;
    address_id: string;
    address: WorksiteAddressType;
  }>({
    worksite_id: '',
    address_id: '',
    address: {
      street1: '',
      street2: '',
      locality: '',
      city: '',
      state: '',
      country: '',
      zipcode: ''
    }
  });

  const handleClearCart = async () => {
    try {
      setIsClearing(true);
      await clearCartItems();
      toast.success('All items have been removed from your cart.');
    } catch (error) {
      toast.error('Failed to clear cart. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  if (!state.cartItems.length) {
    return (
      <div className="min-h-screen  flex flex-col">
        <div className="w-[95vw] sm:w-[90vw] mx-auto">
          <div className="flex gap-1 my-5 h-14 lg:h-16 rounded items-center">
            <BackButtonHeader />
            <div className=" bg-white flex h-full w-full  flex-col justify-center px-4">
              <h1 className="font-bold uppercase text-sm lg:text-xl">
                Shopping Cart
              </h1>
            </div>
          </div>

          <Card className="rounded shadow-none border-none">
            <CardContent className="p-0">
              <EmptyCartState />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const expectedLeadTime = groupedItems.map(group => {
    return getProductLeadTimeFromLeadTimeTiers(
      group.totalQuantity,
      group.items[0].product.leadTimeTiers
    );
  });
  const maxLeadTime = Math.max(...expectedLeadTime);

  return (
    <div className="flex flex-col">
      <div className="w-[95vw] sm:w-[90vw] mx-auto space-y-4">
        <div className="flex gap-1  my-5 h-14 lg:h-16 rounded items-center">
          <BackButtonHeader />
          <div className=" bg-white flex h-full w-full  flex-col justify-center px-4">
            <h1 className="font-bold uppercase text-sm lg:text-xl">Cart</h1>
            <NavigationBreadcrumbs breadcrumbOptions={breadcrumbItems} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-5">
          <div className="lg:col-span-8">
            <Card className="shadow-lg">
              <CardContent className="p-6 space-y-6">
                <CartHeaderSection
                  onClearCart={handleClearCart}
                  isClearing={isClearing}
                />{' '}
                <hr />
                {groupedItems
                  .map(group => (
                    <GroupedCartItemSection key={group.id} group={group} />
                  ))
                  .reverse()}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 ">
            <div className="flex flex-col gap-5 sticky top-20">
              <AddressSelectionSection
                setSelectedWorksite={setSelectedWorksite}
                selectedWorksite={selectedWorksite}
              />
              <OrderSummarySection
                maxLeadTime={maxLeadTime}
                selectedWorksite={selectedWorksite}
                subtotal={subtotal}
                shipping={shipping}
                total={total}
                totalGST={totalGST}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDetailsSection;
