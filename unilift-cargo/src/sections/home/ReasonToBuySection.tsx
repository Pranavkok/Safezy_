'use client';

import React from 'react';
import TropiIcon from '@/components/svgs/TropiIcon';
import HomeCard from '@/components/common/HomeCard';
import TrackingIcon from '@/components/svgs/TrackingIcon';
import BadgeIcon from '@/components/svgs/BadgeIcon';
import { Capacitor } from '@capacitor/core';

const ReasonToBuySection = () => {
  if (Capacitor.getPlatform() === 'web') {
    return (
      <div className="w-full flex gap-5 flex-col mt-10">
        <div className="w-full flex justify-center items-center">
          <p className="w-full text-center text-[#FF914D] text-[30px] font-bold leading-9 uppercase">
            Reason to buy
          </p>
        </div>

        <div
          className={`flex flex-col md:flex-row gap-7 items-center justify-center p-[2.2188rem] md:p-5`}
        >
          <HomeCard
            icon={<TropiIcon />}
            title=" Trusted PPE Provider"
            descrition="With decades of experience, we’ve been a trusted name in safety solutions providers, ensuring your safety with quality equipment that meets all industry standards."
            CustomCSS="h-[303px] md:h-[409px] lg:h-[320px] xl:h-[303px] "
          />

          <HomeCard
            icon={<BadgeIcon />}
            title="Unmatched Quality & Assurance"
            descrition="Our PPE kits come with a safety guarantee, crafted to provide maximum protection and meet all your safety needs, no matter the work environment."
            CustomCSS="h-[320px] md:h-[409px] lg:h-[320px] xl:h-[303px] "
          />

          <HomeCard
            icon={<TrackingIcon />}
            title="Comprehensive PPE Tracking"
            descrition="Customers can track their equipment, monitor renewal and expiration dates, manage PPE inventory, and see who is using each item, ensuring safety compliance and efficient inventory management."
            CustomCSS="h-[350px] md:h-[409px] lg:h-[320px] xl:h-[303px] "
          />
        </div>
      </div>
    );
  }

  return <></>;
};

export default ReasonToBuySection;
