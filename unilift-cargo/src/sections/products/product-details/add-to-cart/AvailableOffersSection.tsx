import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';

interface PriceQuantityCardProps {
  max_quantity: number | string;
  min_quantity: number;
  price: number;
}

const PriceQuantityCard = ({
  price,
  max_quantity,
  min_quantity
}: PriceQuantityCardProps) => (
  <Card className="min-w-40 text-black border-primary bg-primary/10 flex-shrink-0 select-none">
    <CardContent className="p-2 sm:p-4">
      <div className="flex flex-col h-full justify-between space-y-2">
        <p className="text-xs sm:text-sm font-medium text-center">
          {min_quantity}
          {typeof max_quantity === 'string'
            ? ` ${max_quantity}`
            : ` - ${max_quantity}`}
        </p>
        <div className="border-primary border-t border-dashed pt-2">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-lg sm:text-xl font-bold">₹{price}</span>
            <span className="text-xs sm:text-sm">/item</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const AvailableOffersSection = ({
  quantityRanges
}: {
  quantityRanges: PriceQuantityCardProps[];
}) => {
  const [canScroll, setCanScroll] = useState(false);
  const [api, setApi] = useState<CarouselApi | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Check if content is scrollable
  const checkScrollAbility = () => {
    if (contentRef.current && api) {
      const containerWidth = contentRef.current.clientWidth;
      const contentWidth = contentRef.current.scrollWidth;
      setCanScroll(contentWidth > containerWidth);
    }
  };

  // Update scroll state when carousel API is available
  useEffect(() => {
    if (!api) return;

    checkScrollAbility();

    // Check again after window resize
    window.addEventListener('resize', checkScrollAbility);

    return () => {
      window.removeEventListener('resize', checkScrollAbility);
    };
  }, [api]);

  return (
    <div className="space-y-4">
      <label htmlFor="offers">Available Offers</label>
      <Carousel
        opts={{
          align: 'start',
          dragFree: false,
          loop: false
        }}
        className={`w-full ${canScroll && 'px-10'}`}
        setApi={setApi}
      >
        <CarouselContent className="gap-2 -ml-2" ref={contentRef}>
          {quantityRanges.slice(0, quantityRanges.length - 1).map((item, i) => (
            <CarouselItem key={item.price + i} className="pl-2 basis-auto">
              <PriceQuantityCard {...item} />
            </CarouselItem>
          ))}

          <CarouselItem key={quantityRanges.length} className="pl-2 basis-auto">
            <PriceQuantityCard
              price={quantityRanges[quantityRanges.length - 1]?.price}
              min_quantity={
                quantityRanges[quantityRanges.length - 1]?.min_quantity
              }
              max_quantity={'Onwards'}
            />
          </CarouselItem>
        </CarouselContent>

        {canScroll && (
          <>
            <CarouselPrevious className="h-8 w-8 left-0 flex items-center justify-center bg-white shadow-md rounded-full border border-gray-200 hover:bg-gray-50 hover:border-primary transition-colors" />
            <CarouselNext className="h-8 w-8 right-0 flex items-center justify-center bg-white shadow-md rounded-full border border-gray-200 hover:bg-gray-50 hover:border-primary transition-colors" />
          </>
        )}
      </Carousel>
    </div>
  );
};

export default AvailableOffersSection;
