import React from 'react';
import NavigationBreadcrumbs from '@/components/NavigationBreadcrumbs';
import { AppRoutes } from '@/constants/AppRoutes';
import Link from 'next/link';
import ContractorNotificationCount from '@/components/ContractorNotificationCount';
import PushNotificationSetup from '@/components/PushNotificationSetup';
import { BreadcrumbOptionsType } from '@/types/global.types';

type ContractorTopbarLayoutPropsType = {
  children: React.ReactNode;
  title: string;
  breadcrumbOptions?: BreadcrumbOptionsType;
};
const ContractorTopbarLayout = ({
  children,
  title,
  breadcrumbOptions
}: ContractorTopbarLayoutPropsType) => {
  return (
    <>
      <PushNotificationSetup />
      <div className="hidden lg:block absolute w-10 h-10 -top-4 -right-4 bg-gray-100 rounded-full">
        <Link
          href={AppRoutes.CONTRACTOR_NOTIFICATION}
          className="border-primary border rounded-full h-9 w-9 flex justify-center items-center cursor-pointer hover:bg-gray-50"
        >
          <ContractorNotificationCount />
        </Link>
      </div>
      <div className="px-4 flex flex-col justify-center bg-background mb-4 h-14 lg:h-16 rounded ">
        <h1 className="text-sm lg:text-xl font-bold uppercase">{title}</h1>
        {breadcrumbOptions && breadcrumbOptions.length > 0 && (
          <NavigationBreadcrumbs breadcrumbOptions={breadcrumbOptions} />
        )}
      </div>

      <div className="w-full">{children}</div>
    </>
  );
};

export default ContractorTopbarLayout;
