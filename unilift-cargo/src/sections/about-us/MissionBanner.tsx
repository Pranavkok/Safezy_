import React from 'react';
import ASSETS from '@/assets';
import Image from 'next/image';

const MissionBanner = () => {
  return (
    <div className="w-full relative ">
      <div className="absolute inset-0 w-full h-full bg-transparentBlack md:bg-transparent z-20"></div>
      <div className="relative w-full h-[32.9375rem]">
        <Image
          src={ASSETS.IMG.AboutUs_Mission}
          alt="mission"
          className="w-full z-10"
          fill
          priority
        />
      </div>

      <div className="z-30 flex flex-col md:gap-[.9375rem] gap-[1.0625rem] absolute top-1/2 transform -translate-y-1/2 text-white w-[81.45%] md:w-[59.44%] right-1/2 md:right-[80px] translate-x-1/2 md:translate-x-0">
        <h2 className="text-center md:text-start font-bold text-[1.875rem] leading-[2.2694rem] md:text-[44.0704px] md:leading-[53.3296px] ">
          OUR MISSION
        </h2>
        <p className="md:text-lg text-sm leading-7 text-center md:text-justify">
          Our mission is to ensure the safety and well-being of every worker by
          providing high-quality personal protective equipment (PPE) tailored to
          their needs. We empower agencies and contractors with smart tracking
          solutions to monitor inventory, renewals, expiry dates, and usage
          records. Our integrated EHS module offers tools like Toolbox Talks,
          Checklists, and Incident Analysis to promote workplace safety. We are
          committed to delivering reliable products, proactive safety insights,
          and exceptional service.
        </p>
      </div>
    </div>
  );
};

export default MissionBanner;
