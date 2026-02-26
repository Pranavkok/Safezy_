import React from 'react';
import ASSETS from '@/assets';
import Image from 'next/image';
import Link from 'next/link';
import { AppRoutes } from '@/constants/AppRoutes';
import {
  Shield,
  Hand,
  Eye,
  Footprints,
  Wind,
  Smile,
  AlertTriangle
} from 'lucide-react';

const CATEGORIES = [
  {
    id: 1,
    title: 'Head Protection',
    icon: <Shield className="w-6 h-6" />,
    href: AppRoutes.PRODUCT_LISTING_HEAD
  },
  {
    id: 2,
    title: 'Hand Protection',
    icon: <Hand className="w-6 h-6" />,
    href: AppRoutes.PRODUCT_LISTING_HAND
  },
  {
    id: 3,
    title: 'Foot Protection',
    icon: <Footprints className="w-6 h-6" />,
    href: AppRoutes.PRODUCT_LISTING_LEG
  },
  {
    id: 4,
    title: 'Eye Protection',
    icon: <Eye className="w-6 h-6" />,
    href: AppRoutes.PRODUCT_LISTING_EYE
  },
  {
    id: 5,
    title: 'Face Protection',
    icon: <Smile className="w-6 h-6" />,
    href: AppRoutes.PRODUCT_LISTING_FACE
  },
  {
    id: 6,
    title: 'Fall Protection',
    icon: <AlertTriangle className="w-6 h-6" />,
    href: AppRoutes.PRODUCT_LISTING_FALL
  },
  {
    id: 7,
    title: 'Respiratory Protection',
    icon: <Wind className="w-6 h-6" />,
    href: AppRoutes.PRODUCT_LISTING_RESPIRATORY
  }
];

