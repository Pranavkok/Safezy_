import React, { Suspense } from 'react';
import Spinner from '@/components/loaders/Spinner';
import { SearchParamsType } from '@/types/index.types';
import { getAllToolboxTalkDetails } from '@/actions/admin/ehs/toolbox-talk';
import { ToolboxTalkListingTable } from './toolbox-listing-table/ToolboxTalkListingTable';

const ToolboxTalkListingSection = async ({
  searchParams
}: SearchParamsType) => {
  const searchQuery = searchParams.topic_name;
  const page = parseInt(searchParams.page ?? '1');
  const pageSize = parseInt(searchParams.per_page ?? '10');

  const toolboxTalks = await getAllToolboxTalkDetails(
    searchQuery as string,
    page,
    pageSize
  );

  return (
    <Suspense
      fallback={
        <Spinner className="absolute inset-0 w-full h-full grid place-content-center" />
      }
    >
      <ToolboxTalkListingTable toolboxTalks={toolboxTalks} />
    </Suspense>
  );
};

export default ToolboxTalkListingSection;
