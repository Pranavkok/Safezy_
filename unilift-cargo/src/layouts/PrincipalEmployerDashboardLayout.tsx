import React from 'react';
import { AppRoutes } from '@/constants/AppRoutes';
import { SidebarMenuType } from '@/types/sidebar.types';
import { cookies } from 'next/headers';
import Sidebar from '@/components/sidebar/Sidebar';
import {
  LayoutDashboard,
  Package,
  Users,
  Briefcase,
  ClipboardList
} from 'lucide-react';

const getPrincipalEmployerSidebarMenu = (uniqueCode: string): SidebarMenuType =>
  [
    {
      id: 1,
      title: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
      route: `${AppRoutes.PRINCIPAL_EMPLOYER_DASHBOARD}`
    },
    {
      id: 2,
      title: 'Orders',
      icon: <Package size={18} />,
      route: `${AppRoutes.PRINCIPAL_EMPLOYER_ORDER_LISTING}?uniqueCode=${uniqueCode}`
    },
    {
      id: 3,
      title: 'Equipments',
      icon: <Briefcase size={18} />,
      route: `${AppRoutes.PRINCIPAL_EMPLOYER_EQUIPMENT_LISTING}?uniqueCode=${uniqueCode}`
    },
    {
      id: 4,
      title: 'Employees',
      icon: <Users size={18} />,
      route: `${AppRoutes.PRINCIPAL_EMPLOYER_EMPLOYEE_LISTING}?uniqueCode=${uniqueCode}`
    },
    {
      id: 5,
      title: 'Assignments',
      icon: <ClipboardList size={18} />,
      route: `${AppRoutes.PRINCIPAL_EMPLOYER_ASSIGNMENTS}?uniqueCode=${uniqueCode}`
    }
  ] as const;

type PrincipalEmployerDashboardLayoutProps = {
  children: React.ReactNode;
};
const PrincipalEmployerDashboardLayout = ({
  children
}: PrincipalEmployerDashboardLayoutProps) => {
  const cookieStore = cookies();
  const uniqueCode = cookieStore.get('uniqueCode')?.value ?? '';

  const PRINCIPAL_EMPLOYER_SIDEBAR_MENU =
    getPrincipalEmployerSidebarMenu(uniqueCode);

  return (
    <>
      <Sidebar sidebarMenu={PRINCIPAL_EMPLOYER_SIDEBAR_MENU} />
      <div className="min-h-screen flex flex-col pt-10 lg:py-10 lg:pr-10">
        <main className="relative flex-grow lg:ml-72 pt-10 px-4 pb-4 sm:p-10 bg-white rounded shadow-lg">
          {children}
        </main>
      </div>
    </>
  );
};

export default PrincipalEmployerDashboardLayout;
