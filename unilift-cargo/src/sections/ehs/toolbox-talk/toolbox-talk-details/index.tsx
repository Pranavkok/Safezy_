import React from 'react';
import { EHSToolboxTalkDetailsSection } from './EhsToolboxTalkDetailsSection';
import { notFound } from 'next/navigation';
import { getToolboxTalkDetailsById } from '@/actions/admin/ehs/toolbox-talk';
import { getToolboxNoteByUserId } from '@/actions/contractor/toolbox-talk';
import { ToolboxNoteType } from '@/types/ehs.types';

const EHSToolboxTalkSection = async ({
  ehsToolboxId
}: {
  ehsToolboxId: number;
}) => {
  const [res, note] = await Promise.all([
    getToolboxTalkDetailsById(ehsToolboxId),
    getToolboxNoteByUserId(ehsToolboxId)
  ]);

  if (!res.success || !res.data) {
    notFound();
  }
  return (
    <EHSToolboxTalkDetailsSection
      toolboxTalk={res.data}
      toolboxNote={note.data?.note as ToolboxNoteType}
    />
  );
};

export default EHSToolboxTalkSection;
