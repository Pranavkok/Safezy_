import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Dispatch, SetStateAction, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { ProductWithPriceAndImagesType } from '@/types/index.types';
import { PackageCheck } from 'lucide-react';
import { ProductSizeType } from '@/sections/products/product-details/add-to-cart/ProductVariantSection';

export type ProductFormValues = {
  quantity: number;
  size: string;
  color: string;
};

type FetchOffersForProductsPropsType = {
  productDetails: ProductWithPriceAndImagesType;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};
const FetchOffersForProducts = ({
  productDetails,
  isOpen,
  setIsOpen
}: FetchOffersForProductsPropsType) => {
  const { getValues, reset } = useFormContext();
  const [loading, setLoading] = useState(false);
  const { price_tiers, size = [] as { id: string; size: string }[] } =
    productDetails;
  const productSizes = (size as ProductSizeType[]) || [];

  const { addItemToCart } = useCart();
  const selectedQuantity = getValues('quantity');
  const selectedColor = getValues('color');
  const selectedSize = getValues('size');

  const selectedTier = price_tiers.find(
    tier =>
      selectedQuantity >= tier.min_quantity &&
      selectedQuantity <= tier.max_quantity
  );
  const selectedPrice = selectedTier ? selectedTier.price : 0;
  const nextHigherTier = price_tiers.find(
    tier => selectedQuantity < tier.min_quantity
  );
  const nextHigherPrice = nextHigherTier ? nextHigherTier.price : 0;
  const nextTierDifference = nextHigherTier
    ? nextHigherTier.min_quantity - getValues('quantity')
    : 0;

  const onSubmit = async () => {
    setLoading(true);
    const priceTiers = price_tiers.map(data => ({
      minQuantity: data.min_quantity,
      maxQuantity: data.max_quantity,
      price: data.price
    }));

    await addItemToCart({
      color: selectedColor,
      quantity: selectedQuantity,
      productId: productDetails.id,
      size: productSizes.find(s => s.id === selectedSize)?.size || selectedSize,
      priceTiers: priceTiers
    });

    reset({
      size: '',
      color: '',
      quantity: 0
    });
    setLoading(false);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="max-w-md bg-white"
        onInteractOutside={e => e.preventDefault()}
      >
        <DialogHeader className="mb-6">
          <DialogTitle className="flex items-center  gap-2 text-2xl">
            <PackageCheck className="h-6 w-6 text-primary" />
            Bulk Discount Available!
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={() => onSubmit()} className="space-y-6">
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="text-foreground">
                  Current price:{' '}
                  <span className="font-bold">₹{selectedPrice}</span> per unit.
                </div>

                {nextTierDifference > 0 && (
                  <div className="text-foreground">
                    Buy{' '}
                    <span className="font-bold">
                      {nextTierDifference} more{' '}
                      {nextTierDifference === 1 ? 'item' : 'items'}
                    </span>{' '}
                    and reduce your price from{' '}
                    <span className="font-bold">₹{selectedPrice}</span> to{' '}
                    <span className="font-bold">₹{nextHigherPrice}</span> per
                    unit.{' '}
                  </div>
                )}
                <p className="text-primary font-medium mt-2">
                  Save big with bulk orders!
                </p>
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="justify-center sm:justify-end mt-2 gap-2">
            <DialogClose asChild>
              <Button
                className="h-9  bg-white"
                variant="outline"
                disabled={loading}
              >
                Let me Add More{' '}
              </Button>
            </DialogClose>

            <Button
              type="submit"
              className="text-sm capitalize h-9 "
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <span className="loader mr-2" /> Adding...
                </span>
              ) : (
                'Continue to Cart'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FetchOffersForProducts;
