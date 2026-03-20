'use client';

import ASSETS from '@/assets';
import Image from 'next/image';
import { FirstPrinciplesType } from '@/types/index.types';
import { SecondaryLogo } from '@/components/svgs';

export const EHSFirstPrinciplesDetailsSection = ({
  principles
}: {
  principles: FirstPrinciplesType;
}) => {
  return (
    <div className="relative overflow-hidden">
      <div className="w-full h-full pointer-events-none">
        <div className="absolute -left-32 top-44 rotate-90">
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
            className="w-[550px] h-auto"
            priority
          />
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center w-full max-w-7xl mx-auto px-4 py-8 ">
        <div className="bg-white shadow-lg rounded-xl w-full p-6 sm:p-8 border border-gray-300 z-20">
          <div className="flex flex-col sm:flex-row justify-between items-center border-b-2 border-gray-300  pb-2 sm:pb-4 gap-3 sm:gap-0">
            <SecondaryLogo className="bg-primary pt-3 rounded sm:w-40 md:w-48 " />
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-black text-center sm:text-right">
              EHS First Principles
            </div>
          </div>

          {/* Title */}
          <div className="w-full text-center bg-primary text-white text-base sm:text-lg md:text-xl font-extrabold py-2 sm:py-3 mt-2 sm:mt-4 rounded-md px-2">
            {principles?.title?.toUpperCase()}
          </div>

          {/* Content Box */}
          {principles && (
            <div className="mt-6 p-6 bg-gray-100 border border-gray-300 rounded-lg">
              <div
                className="w-full prose break-words [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mt-4 [&>ul>li]:mb-2 [&>p.ql-align-center]:text-center [&>p]:my-2 [&>p>strong]:font-bold [&>p>em]:italic [&>.ql-size-large]:text-lg"
                dangerouslySetInnerHTML={{
                  __html: principles.description ?? ''
                }}
              />
            </div>
          )}

          {principles.image_url && (
            <div className="mt-6">
              <embed
                src={`${principles.image_url}#toolbar=0`}
                type="application/pdf"
                className="w-full h-[900px] rounded-lg"
                title="EHS First Principles PDF"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
