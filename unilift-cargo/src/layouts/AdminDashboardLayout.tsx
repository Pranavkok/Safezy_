import React from 'react';
import Sidebar from '@/components/sidebar/Sidebar';
import { AppRoutes } from '@/constants/AppRoutes';
import { SidebarMenuType } from '@/types/sidebar.types';

import {
  LayoutDashboard,
  Users,
  Package,
  Box,
  Warehouse,
  AlertCircle,
  ShieldCheck,
  Newspaper,
  ClipboardList,
  CheckSquare,
  BookOpen
} from 'lucide-react';
import BlogIcon from '@/components/svgs/BlogIcon';

const ADMIN_SIDEBAR_MENU: SidebarMenuType = [
  {
    id: 1,
    title: 'Dashboard',
    icon: <LayoutDashboard size={18} />,
    route: AppRoutes.ADMIN_DASHBOARD
  },
  {
    id: 2,
    title: 'Customers',
    icon: <Users size={18} />,
    route: AppRoutes.ADMIN_CONTRACTOR_LISTING
  },
  {
    id: 3,
    title: 'Orders',
    icon: <Package size={18} />,
    route: AppRoutes.ADMIN_ORDER_LISTING
  },
  {
    id: 4,
    title: 'Products',
    icon: <Box size={18} />,
    route: AppRoutes.ADMIN_PRODUCT_LISTING
  },
  {
    id: 5,
    title: 'Warehouse',
    icon: <Warehouse size={18} />,
    route: AppRoutes.ADMIN_WAREHOUSE
  },
  {
    id: 6,
    title: 'Complaints',
    icon: <AlertCircle size={18} />,
    route: AppRoutes.ADMIN_COMPLAINTS
  },
  {
    id: 7,
    title: 'EHS',
    icon: <ShieldCheck size={18} />,
    route: null,
    subMenu: [
      {
        id: 1,
        title: 'EHS News & Update',
        icon: <Newspaper size={18} />,
        route: AppRoutes.ADMIN_EHS_NEWS_LISTING
      },
      {
        id: 2,
        title: 'EHS Toolbox Talk',
        icon: <ClipboardList size={18} />,
        route: AppRoutes.ADMIN_EHS_TOOLBOX_TALK_LISTING
      },
      {
        id: 3,
        title: 'EHS Checklist',
        icon: <CheckSquare size={18} />,
        route: AppRoutes.ADMIN_EHS_CHECKLIST_LISTING
      },
      {
        id: 4,
        title: 'EHS First Principles',
        icon: <BookOpen size={18} />,
        route: AppRoutes.ADMIN_EHS_FIRST_PRINCIPLES_LISTING
      }
    ]
  },
  {
    id: 8,
    title: 'Blogs',
    icon: <BlogIcon className="w-4 h-4" />,
    route: AppRoutes.ADMIN_BLOG
  }
] as const;

const AdminDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Sidebar sidebarMenu={ADMIN_SIDEBAR_MENU} />
      <div className="min-h-screen flex flex-col pt-10 lg:py-10 lg:pr-10 ">
        <main className="relative flex-grow lg:ml-72 pt-10 px-4 pb-4 sm:p-10 bg-white rounded shadow-lg ">
          {children}
        </main>
      </div>
    </>
  );
};

export default AdminDashboardLayout;
