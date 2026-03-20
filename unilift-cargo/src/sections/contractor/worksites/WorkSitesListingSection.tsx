import Spinner from '@/components/loaders/Spinner';
import { Suspense } from 'react';
import { WorksiteListingTable } from './worksites-table/WorksitesListingTable';
import { getAllWorkSites } from '@/actions/contractor/worksite';
import { SearchParamsType } from '@/types/index.types';

const WorkSitesListingSection = async ({ searchParams }: SearchParamsType) => {
  const searchQuery = searchParams?.site_name || undefined;
  const sortParam = searchParams?.sort || undefined;
  const page = parseInt(searchParams?.page || '1', 10);
  const pageSize = parseInt(searchParams?.per_page || '10', 10);
  const [sortBy = '', sortOrder = 'asc'] = sortParam
    ? sortParam.split('.')
    : [];

  const worksites = await getAllWorkSites(
    searchQuery,
    sortBy,
    sortOrder,
    page,
    pageSize
  );
  return (
    <Suspense
      fallback={
        <Spinner className="absolute inset-0 w-full h-full grid place-content-center" />
      }
    >
      <WorksiteListingTable worksites={worksites} />
    </Suspense>
  );
};

export default WorkSitesListingSection;
