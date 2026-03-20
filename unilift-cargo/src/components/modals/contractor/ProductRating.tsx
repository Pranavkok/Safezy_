import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import CustomRating from '@/components/CustomRating';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';

// Simplified type definition
interface Product {
  id: string;
  name: string;
  image: string;
}

export interface ProductFeedback {
  productId: string;
  rating: number;
  description: string;
}

const ProductFeedbackModal = ({
  products,
  open,
  setIsOpen,
  onSubmit,
  onPayment,
  isProcessing,
  disabled
}: {
  products: Product[];
  open: boolean;
  setIsOpen: (open: boolean) => void;
  onSubmit: (feedback: ProductFeedback[]) => void;
  onPayment: () => Promise<void>;
  isProcessing: boolean;
  disabled: boolean;
}) => {
  // Use useMemo to create unique products and prevent duplicate entries
  const uniqueProducts = useMemo(() => {
    const uniqueMap = new Map();
    products.forEach(product => {
      if (!uniqueMap.has(product.id)) {
        uniqueMap.set(product.id, product);
      }
    });
    return Array.from(uniqueMap.values());
  }, [products]);

  // Initialize feedback state as an array
  const [productFeedback, setProductFeedback] = useState<ProductFeedback[]>(
    uniqueProducts.map(product => ({
      productId: product.id,
      rating: 0,
      description: ''
    }))
  );

  const [loadingButton, setLoadingButton] = useState<'skip' | 'submit' | null>(
    null
  );

  // Handle rating change for a specific product
  const handleRatingChange = (productId: string, rating: number) => {
    setProductFeedback(prev =>
      prev.map(feedback =>
        feedback.productId === productId ? { ...feedback, rating } : feedback
      )
    );
  };

  // Handle description change for a specific product
  const handleDescriptionChange = (productId: string, description: string) => {
    setProductFeedback(prev =>
      prev.map(feedback =>
        feedback.productId === productId
          ? { ...feedback, description }
          : feedback
      )
    );
  };
  const handleSubmitAndPay = async () => {
    setLoadingButton('submit');
    const validFeedback = productFeedback.filter(
      feedback => feedback.rating > 0
    );
    try {
      onSubmit(validFeedback);
      await onPayment();
    } catch (error) {
      console.error('Error submitting feedback or processing payment', error);
    } finally {
      setLoadingButton(null);
    }
  };

  // Payment handler
  const handleSkipAndPay = async () => {
    setLoadingButton('skip');
    try {
      await onPayment();
    } catch (error) {
      console.error('Error processing payment', error);
    } finally {
      setLoadingButton(null);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full  " disabled={disabled}>
          Proceed to Payment
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[90%] max-w-3xl p-2 sm:p-4 lg:p-6 bg-white z-[1000]">
        <DialogHeader className="px-2 sm:px-4">
          <DialogTitle className="text-base sm:text-lg md:text-xl">
            Share Feedback & Rate Your Past Purchases
          </DialogTitle>
          <p className="text-sm text-gray-600">
            We value your feedback! Share your experience and rate the products
            you&#39;ve purchased to help us improve.
          </p>
          <DialogClose />
        </DialogHeader>

        <ScrollArea className="h-[60vh] max-h-[500px] w-full px-1 sm:px-2 ">
          <div className="space-y-2 sm:space-y-3 pr-1 sm:pr-2">
            {uniqueProducts.map(product => {
              const feedback = productFeedback.find(
                f => f.productId === product.id
              )!;

              return (
                <div
                  key={product.id}
                  className="border rounded-lg p-2 sm:p-3 space-y-2 sm:space-y-3 bg-gray-50/50"
                >
                  <div className="flex flex-col lg:flex-row items-center justify-between">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-800 truncate pr-2">
                      {product.name}
                    </h3>
                    <div className="text-yellow-500 flex-shrink-0">
                      <CustomRating
                        initialRating={feedback?.rating}
                        onRatingChange={rating =>
                          handleRatingChange(product.id, rating)
                        }
                        size={20}
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2 sm:space-x-3">
                    <div className="w-20 sm:w-24 flex-shrink-0">
                      <div className="border h-20 sm:h-24 rounded-lg overflow-hidden shadow-sm">
                        {product.image && (
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={96}
                            height={96}
                            className="object-cover w-full h-full"
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex-grow space-y-2">
                      <Textarea
                        placeholder="Share your experience (optional)"
                        className="w-full text-xs sm:text-sm"
                        rows={3}
                        value={feedback?.description}
                        onChange={e =>
                          handleDescriptionChange(product.id, e.target.value)
                        }
                        maxLength={500}
                      />
                      <p className="text-xs text-gray-500 text-right">
                        {feedback?.description.length}/500
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="px-2 sm:px-4 pt-2 grid grid-cols-2 gap-2">
          <Button
            onClick={handleSkipAndPay}
            className="w-full text-xs sm:text-sm !uppercase"
            size="sm"
            variant="outline"
            disabled={isProcessing || disabled}
          >
            {loadingButton === 'skip' ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing Payment...
              </div>
            ) : (
              'Skip Feedback & Pay'
            )}
          </Button>

          <Button
            onClick={handleSubmitAndPay}
            disabled={
              isProcessing ||
              disabled ||
              !productFeedback.some(feedback => feedback.rating > 0)
            }
            className="w-full text-xs sm:text-sm"
            size="sm"
          >
            {loadingButton === 'submit' ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing Payment...
              </div>
            ) : (
              'Submit Feedback & Pay'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFeedbackModal;
