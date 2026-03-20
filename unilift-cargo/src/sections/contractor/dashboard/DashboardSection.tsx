import { AppRoutes } from '@/constants/AppRoutes';
import {
  OrderIcon,
  EmployeeIcon,
  EquipmentIcon,
  WorkSiteIcon
} from '@/components/svgs';
import Link from 'next/link';
import { Attributes, cloneElement, ReactElement, ReactNode } from 'react';
import { getContractorCounts } from '@/actions/contractor/dashboard';
import { notFound } from 'next/navigation';

const ContractorDashboardBox = ({
  icon,
  count,
  title,
  route
}: {
  icon: ReactNode;
  count: number;
  title: string;
  route: string;
}) => (
  <Link
    className="min-h-40 sm:min-h-52 bg-primary p-5 text-black rounded-xl flex flex-col lg:gap-4 transition-shadow duration-300 hover:shadow-lg"
    href={route}
  >
    <div className="flex items-center mb-4 lg:mb-0">
      {cloneElement(
        icon as ReactElement,
        {
          className: 'w-16 h-16 sm:w-18 sm:h-18 fill-black'
        } as Attributes
      )}
    </div>

    <div>
      <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold">
        {count}
      </div>
      <div className="text-base sm:text-lg md:text-xl font-extrabold">
        {title}
      </div>
    </div>
  </Link>
);

const DashboardSection = async () => {
  const { data, success } = await getContractorCounts();

  if (!success || !data) {
    return notFound();
  }

  const dashboardStats = [
    {
      route: AppRoutes.CONTRACTOR_ORDER_LISTING,
      count: data.orders,
      icon: <OrderIcon />,
      title: 'Your Orders'
    },
    {
      route: AppRoutes.CONTRACTOR_EQUIPMENT_LISTING,
      count: data.equipments,
      icon: <EquipmentIcon />,
      title: 'Your Equipments'
    },
    {
      route: AppRoutes.CONTRACTOR_WORKSITE_LISTING,
      count: data.worksites,
      icon: <WorkSiteIcon />,
      title: 'Your Work Sites'
    },
    {
      route: AppRoutes.CONTRACTOR_EMPLOYEE_LISTING,
      count: data.employees,
      icon: <EmployeeIcon />,
      title: 'Your Employees'
    }
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
      {dashboardStats.map(item => (
        <ContractorDashboardBox key={item.route} {...item} />
      ))}
    </div>
  );
};

export default DashboardSection;
