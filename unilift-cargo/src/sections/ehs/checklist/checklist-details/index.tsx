import React from 'react';
import { getChecklistDetailsById } from '@/actions/contractor/checklist';
import { notFound } from 'next/navigation';
import ChecklistResponseFormSection from './ChecklistResponseFormSection';

const EhsChecklistDetails = async ({
  checklistTopicId
}: {
  checklistTopicId: number;
}) => {
  const res = await getChecklistDetailsById(checklistTopicId);

  if (!res.success || !res.data) {
    notFound();
  }
  return (
    <ChecklistResponseFormSection
      checklistQuestions={res.data}
    />
  );
};

export default EhsChecklistDetails;
