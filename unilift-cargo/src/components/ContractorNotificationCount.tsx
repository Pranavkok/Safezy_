'use client';

import { Bell } from 'lucide-react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDeliveredOrdersAwaitingInventoryCount } from '@/actions/contractor/inventory';
import { getAppNotificationUnreadCount } from '@/actions/contractor/notifications';

const ContractorNotificationCount = () => {
  const { data: orderCount = 0 } = useQuery({
    queryKey: ['deliveredOrdersCount'],
    queryFn: async () => {
      const res = await getDeliveredOrdersAwaitingInventoryCount();
      return res.count ?? 0;
    }
  });

  const { data: appCount = 0 } = useQuery({
    queryKey: ['appNotificationsUnread'],
    queryFn: () => getAppNotificationUnreadCount()
  });

  const total = orderCount + appCount;

  return (
    <div className="relative inline-block">
      <Bell className="w-6 h-6 text-gray-800" />
      {total > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary rounded-full transform translate-x-1/2 -translate-y-1/2">
          {total > 99 ? '99+' : total}
        </span>
      )}
    </div>
  );
};

export default ContractorNotificationCount;
