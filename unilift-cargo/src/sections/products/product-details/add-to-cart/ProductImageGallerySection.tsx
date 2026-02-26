'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from '@/components/ui/carousel';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Maximize, Minimize } from 'lucide-react';

interface ProductImageGalleryProps {
  mainImage: string;
  images: string[];
  productName: string;
  productVideo?: string;
  handleFullScreen?: () => void;
  isFullScreen?: boolean;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  mainImage,
  images,
  productName,
  productVideo,
  handleFullScreen,
  isFullScreen = false
}) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState(mainImage);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Combine mainImage, additional images, and video
  const allMedia = useMemo(() => {
    const uniqueImages = images.filter(img => img !== mainImage);
    return productVideo
      ? [mainImage, ...uniqueImages, productVideo]
      : [mainImage, ...uniqueImages];
  }, [mainImage, images, productVideo]);

  // Initialize selected media when component mounts or media changes
  useEffect(() => {
    if (allMedia.length > 0) {
      setSelectedMedia(allMedia[0]);
      setCurrent(0);
    }
  }, [allMedia]);

  // Handle carousel selection changes
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      try {
        const selectedIndex = api.selectedScrollSnap();
        setCurrent(selectedIndex);
        setSelectedMedia(allMedia[selectedIndex]);
      } catch (error) {
        console.error('Error in select handler:', error);
      }
    };

    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api, allMedia]);

  // Handle media selection
  const handleSelectMedia = (index: number) => {
    if (index < 0 || index >= allMedia.length) return;

    setSelectedMedia(allMedia[index]);
    setIsVideoPlaying(false);
    if (api) api.scrollTo(index);
    setCurrent(index);
  };

  // Video controls
  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current
        .play()
        .then(() => setIsVideoPlaying(true))
        .catch(err => console.error('Error playing video:', err));
    }
  };

  const isVideo = selectedMedia === productVideo;

  // Check if we need to show navigation buttons
  const showNavigationButtons = allMedia.length > 3;

  // Memoized fullscreen button to avoid unnecessary rerenders
  const FullscreenButton = useMemo(() => {
    if (!handleFullScreen) return null;

    return (
      <Button
        type="button"
        variant="default"
        size="icon"
        className="absolute top-2 right-2 z-10"
        onClick={handleFullScreen}
        aria-label={isFullScreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      >
        {isFullScreen ? (
          <Minimize className="h-5 w-5 text-white" />
        ) : (
          <Maximize className="h-5 w-5 text-white" />
        )}
      </Button>
    );
  }, [handleFullScreen, isFullScreen]);

  // Display current slide number (1-based for user display)
  const displayCurrent = current + 1;
  const count = allMedia.length;

  return (
    <div
      className={`space-y-4 ${isFullScreen ? 'h-screen flex flex-col justify-center' : ''}`}
    >
      <div className="aspect-square rounded-xl overflow-hidden bg-white w-full ring-1 ring-gray-200 grid place-content-center relative">
        {!isVideo ? (
          <>
            <Image
              src={selectedMedia}
              alt={`${productName} - Selected Image`}
              width={1024}
              height={1024}
              className="w-full h-full object-contain object-center rounded transition-transform hover:scale-110 select-none pointer-events-none"
              priority
            />
            {FullscreenButton}
          </>
        ) : (
          <div className="relative">
            <video
              ref={videoRef}
              controls
              src={productVideo}
              className={`${isFullScreen ? 'max-h-[75vh] max-w-[90vw] h-auto' : 'w-full h-full'} object-contain`}
              onPlay={() => setIsVideoPlaying(true)}
              onPause={() => setIsVideoPlaying(false)}
              onEnded={() => setIsVideoPlaying(false)}
              controlsList="nodownload"
            >
              Your browser does not support the video tag.
            </video>
            {!isVideoPlaying && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/70 hover:bg-white"
                onClick={handlePlayVideo}
                aria-label="Play video"
              >
                <Play className="h-8 w-8 text-primary" />
              </Button>
            )}
            {FullscreenButton}
          </div>
        )}
      </div>

      <div className={isFullScreen ? 'max-w-xl mx-auto w-full h-[500px]' : ''}>
        <Carousel
          setApi={setApi}
          opts={{
            loop: true,
            align: 'center',
            slidesToScroll: 1
          }}
          className="w-full px-10"
        >
          <CarouselContent
            className={`-ml-1 py-4 mr-1 ${isFullScreen && 'px-2'} ${allMedia.length <= 3 && 'flex justify-center'} `}
          >
            {allMedia.map((media, index) => (
              <CarouselItem
                key={`${media}-${index}`}
                className={`pl-4 basis-1/3  ${isFullScreen && 'px-3'}`}
              >
                <Card
                  className={`cursor-pointer overflow-hidden hover:border-primary transition-all duration-300 relative ${
                    selectedMedia === media
                      ? 'border-2 border-primary scale-110'
                      : 'border opacity-70 hover:opacity-100'
                  }`}
                  onClick={() => handleSelectMedia(index)}
                >
                  <div className="aspect-square">
                    {media !== productVideo ? (
                      <Image
                        src={media}
                        alt={`${productName} - ${index + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-full object-contain rounded select-none pointer-events-none"
                      />
                    ) : (
                      <div className="w-full h-full relative ">
                        <video
                          src={productVideo}
                          className="w-full h-full object-contain"
                        >
                          Your browser does not support the video tag.
                        </video>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          {!isVideoPlaying && (
                            <Play className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          {showNavigationButtons && <CarouselPrevious className="left-0" />}
          {showNavigationButtons && <CarouselNext className="right-0" />}
        </Carousel>
        <div className="text-center text-sm text-gray-500">
          Slide {displayCurrent} of {count}
        </div>
      </div>
    </div>
  );
};

export default ProductImageGallery;
