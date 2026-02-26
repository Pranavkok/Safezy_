import React from 'react';
import ASSETS from '@/assets';
import Image from 'next/image';
import Link from 'next/link';
import { AppRoutes } from '@/constants/AppRoutes';

const DiscountSection = () => {
  return (
    <div className="relative w-full h-full mt-10 flex justify-center items-center">
      <div className="relative min-h-[344px] w-full">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent z-10"></div>

        {/* Large Screen Image */}
        <Image
          src={ASSETS.IMG.DISCOUNTED}
          width={1024}
          height={768}
          style={{ width: '100%', height: '100%' }}
          alt="Product Category"
          className="hidden sm:block min-h-[344px] w-full h-full object-cover object-center"
          priority
        />

        {/* Small Screen Image */}
        <Image
          src={ASSETS.IMG.SMALL_DISCOUNTED}
          alt="Product Category"
          className="sm:hidden h-[344px] w-full object-cover object-center"
          priority
        />
      </div>

      <div className="absolute left-9 sm:left-14 z-[10]">
        <div className="flex flex-col">
          <p
            className="text-5xl sm:text-7xl text-left leading-[80px] font-extrabold uppercase"
            style={{
              color: 'transparent',
              WebkitTextStroke: '2px white',
              fontFamily: '"Arial Black", sans-serif'
            }}
          >
            DISCOUNT
          </p>
          <p className="text-white text-4xl sm:text-6xl font-extrabold leading-[63px]">
            On Bulk PPE
          </p>
          <Link href={AppRoutes.PRODUCT_LISTING}>
            <button className="max-w-[124px] bg-[#FF914D] text-white font-semibold !text-[14px] leading-4 px-4 py-2 rounded-[50px] mt-4">
              SHOP NOW
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DiscountSection;
