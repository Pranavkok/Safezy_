import React from 'react';
import Sidebar from '@/components/sidebar/Sidebar';
import { AppRoutes } from '@/constants/AppRoutes';
import { SidebarMenuType } from '@/types/sidebar.types';
import { LayoutDashboard, ShieldCheck, AlertTriangle, FileText, Bell, ShoppingBag, Heart, HardHat } from 'lucide-react';

const MANAGER_SIDEBAR_MENU: SidebarMenuType = [
  {
    id: 1,
    title: 'Dashboard',
    icon: <LayoutDashboard size={18} />,
    route: AppRoutes.MANAGER_DASHBOARD
  },
  {
    id: 2,
    title: 'EHS Reports',
    icon: <ShieldCheck size={18} />,
    route: null,
    subMenu: [
      {
        id: 1,
        title: 'UA / UC / Near Miss',
        icon: <AlertTriangle size={18} />,
        route: AppRoutes.MANAGER_EHS_UA_UC_NEAR_MISS_LISTING
      },
      {
        id: 2,
        title: 'Incident Analysis',
        icon: <FileText size={18} />,
        route: AppRoutes.MANAGER_EHS_INCIDENT_ANALYSIS_LISTING
      }
    ]
  },
  {
    id: 3,
    title: 'Notifications',
    icon: <Bell size={18} />,
    route: AppRoutes.MANAGER_NOTIFICATION
  },
  {
    id: 4,
    title: 'Orders',
    icon: <ShoppingBag size={18} />,
    route: AppRoutes.MANAGER_ORDER_LISTING
  },
  {
    id: 5,
    title: 'Wishlist',
    icon: <Heart size={18} />,
    route: AppRoutes.MANAGER_WISHLIST
  },
  {
    id: 6,
    title: 'PPE Assignments',
    icon: <HardHat size={18} />,
    route: AppRoutes.MANAGER_PPE_ASSIGNMENTS
  }
] as const;

const ManagerDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Sidebar sidebarMenu={MANAGER_SIDEBAR_MENU} />
      <div className="min-h-screen flex flex-col pt-10 lg:py-10 lg:pr-10">
        <main className="relative flex-grow lg:ml-72 pt-10 px-4 pb-4 sm:p-10 bg-white rounded shadow-lg">
          {children}
        </main>
      </div>
    </>
  );
};

export default ManagerDashboardLayout;
