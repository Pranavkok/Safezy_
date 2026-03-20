'use client';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

const BackButtonHeader = () => {
  const router = useRouter();
  return (
    <div
      className="h-full w-[4.25rem] aspect-square bg-white flex justify-center items-center hover:bg-slate-50 cursor-pointer"
      onClick={() => {
        router.back();
      }}
    >
      <ChevronLeft />
    </div>
  );
};

export default BackButtonHeader;
