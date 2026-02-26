import ButtonSpinner from '@/components/ButtonSpinner';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

type ActionButtonsPropsType = {
  loading: boolean;
  isOutOfStock: boolean; // New prop to handle out-of-stock state
};

const ActionButtons = ({ loading, isOutOfStock }: ActionButtonsPropsType) => {
  const router = useRouter();

  return (
    <>
      <Button
        type="submit"
        size="lg"
        className="capitalize text-md sm:text-lg sm:w-full"
        disabled={loading || isOutOfStock} // Disable if loading or out of stock
      >
        {loading ? (
          <ButtonSpinner />
        ) : (
          <ShoppingCart className="mr-2 h-4 w-4" />
        )}
        Add to Cart
      </Button>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="bg-white font-semibold text-md sm:text-lg sm:w-full"
        onClick={() => router.push('/cart')}
      >
        View Cart
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </>
  );
};

export default ActionButtons;
