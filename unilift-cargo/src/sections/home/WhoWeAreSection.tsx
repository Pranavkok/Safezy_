'use client';
import React from 'react';
import ASSETS from '@/assets';
import Image from 'next/image';

import { Capacitor } from '@capacitor/core';

const WhoWeAreSection = () => {
  if (Capacitor.getPlatform() === 'web') {
    return (
      <div className="relative flex justify-center items-center w-full h-full mt-5">
        <Image
          src={ASSETS.IMG.WHO_WE_ARE}
          alt="Product Category"
          className="min-h-[349px] w-full h-full sm:object-cover sm:object-center  "
          priority
        />
        <div className="absolute lg:left-14 mx-5">
          <div className="w-full sm:min-h-[200px] flex sm:flex-row flex-col gap-2">
            <div className=" sm:min-w-[236px] sm:max-w-[348px] flex flex-col justify-center items-center sm:justify-start sm:items-start">
              <p
                className="text-[80px] text-left leading-[80px] font-extrabold uppercase"
                style={{
                  color: 'transparent',
                  WebkitTextStroke: '2px white',
                  fontFamily: '"Arial Black", sans-serif'
                }}
              >
                WHO
              </p>

              <p className="text-white text-6xl font-extrabold leading-[63px] md:w-max">
                WE ARE
              </p>
            </div>

            <div className="w-full flex justify-center items-center  flex-col sm:flex-row sm:items-start md:gap-5">
              <Image
                src={ASSETS.IMG.PATENT_PROTECTED_ICON}
                alt="Product Category"
                className="w-[172px] h-[156px] hidden md:block"
              />
              <p className="text-white h-full text-center sm:text-left text-[13px] lg:text-[20px] font-normal leading-4 lg:leading-6">
                At Safezy, we specialize in providing high-quality Personal
                Protective Equipment (PPE) to ensure the safety and well-being
                of your workforce. Our platform allows you to efficiently manage
                your PPE inventory, track equipment usage, monitor expiration
                and renewal dates, and see who is using each item. With a
                seamless tracking system, you can ensure compliance and safety
                at every step, keeping your team protected.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default WhoWeAreSection;
