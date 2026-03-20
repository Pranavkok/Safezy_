import { SlashIcon } from '@radix-ui/react-icons';
import React from 'react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { BreadcrumbOptionsType } from '@/types/global.types';

type BreadcrumbOptionsPropType = {
  breadcrumbOptions?: BreadcrumbOptionsType;
  currentPageCSS?: string;
  otherPageCSS?: string;
};

export const NavigationBreadcrumbs = ({
  breadcrumbOptions,
  currentPageCSS,
  otherPageCSS
}: BreadcrumbOptionsPropType) => {
  return (
    <Breadcrumb>
      <BreadcrumbList className="uppercase text-[10px] lg:text-xs">
        {breadcrumbOptions &&
          breadcrumbOptions
            .slice(0, breadcrumbOptions.length - 1)
            .map(option => {
              return (
                <div className="flex items-center" key={option.label}>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      className={otherPageCSS}
                      href={option.route}
                      asChild
                    >
                      <Link href={option.route}>{option.label}</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>

                  <BreadcrumbSeparator>
                    <SlashIcon />
                  </BreadcrumbSeparator>
                </div>
              );
            })}

        {breadcrumbOptions && breadcrumbOptions.length > 0 && (
          <BreadcrumbItem>
            <BreadcrumbPage className={currentPageCSS}>
              {breadcrumbOptions[breadcrumbOptions.length - 1].label}
            </BreadcrumbPage>
          </BreadcrumbItem>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default NavigationBreadcrumbs;
