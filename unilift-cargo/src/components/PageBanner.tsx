'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import NavigationBreadcrumbs from '@/components/NavigationBreadcrumbs';
import type { StaticImageData } from 'next/image';
import { BreadcrumbOptionsType } from '@/types/global.types';

type PageBannerPropsType = {
  image: StaticImageData;
  pageHeading: string;
  breadcrumbs?: BreadcrumbOptionsType;
  className?: string;
};

const PageBanner = ({
  image,
  pageHeading,
  breadcrumbs,
  className
}: PageBannerPropsType) => {
  return (
    <div className="relative">
      {/* Image with overlay */}
      <div className="relative h-48 md:h-56">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10" />
        <Image
          src={image}
          alt={pageHeading}
          className={cn('w-full h-full object-cover', className)}
          priority
        />
      </div>

      {/* Content */}
      <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 md:px-16">
        <h1 className="text-2xl md:text-4xl font-bold text-white">
          {pageHeading}
        </h1>

        {breadcrumbs && breadcrumbs.length > 0 && (
          <NavigationBreadcrumbs
            breadcrumbOptions={breadcrumbs}
            otherPageCSS="text-white"
          />
        )}
      </div>
    </div>
  );
};

export default PageBanner;
