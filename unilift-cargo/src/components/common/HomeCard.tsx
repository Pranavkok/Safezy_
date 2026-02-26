import { cn } from '@/lib/utils';
import React from 'react';

interface Props {
  icon: React.ReactNode | string;
  title: string;
  descrition: string;
  CustomCSS?: string;
}

const HomeCard = ({ icon, title, descrition, CustomCSS }: Props) => {
  return (
    <div
      className={cn(
        'max-h-[409px] gap-4 min-h-[303px] flex flex-col justify-center items-center bg-[#FF914D] rounded-[8px] pt-8 px-5 pb-5',
        CustomCSS
      )}
    >
      <div className="h-[114px] flex items-center">{icon}</div>

      <p className="text-black text-[18px] font-bold leading-5 text-center">
        {title}
      </p>

      <p className="max-h-[160px] max-w-[361px] text-black text-[14px] font-normal leading-5 text-center line-clamp-[7] text-ellipsis">
        {descrition}
      </p>
    </div>
  );
};

export default HomeCard;
