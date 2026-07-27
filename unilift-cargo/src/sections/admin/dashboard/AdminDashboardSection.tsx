import React from 'react';
import { AppRoutes } from '@/constants/AppRoutes';

import Link from 'next/link';
import { getAdminCounts } from '@/actions/admin/dashboard';
import { Boxes, NotepadText, PackageOpen, UserCircle } from 'lucide-react';

const DashboardStatCard = ({
  icon,
  count,
  title,
  url
}: {
  icon: React.ReactNode;
  count: number;
  title: string;
  url: string;
}) => {
  return (
    <Link
      href={url}
      className="min-w-0 min-h-36 sm:min-h-44 bg-primary p-4 sm:p-5 text-black rounded-xl flex items-center justify-between gap-4 overflow-hidden transition-shadow duration-300 hover:shadow-lg cursor-pointer"
    >
      <div className="flex shrink-0 items-center justify-center">{icon}</div>
      <div className="min-w-0 flex flex-col items-end text-right">
        <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-none">
          {count}
        </p>
        <p className="mt-2 text-sm sm:text-base lg:text-lg font-extrabold whitespace-nowrap">
          {title}
        </p>
      </div>
    </Link>
  );
};

const AdminDashboardSection = async () => {
  const { data: counts } = await getAdminCounts();
  const resolvedCounts = counts ?? {
    contractors: 0,
    orders: 0,
    products: 0,
    complaints: 0
  };

  // Dashboard stats data for reuse
  const dashboardStats = [
    {
      route: AppRoutes.ADMIN_CONTRACTOR_LISTING,
      count: resolvedCounts.contractors,
      icon: (
        <UserCircle
          className="font-thin text-black/90 w-14 h-14 sm:w-20 sm:h-20"
          strokeWidth={1}
        />
      ),
      title: 'Customers'
    },
    {
      route: AppRoutes.ADMIN_ORDER_LISTING,
      count: resolvedCounts.orders,
      icon: (
        <PackageOpen
          className="font-thin text-black/90 w-14 h-14 sm:w-20 sm:h-20"
          strokeWidth={1}
        />
      ),
      title: 'Orders'
    },
    {
      route: AppRoutes.ADMIN_PRODUCT_LISTING,
      count: resolvedCounts.products,
      icon: (
        <Boxes
          className="font-thin text-black/90 w-14 h-14 sm:w-20 sm:h-20"
          strokeWidth={1}
        />
      ),
      title: 'Products'
    },
    {
      route: AppRoutes.ADMIN_COMPLAINTS,
      count: resolvedCounts.complaints,
      icon: (
        <NotepadText
          className="font-thin text-black/90 w-14 h-14 sm:w-20 sm:h-20"
          strokeWidth={1}
        />
      ),
      title: 'Complaints'
    }
  ];

  return (
    <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,20rem),1fr))] gap-3">
      {dashboardStats.map(item => (
        <DashboardStatCard
          key={item.route}
          url={item.route}
          count={item.count}
          icon={item.icon}
          title={item.title}
        />
      ))}
    </div>
  );
};

export default AdminDashboardSection;
