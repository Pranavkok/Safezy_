import React from 'react';
import { getStaffList } from '@/actions/admin/staff';
import { StaffListingTable } from './staff-listing-table/StaffListingTable';

const StaffListingSection = async () => {
  const staff = await getStaffList();

  return <StaffListingTable staff={staff} />;
};

export default StaffListingSection;
