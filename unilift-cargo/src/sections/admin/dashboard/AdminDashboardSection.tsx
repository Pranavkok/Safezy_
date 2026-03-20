import React from 'react';
import { AppRoutes } from '@/constants/AppRoutes';

import Link from 'next/link';
import { getAdminCounts } from '@/actions/admin/dashboard';
import { notFound } from 'next/navigation';
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
      className="min-h-40 sm:min-h-52 bg-primary  p-5 text-black rounded-xl flex flex-col 2xl:px-10 items-center justify-center lg:flex-row lg:justify-between transition-shadow duration-300 hover:shadow-lg cursor-pointer "
    >
      <div className="flex justify-center items-center mb-4 lg:mb-0 lg:mr-4">
        {icon}
      </div>
      <div className="flex flex-col items-center lg:items-end">
        <p className="text-3xl sm:text-4xl font-extrabold md:text-7xl ">
          {count}
        </p>
        <p className="text-base sm:text-lg md:text-xl font-extrabold">
          {title}
        </p>
      </div>
    </Link>
  );
};

const AdminDashboardSection = async () => {
  const { data: counts } = await getAdminCounts();

  if (!counts) {
    return notFound();
  }

  // Dashboard stats data for reuse
  const dashboardStats = [
    {
      route: AppRoutes.ADMIN_CONTRACTOR_LISTING,
      count: counts.contractors,
      icon: (
        <UserCircle
          className="font-thin text-black/90 w-16 h-16 sm:w-24 sm:h-24"
          strokeWidth={1}
        />
      ),
      title: 'Customers'
    },
    {
      route: AppRoutes.ADMIN_ORDER_LISTING,
      count: counts.orders,
      icon: (
        <PackageOpen
          className="font-thin text-black/90 w-16 h-16 sm:w-24 sm:h-24"
          strokeWidth={1}
        />
      ),
      title: 'Orders'
    },
    {
      route: AppRoutes.ADMIN_PRODUCT_LISTING,
      count: counts.products,
      icon: (
        <Boxes
          className="font-thin text-black/90 w-16 h-16 sm:w-24 sm:h-24"
          strokeWidth={1}
        />
      ),
      title: 'Products'
    },
    {
      route: AppRoutes.ADMIN_COMPLAINTS,
      count: counts.complaints,
      icon: (
        <NotepadText
          className="font-thin text-black/90 w-16 h-16 sm:w-24 sm:h-24"
          strokeWidth={1}
        />
      ),
      title: 'Complaints'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
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
