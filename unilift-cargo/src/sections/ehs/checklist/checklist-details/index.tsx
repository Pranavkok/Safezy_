import React from 'react';
import {
  getChecklistDetailsById,
  getChecklistProgressByContractor
} from '@/actions/contractor/checklist';
import { notFound } from 'next/navigation';
import ChecklistResponseFormSection from './ChecklistResponseFormSection';
import { ChecklistProgressType } from '@/types/ehs.types';

const EhsChecklistDetails = async ({
  checklistTopicId
}: {
  checklistTopicId: number;
}) => {
  const [res, checklistRes] = await Promise.all([
    getChecklistDetailsById(checklistTopicId),
    getChecklistProgressByContractor(checklistTopicId)
  ]);

  if (!res.success || !res.data) {
    notFound();
  }
  return (
    <ChecklistResponseFormSection
      checklistQuestions={res.data}
      checklistProgress={checklistRes.data as ChecklistProgressType}
    />
  );
};

export default EhsChecklistDetails;