const ProductCategorySection = () => {
  return (
    <>
      <div className="lg:hidden p-4">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <p className="w-full text-center text-primary text-[30px] font-bold leading-9  uppercase">
              Product Categories
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map(category => (
              <Link
                key={category.id}
                href={category.href}
                className="overflow-hidden group rounded cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div
                  className={`bg-gradient-to-r from-primary to-primary p-2 xs:p-4`}
                >
                  <div className="flex items-center gap-2  ">
                    <div className="bg-white/20 rounded-lg p-2">
                      {React.cloneElement(category.icon, {
                        className: 'w-4 h-4 xs:w-6 xs:h-6 text-white'
                      })}
                    </div>
                    <h3 className="text-white font-medium  text-sm">
                      {category.title}
                    </h3>
                  </div>
                </div>
                <div className="px-4 py-3 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">
                      View Collection
                    </span>
                    <span className="text-xs text-gray-400 group-hover:translate-x-1 transition-transform duration-300">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="hidden lg:block relative overflow-hidden">
        <div className="  w-full h-full   pointer-events-none  ">
          <div className="absolute  top-5  flex justify-center items-center w-full   ">
            <Image
              src={ASSETS.IMG.SAFEZY_TEXT}
              alt="Safety Text"
              height={512}
              width={512}
              className="w-60 xs:w-96 lg:w-[750px] h-auto"
              priority
            />
          </div>
          <div className="absolute right-0 -bottom-32 translate-x-1/2 ">
            <Image
              src={ASSETS.IMG.HELMET}
              alt="Decorative Helmet"
              height={512}
              width={512}
              className="w-[550px] h-auto "
              priority
            />
          </div>
        </div>{' '}
        <div className="w-full flex justify-center items-center mt-16">
          <p className="w-full text-center text-primary text-[30px] font-bold leading-9  uppercase">
            Product Categories
          </p>
        </div>
        <div className="w-full p-[2.2188rem] md:p-5 ">
          <div className="w-full p-[2.2188rem] md:p-5">
            <div className="w-full flex md:flex-row flex-col items-center md:items-start justify-center gap-5 mt-8">
              {/* First Column */}
              <div className="flex flex-col gap-[1.8125rem] md:gap-5 w-full md:w-fit items-center">
                {/* Head Protection */}
                <Link href={AppRoutes.PRODUCT_LISTING_HEAD} className="w-full">
                  <div className="relative w-full md:w-[28.402vw] md:max-w-[25.5625rem] group overflow-hidden rounded-[8px]">
                    <div className="absolute inset-0 w-full h-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"></div>
                    <Image
                      src={ASSETS.IMG.HEAD_PROTECTION}
                      alt="Product Category"
                      className="w-full h-full rounded-[8px] z-10 transition-transform duration-500 group-hover:scale-105"
                      priority
                    />
                    <div className="absolute z-30 w-full bottom-0 left-0 p-4 bg-gradient-to-t  bg-primary">
                      <div className="transform transition-all duration-300 ">
                        <p className="text-white text-center font-bold uppercase tracking-wider text-xl md:text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
                          Head Protection
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Hand Protection */}
                <Link href={AppRoutes.PRODUCT_LISTING_HAND}>
                  <div className="relative w-full md:w-[28.4vw] md:max-w-[25.5625rem] group overflow-hidden rounded-[8px]">
                    <div className="absolute inset-0 w-full h-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"></div>
                    <Image
                      src={ASSETS.IMG.HAND_PROTECTION}
                      alt="Product Category"
                      className="w-full h-full rounded-[8px] z-10 transition-transform duration-500 group-hover:scale-105"
                      priority
                    />
                    <div className="absolute z-30 w-full bottom-0 left-0 p-4 bg-gradient-to-t  bg-primary">
                      <div className="transform transition-all duration-300 ">
                        <p className="text-white text-center font-bold uppercase tracking-wider text-xl md:text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
                          Hand Protection
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Second Column */}
              <div className="flex flex-col gap-[1.8125rem] md:gap-[1.875rem] w-full md:w-fit">
                {/* Foot Protection */}
                <Link href={AppRoutes.PRODUCT_LISTING_LEG}>
                  <div className="relative w-full md:w-[33.3vw] md:max-w-[29.9375rem] group overflow-hidden rounded-[8px]">
                    <div className="absolute inset-0 w-full h-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"></div>
                    <Image
                      src={ASSETS.IMG.FOOT_PROTECTION}
                      alt="Product Category"
                      className="w-full h-full rounded-[8px] z-10 transition-transform duration-500 group-hover:scale-105"
                      priority
                    />
                    <div className="absolute z-30 w-full bottom-0 left-0 p-4 bg-gradient-to-t  bg-primary">
                      <div className="transform transition-all duration-300 ">
                        <p className="text-white text-center font-bold uppercase tracking-wider text-xl md:text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
                          Foot Protection
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Fall Protection */}
                <Link href={AppRoutes.PRODUCT_LISTING_FALL}>
                  <div className="relative w-full md:w-[33.5vw] md:max-w-[30.125rem] group overflow-hidden rounded-[8px]">
                    <div className="absolute inset-0 w-full h-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"></div>
                    <Image
                      src={ASSETS.IMG.FALL_PROTECTION}
                      alt="Product Category"
                      className="w-full h-full rounded-[8px] z-10 transition-transform duration-500 group-hover:scale-105"
                      priority
                    />
                    <div className="absolute z-30 w-full bottom-0 left-0 p-4 bg-gradient-to-t  bg-primary">
                      <div className="transform transition-all duration-300 ">
                        <p className="text-white text-center font-bold uppercase tracking-wider text-xl md:text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
                          Fall Protection
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Third Column */}
              <div className="flex flex-col gap-[1.8125rem] md:gap-[1.625rem] w-full md:w-fit">
                {/* Eye Protection */}
                <Link href={AppRoutes.PRODUCT_LISTING_EYE}>
                  <div className="relative w-full md:w-[28.3vw] md:max-w-[25.5625rem] group overflow-hidden rounded-[8px]">
                    <div className="absolute inset-0 w-full h-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"></div>
                    <Image
                      src={ASSETS.IMG.EYE_PROTECTION}
                      alt="Product Category"
                      className="w-full h-full rounded-[8px] z-10 transition-transform duration-500 group-hover:scale-105"
                      priority
                    />
                    <div className="absolute z-30 w-full bottom-0 left-0 p-4 bg-gradient-to-t  bg-primary">
                      <div className="transform transition-all duration-300 ">
                        <p className="text-white text-center font-bold uppercase tracking-wider text-xl md:text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
                          Eye Protection
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Face Protection */}
                <Link href={AppRoutes.PRODUCT_LISTING_FACE}>
                  <div className="relative w-full md:w-[28.3vw] md:max-w-[25.5625rem] group overflow-hidden rounded-[8px]">
                    <div className="absolute inset-0 w-full h-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"></div>
                    <Image
                      src={ASSETS.IMG.FACE_PROTECTION}
                      alt="Product Category"
                      className="w-full h-full rounded-[8px] z-10 transition-transform duration-500 group-hover:scale-105"
                      priority
                    />
                    <div className="absolute z-30 w-full bottom-0 left-0 p-4 bg-gradient-to-t  bg-primary">
                      <div className="transform transition-all duration-300 ">
                        <p className="text-white text-center font-bold uppercase tracking-wider text-xl md:text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
                          Face Protection
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Respiratory Protection */}
                <Link href={AppRoutes.PRODUCT_LISTING_RESPIRATORY}>
                  <div className="relative w-full md:w-[28.3vw] md:max-w-[25.5625rem] group overflow-hidden rounded-[8px]">
                    <div className="absolute inset-0 w-full h-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"></div>
                    <Image
                      src={ASSETS.IMG.RESPIRATION_PROTECTION}
                      alt="Product Category"
                      className="w-full h-full rounded-[8px] z-10 transition-transform duration-500 group-hover:scale-105"
                      priority
                    />
                    <div className="absolute z-30 w-full bottom-0 left-0 p-4 bg-gradient-to-t  bg-primary">
                      <div className="transform transition-all duration-300 ">
                        <p className="text-white text-center font-bold uppercase tracking-wider text-xl md:text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">
                          Respiratory Protection
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductCategorySection;
