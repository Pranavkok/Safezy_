import React from 'react';
import Sidebar from '@/components/sidebar/Sidebar';
import { AppRoutes } from '@/constants/AppRoutes';
import { SidebarMenuType } from '@/types/sidebar.types';
import {
  LayoutDashboard,
  Package,
  HardHat,
  MapPin,
  Users,
  ClipboardList
} from 'lucide-react';

const CONTRACTOR_SIDEBAR_MENU: SidebarMenuType = [
  {
    id: 1,
    title: 'Dashboard',
    icon: <LayoutDashboard size={18} />,
    route: AppRoutes.CONTRACTOR_DASHBOARD
  },
  {
    id: 2,
    title: 'Orders',
    icon: <Package size={18} />,
    route: AppRoutes.CONTRACTOR_ORDER_LISTING
  },
  {
    id: 3,
    title: 'Equipments',
    icon: <HardHat size={18} />,
    route: AppRoutes.CONTRACTOR_EQUIPMENT_LISTING
  },
  {
    id: 4,
    title: 'Worksites',
    icon: <MapPin size={18} />,
    route: AppRoutes.CONTRACTOR_WORKSITE_LISTING
  },
  {
    id: 5,
    title: 'Employees',
    icon: <Users size={18} />,
    route: AppRoutes.CONTRACTOR_EMPLOYEE_LISTING
  },
  {
    id: 7,
    title: 'Assignments',
    icon: <ClipboardList size={18} />,
    route: AppRoutes.CONTRACTOR_ASSIGNMENTS
  }
] as const;

const ContractorDashboardLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return (
    <>
      <Sidebar sidebarMenu={CONTRACTOR_SIDEBAR_MENU} />
      <div className="min-h-screen flex flex-col pt-10 lg:py-10 lg:pr-10">
        <main className="relative flex-grow lg:ml-72 pt-10 px-4 pb-4 sm:p-10 bg-white rounded shadow-lg h-full">
          {children}
        </main>
      </div>
    </>
  );
};

export default ContractorDashboardLayout;
