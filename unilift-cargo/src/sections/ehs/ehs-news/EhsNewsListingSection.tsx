'use client';

import React, { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, MoveRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getEhsNews } from '@/actions/admin/ehs/news';
import { Capacitor } from '@capacitor/core';
import Image from 'next/image';
const EhsNewsListingSection = ({
  isFromListing = false
}: {
  isFromListing?: boolean;
}) => {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ['ehsNews'],
    queryFn: async () => await getEhsNews(),
    refetchOnWindowFocus: false
  });

  const [api, setApi] = useState<CarouselApi>();

  const plugin = useRef(
    Autoplay({
      delay: 3000,
      stopOnInteraction: true
    })
  );

  const handleItemClick = (id: number) => {
    router.push(`/ehs-news/${id}`);
  };

  const ehsNews = data?.data;

  if (isLoading) return <EhsNewsSkeletonLoader isFromListing={isFromListing} />;
  if (!ehsNews || ehsNews?.length === 0) return null;

  const scrollPrev = () => api?.scrollPrev();
  const scrollNext = () => api?.scrollNext();

  return (
    <section
      className={`w-full  max-w-screen-3xl mx-auto ${isFromListing ? 'py-4' : 'py-8'}  `}
    >
      <div className="container mx-auto flex justify-center">
        <div
          className={
            Capacitor.isNativePlatform()
              ? 'w-[90%] relative'
              : 'relative select-none w-52  xs:w-64 sm:w-96 md:w-full'
          }
        >
          {!isFromListing && (
            <div className="w-full flex justify-center items-center mb-12">
              <p className="w-full text-center text-primary text-3xl font-bold leading-9  uppercase">
                Latest in the World of EHS
              </p>
            </div>
          )}
          <Carousel
            setApi={setApi}
            plugins={[plugin.current]}
            className="w-full"
            opts={{
              align: 'start',
              loop: true,
              slidesToScroll: 1
            }}
          >
            <CarouselContent className="-ml-4 bg-transparent">
              {ehsNews.map(item => (
                <CarouselItem
                  key={item.id}
                  className={`pl-4  ${
                    isFromListing
                      ? 'basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/6'
                      : 'md:basis-1/2 lg:basis-1/3 xl:basis-1/4'
                  }`}
                >
                  <div
                    onClick={() => handleItemClick(item.id)}
                    className="group cursor-pointer"
                  >
                    <Card
                      className={`h-full overflow-hidden transition-all duration-500 ease-in-out rounded-xl`}
                    >
                      <CardContent
                        className={`p-0 flex flex-col bg-transparent ${
                          isFromListing ? 'h-[250px]' : 'h-[250px] sm:h-[350px]'
                        }`}
                      >
                        <div
                          className={`relative overflow-hidden ${
                            isFromListing ? 'h-32' : 'h-32 sm:h-52'
                          }`}
                        >
                          <Image
                            width={1024}
                            height={768}
                            src={item.image_url ?? ''}
                            alt={item.title ?? ''}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 brightness-90"
                          />
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <h3
                            className={`font-bold line-clamp-1 text-gray-800 group-hover:text-primary ${
                              isFromListing
                                ? 'text-base'
                                : 'text-base xs:text-lg'
                            }`}
                          >
                            {item.title}
                          </h3>
                          <p
                            className={`text-gray-600 line-clamp-2 ${
                              isFromListing ? 'text-xs' : 'text-xs xs:text-sm'
                            }`}
                          >
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              Read More
                            </span>
                            <MoveRight className="w-5 h-5 opacity-0 group-hover:opacity-100 text-primary" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Custom Navigation */}
          {!Capacitor.isNativePlatform() && (
            <div className="absolute top-1/2 transform -translate-y-1/2 w-full flex justify-between">
              <button
                onClick={scrollPrev}
                className="bg-white/70 hover:bg-white shadow-md rounded-full p-3 -ml-6 transition-all"
              >
                <ChevronLeft className="text-gray-600" />
              </button>
              <button
                onClick={scrollNext}
                className="bg-white/70 hover:bg-white shadow-md rounded-full p-3 -mr-6 transition-all"
              >
                <ChevronRight className="text-gray-600" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// Skeleton Loader Component
const EhsNewsSkeletonLoader = ({
  isFromListing = false
}: {
  isFromListing?: boolean;
}) => {
  return (
    <section
      className={`w-full max-w-screen-3xl mx-auto px-4 ${isFromListing ? 'py-4' : 'py-8'}`}
    >
      <div className="container mx-auto">
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${
            isFromListing ? 'lg:grid-cols-6' : 'lg:grid-cols-4'
          } gap-6`}
        >
          {[...Array(isFromListing ? 6 : 4)].map((_, index) => (
            <div
              key={index}
              className="animate-pulse bg-white shadow-md rounded-xl overflow-hidden"
            >
              <div
                className={`${isFromListing ? 'h-32' : 'h-52'} bg-gray-300`}
              ></div>
              <div className="p-4 space-y-4">
                <div className="h-6 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="flex items-center justify-between">
                  <div className="h-3 bg-gray-300 rounded w-1/3"></div>
                  <div className="h-5 w-5 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EhsNewsListingSection;
