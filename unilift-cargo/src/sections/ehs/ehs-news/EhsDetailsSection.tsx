'use client';

import React from 'react';
import { EhsNewsType } from '@/types/index.types';
import { formattedDate } from '@/lib';
import Link from 'next/link';
import ASSETS from '@/assets';
import PageBanner from '@/components/PageBanner';
import { AppRoutes } from '@/constants/AppRoutes';
import EhsNewsListingSection from './EhsNewsListingSection';
import Image from 'next/image';

interface EhsNewsDetailsProps {
  news: EhsNewsType;
}

const BREADCRUMBS = [
  { label: 'HOME', route: AppRoutes.HOME },
  { label: 'News Feed', route: AppRoutes.EHS_NEWS_DETAILS(1) }
] as const;

const EhsNewsDetails = ({ news }: EhsNewsDetailsProps) => {
  return (
    <div className="bg-gray-50 relative ">
      <PageBanner
        image={ASSETS.IMG.EHS_DETAILS_BANNER}
        pageHeading="News Feed"
        breadcrumbs={BREADCRUMBS}
      />

      {/* Main Content */}
      <div className="relative overflow-hidden">
        <div className="  w-full h-full  pointer-events-none ">
          <div className="absolute -left-32 top-44   rotate-90">
            <Image
              src={ASSETS.IMG.SAFEZY_TEXT}
              alt="Safety Text"
              height={512}
              width={512}
              className="w-[450px] h-auto"
              priority
            />
          </div>
          <div className="absolute right-0 top-56 translate-x-1/2 ">
            <Image
              src={ASSETS.IMG.HELMET}
              alt="Decorative Helmet"
              height={512}
              width={512}
              className="w-[550px] h-auto "
              priority
            />
          </div>
        </div>

        <div className="max-w-7xl px-4 sm:px-6 lg:px-8 py-6 bg-white border border-gray-300 rounded-xl  m-6 relative xl:mx-auto">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-6 md:gap-8 z-20 bg-white">
            {/* Content Section */}
            <div className="w-full lg:w-1/2 space-y-4 sm:space-y-6 bg-gray-100 rounded-xl border border-gray-300 shadow-lg p-6 sm:p-10 md:p-12 lg:p-14 z-20">
              <div className="text-sm text-gray-500 sm:text-sm">
                {formattedDate(news.created_at)}
              </div>

              <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                {news.title}
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700 text-base md:text-lg whitespace-pre-wrap leading-relaxed line-clamp-4">
                  {news.description}
                </p>
              </div>

              {news.preview_url && (
                <div>
                  <Link
                    href={news.preview_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  >
                    Read original article →
                  </Link>
                </div>
              )}
            </div>

            {/* Image Section */}
            <div className="w-full lg:w-1/2">
              <div className="aspect-[16/10] w-full relative">
                <Image
                  width={1024}
                  height={768}
                  src={news.image_url ?? ''}
                  alt={news.title ?? ''}
                  className="absolute inset-0 w-full h-full object-cover rounded-2xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="pb-10">
          <EhsNewsListingSection isFromListing={true} />
        </div>
      </div>
    </div>
  );
};

export default EhsNewsDetails;
