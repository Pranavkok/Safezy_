import React from 'react';
import EhsChecklistAddUpdateSection from './EhsChecklistAddUpdateSection';
import { getChecklistDetailsById } from '@/actions/contractor/checklist';
import { notFound } from 'next/navigation';

const EhsChecklistUpdateSection = async ({
  checklistTopicId
}: {
  checklistTopicId: number;
}) => {
  const res = await getChecklistDetailsById(checklistTopicId);

  if (!res.success || !res.data) {
    notFound();
  }

  return <EhsChecklistAddUpdateSection initialData={res.data} />;
};

export default EhsChecklistUpdateSection;
