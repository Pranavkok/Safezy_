import { EmployeeListingTable } from './employees-table/EmployeeListingTable';
import { getEmployee } from '@/actions/contractor/employee';
import { SearchParamsType } from '@/types/index.types';

const EmployeeListingSection = async ({ searchParams }: SearchParamsType) => {
  const searchQuery = searchParams?.name ?? undefined;
  const sortParam = searchParams?.sort ?? undefined;
  const worksiteId = searchParams?.worksite ?? undefined;
  const page = parseInt(searchParams?.page ?? '1', 10);
  const pageSize = parseInt(searchParams?.per_page ?? '10', 10);
  const [sortBy = 'first_name', sortOrder = 'asc'] = sortParam
    ? sortParam.split('.')
    : [];

  const employees = await getEmployee(
    worksiteId,
    searchQuery,
    sortBy,
    sortOrder,
    page,
    pageSize
  );

  return (
    <>
      {worksiteId && (
        <EmployeeListingTable employeeListingPromise={employees} />
      )}
    </>
  );
};

export default EmployeeListingSection;
