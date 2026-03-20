'use client';

import { useEffect, useState } from 'react';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { cn } from '@/lib/utils';
import Image, { StaticImageData } from 'next/image';
import ASSETS from '@/assets';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Capacitor } from '@capacitor/core';

export type ImageDataProps = {
  id: string;
  img: string | StaticImageData;
  title: string;
  description: string;
  buttons?: {
    name: string;
    url: string;
  }[];
  isComing?: boolean;
};

interface Props {
  imageArray: ImageDataProps[];
  delayAmount?: number;
  loop?: boolean;
  dotsCss?: string;
}

const CarouselComponent = ({
  imageArray,
  loop = true,
  delayAmount = 6000,
  dotsCss = ''
}: Props) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });

    api.on('settle', () => {
      resetAutoplay();
    });
  }, [api]);

  // Function to reset the autoplay timer
  const resetAutoplay = () => {
    if (api && api.plugins().autoplay) {
      api.plugins().autoplay.reset();
    }
  };

  const handleDotClick = (index: number) => {
    if (api) {
      api.scrollTo(index);
      resetAutoplay(); // Reset timer on dot click
    }
  };

  // Custom navigation handlers to reset autoplay
  const handlePrevious = () => {
    if (api) {
      api.scrollPrev();
      resetAutoplay(); // Reset timer on previous click
    }
  };

  const handleNext = () => {
    if (api) {
      api.scrollNext();
      resetAutoplay(); // Reset timer on next click
    }
  };

  return (
    <Carousel
      setApi={setApi}
      opts={{
        align: 'center',
        loop: loop,
        watchDrag: true,
        dragFree: false
      }}
      plugins={[
        Autoplay({
          delay: delayAmount,
          stopOnInteraction: false // Don't stop on interaction, we'll handle the reset
        })
      ]}
      className="w-full max-h-[823px] relative group"
    >
      <CarouselContent>
        {imageArray.map(item => (
          <CarouselItem
            key={item.id}
            className="flex items-center justify-center relative w-full select-none"
          >
            <div className="relative w-full bg-black">
              <Image
                src={item.img}
                alt="Carousel image"
                width={4000}
                height={2000}
                className={cn(
                  'object-cover object-top z-0 w-full',
                  'h-[420px]   xsm:h-[823px]'
                )}
                priority
              />

              <Image
                src={ASSETS.IMG.LANDING_SAFEZY}
                alt="Shadow overlay"
                className="absolute top-16 left-16 z-50 hidden lg:block "
                priority
              />

              <div className="absolute inset-0 flex justify-center top-5 z-20 lg:hidden">
                <Image
                  src={ASSETS.IMG.LANDING_SAFEZY}
                  alt="Shadow overlay"
                  className="absolute  w-4/5 lg:w-96  "
                  priority
                />
              </div>

              <div className="absolute top-0 left-0 w-full inset-0 z-10 bg-gradient-to-r from-black to-transparent" />
              <div
                className={cn(
                  'absolute z-20 transform -translate-y-1/2 text-white',
                  'px-12 sm:px-20 md:px-[65px] top-1/2 w-full',
                  'flex flex-col items-center sm:items-start'
                )}
              >
                <h2
                  className={cn(
                    'font-extrabold text-center sm:text-left',
                    'text-2xl sm:text-3xl md:text-6xl'
                  )}
                >
                  {item.title}
                </h2>

                <p
                  className={cn(
                    'mt-2 font-medium w-full max-w-[471px]',
                    'text-sm sm:text-base md:text-xl text-center sm:text-left'
                  )}
                >
                  {item.description}
                </p>

                {item.buttons && (
                  <div
                    className={cn('mt-4 flex gap-3', 'flex-col sm:flex-row')}
                  >
                    {item.buttons.map((button, idx) =>
                      button.url.startsWith('#') ? (
                        <Button
                          key={idx}
                          onClick={() => {
                            const element = document.getElementById(
                              button.url.substring(1)
                            );
                            if (element) {
                              // For Capacitor, we need a different approach than direct window.scrollTo
                              if (Capacitor.isNativePlatform()) {
                                // Option 1: Use Capacitor's Plugin approach if available
                                // Some plugins like @capacitor/keyboard provide scrollTo functionality
                                element.scrollIntoView({
                                  behavior: 'smooth',
                                  block: 'start'
                                });
                              } else {
                                // For web browsers, continue using the original approach
                                const yOffset = -40;
                                const y =
                                  element.getBoundingClientRect().top +
                                  window.scrollY +
                                  yOffset;
                                window.scrollTo({ top: y, behavior: 'smooth' });
                              }
                            }
                          }}
                          className={cn(
                            'bg-primary text-white font-semibold rounded-full capitalize',
                            'px-4 py-2 w-full sm:w-auto',
                            'flex items-center justify-center',
                            'h-full',
                            'cursor-pointer',
                            'text-sm sm:text-[14px]'
                          )}
                        >
                          <span className="pointer-events-none">
                            {button.name}
                          </span>
                        </Button>
                      ) : (
                        <Link key={idx} href={button.url}>
                          <button
                            className={cn(
                              'bg-primary text-white font-semibold rounded-full',
                              'px-4 py-2 w-full sm:w-auto',
                              'text-sm sm:text-[14px]'
                            )}
                          >
                            {button.name}
                          </button>
                        </Link>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      <div
        className={cn(
          ' absolute bottom-4 sm:bottom-10  w-full items-center justify-center gap-4',
          dotsCss
        )}
      >
        {Array.from({ length: count }).map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={cn(
              'h-4 w-4 rounded-full transition-all duration-300 cursor-pointer',
              'border border-white hover:scale-110',
              index === current - 1
                ? 'bg-[#FF914D] scale-110'
                : 'bg-transparent hover:bg-white/50'
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <div className="absolute top-0 left-0 w-full h-full z-30 pointer-events-none">
        <div className="relative h-full">
          <div className="absolute top-1/2 -translate-y-1/2 w-full flex items-center justify-between px-12">
            <div className="pointer-events-auto">
              <CarouselPrevious
                onClick={handlePrevious}
                className="relative h-16 w-16 bg-transparent hover:bg-transparent border-none [&_svg]:size-10 sm:[&_svg]:size-16"
              >
                <ChevronLeft className="h-16 w-16 text-white" />
              </CarouselPrevious>
            </div>

            <div className="pointer-events-auto">
              <CarouselNext
                onClick={handleNext}
                className="relative h-16 w-16 bg-transparent hover:bg-transparent border-none [&_svg]:size-10 sm:[&_svg]:size-16"
              >
                <ChevronRight className="h-8 w-8 text-white" />
              </CarouselNext>
            </div>
          </div>
        </div>
      </div>
    </Carousel>
  );
};

export default CarouselComponent;
