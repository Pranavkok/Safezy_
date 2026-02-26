import React from 'react';
import { fetchContractorsDetails } from '@/actions/contractor/contractor';
import ContractorTopbarLayout from '@/layouts/ContractorTopbarLayout';
import UpdateProfileSection from '@/sections/contractor/profile/UpdateProfileSection';
import { notFound } from 'next/navigation';

const ContractorProfilePage = async () => {
  const { data: profileDetails } = await fetchContractorsDetails();

  if (!profileDetails) {
    notFound();
  }
  return (
    <ContractorTopbarLayout title="Profile">
      <UpdateProfileSection profileDetails={profileDetails} />
    </ContractorTopbarLayout>
  );
};

export default ContractorProfilePage;
