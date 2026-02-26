import React from 'react';
import { getFirstPrincipleById } from '@/actions/admin/ehs/first-principles';
import { notFound } from 'next/navigation';
import { EHSFirstPrinciplesDetailsSection } from './EHSFirstPrincipleDetailsSection';

const EhsFirstPrincipleSection = async ({
  principleId
}: {
  principleId: number;
}) => {
  const principles = await getFirstPrincipleById(principleId);

  if (!principles.success || !principles.data) {
    notFound();
  }

  return <EHSFirstPrinciplesDetailsSection principles={principles.data} />;
};

export default EhsFirstPrincipleSection;
