import React from 'react';
import NavigationBreadcrumbs from '@/components/NavigationBreadcrumbs';
import Sidebar from '@/components/sidebar/Sidebar';
import { SidebarMenuType } from '@/types/sidebar.types';
import { BreadcrumbOptionsType } from '@/types/global.types';
import { DashboardIcon } from '@radix-ui/react-icons';

const WAREHOUSE_OPERATOR_SIDEBAR_MENU: SidebarMenuType = [
  {
    id: 1,
    title: 'Dashboard',
    icon: <DashboardIcon />,
    route: '/warehouse-operator/dashboard '
  }
] as const;

type WarehouseOperatorLayoutProps = {
  children: React.ReactNode;
  title: string;
  breadcrumbOptions?: BreadcrumbOptionsType;
};

const WarehouseOperatorDashboardLayout = ({
  children,
  title,
  breadcrumbOptions
}: WarehouseOperatorLayoutProps) => {
  return (
    <>
      <Sidebar sidebarMenu={WAREHOUSE_OPERATOR_SIDEBAR_MENU} />
      <div className="min-h-screen flex flex-col pt-10 lg:py-10 lg:pr-10 ">
        <main className="relative flex-grow lg:ml-72 pt-10 px-4 pb-4 sm:p-10 bg-white rounded shadow-lg ">
          <div className="px-4 flex  flex-col justify-center bg-background mb-4 h-14 lg:h-16 rounded">
            <h1 className="font-bold uppercase text-sm  lg:text-xl">{title}</h1>
            {breadcrumbOptions && breadcrumbOptions.length > 0 && (
              <NavigationBreadcrumbs breadcrumbOptions={breadcrumbOptions} />
            )}
          </div>

          <div className="w-full ">{children}</div>
        </main>
      </div>
    </>
  );
};

export default WarehouseOperatorDashboardLayout;
