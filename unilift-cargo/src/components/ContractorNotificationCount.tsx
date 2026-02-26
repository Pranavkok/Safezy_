'use client';

import { Bell } from 'lucide-react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDeliveredOrdersAwaitingInventoryCount } from '@/actions/contractor/inventory';

const ContractorNotificationCount = () => {
  const { data: notificationData } = useQuery({
    queryKey: ['deliveredOrdersCount'],
    queryFn: async () => await getDeliveredOrdersAwaitingInventoryCount()
  });

  const count = notificationData?.count ?? 0;

  return (
    <div className="relative inline-block">
      <Bell className="w-6 h-6 text-gray-800" />
      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary rounded-full transform translate-x-1/2 -translate-y-1/2">
        {count}
      </span>
    </div>
  );
};

export default ContractorNotificationCount;
