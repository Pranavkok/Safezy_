import WarehouseOperatorDashboardLayout from '@/layouts/WarehouseOperatorDashboardLayout';
import WarehouseOperatorDashboardSection from '@/sections/warehouse-operator/dashboard/WarehouseOperatorDashboardSection';
import React from 'react';

const WarehouseDashboardPage = () => {
  return (
    <WarehouseOperatorDashboardLayout title="Dashboard">
      <WarehouseOperatorDashboardSection />{' '}
    </WarehouseOperatorDashboardLayout>
  );
};

export default WarehouseDashboardPage;
