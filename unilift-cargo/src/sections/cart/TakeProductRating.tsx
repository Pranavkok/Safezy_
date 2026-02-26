import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import ProductFeedbackModal, {
  ProductFeedback
} from '@/components/modals/contractor/ProductRating';
import {
  addProductFeedback,
  fetchProductsForFeedback
} from '@/actions/contractor/rating';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Spinner from '@/components/loaders/Spinner';
import OrderDeliveryStateCheckModal from '@/components/modals/contractor/OrderDeliveryStateCheck';
import { STATE } from '@/constants/constants';

export const ProductFeedbackPage = ({
  handlePayment,
  isProcessing,
  disabled,
  state
}: {
  handlePayment: () => Promise<void>;
  isProcessing: boolean;
  disabled: boolean;
  state: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isStateModalOpen, setIsStateModalOpen] = useState(false);

  // Fetch products query
  const {
    data: products,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['productsForFeedback'],
    queryFn: () => fetchProductsForFeedback(),
    refetchOnWindowFocus: false
  });

  const feedbackMutation = useMutation({
    mutationFn: (feedbackList: ProductFeedback[]) =>
      addProductFeedback(feedbackList, products?.data.orderId ?? ''),
    onSuccess: result => {
      if (result.success) {
        toast.success(result.message);
        refetch();
        setIsOpen(false); // Close the modal on successful submission
      } else {
        toast.error(result.message);
      }
    },
    onError: error => {
      toast.error('An unexpected error occurred');
      console.error(error);
    }
  });

  if (isLoading)
    return (
      <Button
        onClick={handlePayment}
        disabled={isProcessing || disabled}
        className="w-full text-xs sm:text-sm"
        size="sm"
      >
        <Spinner />
      </Button>
    );

  if (!state) {
    return (
      <Button
        onClick={handlePayment}
        disabled={isProcessing || disabled}
        className="w-full text-xs sm:text-sm"
        size="sm"
      >
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </div>
        ) : (
          'Proceed to Payment'
        )}
      </Button>
    );
  }

  return (
    <div>
      {state.toLocaleLowerCase().trim() === STATE.GUJARAT ? (
        !error &&
        products?.data?.productsForFeedbacks &&
        products.data.productsForFeedbacks.length > 0 ? (
          <ProductFeedbackModal
            products={products.data.productsForFeedbacks}
            open={isOpen}
            setIsOpen={setIsOpen}
            onSubmit={feedback => {
              feedbackMutation.mutate(feedback);
            }}
            onPayment={handlePayment}
            isProcessing={isProcessing}
            disabled={disabled}
          />
        ) : (
          <Button
            onClick={handlePayment}
            disabled={isProcessing || disabled}
            className="w-full text-xs sm:text-sm"
            size="sm"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </div>
            ) : (
              'Proceed to Payment'
            )}
          </Button>
        )
      ) : (
        <OrderDeliveryStateCheckModal
          open={isStateModalOpen}
          setIsOpen={setIsStateModalOpen}
        />
      )}
    </div>
  );
};
