'use client';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

const IconContainer = ({
  Icon,
  Name,
  NavigateTo
}: {
  Icon: React.ReactNode;
  Name: string;
  NavigateTo: string;
}) => {
  const pathName = usePathname();
  const route = useRouter();
  return (
    <button
      className={`h-[100%] w-1/2 flex flex-col items-center justify-center  ${pathName === NavigateTo && 'text-primary'}`}
      onClick={() => {
        route.push(NavigateTo);
      }}
    >
      {Icon}
      {Name}
    </button>
  );
};

export default IconContainer;
