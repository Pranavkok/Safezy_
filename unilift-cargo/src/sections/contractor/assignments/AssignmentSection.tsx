import AssignmentsTable from './assignment-table/AssignmentsTable';
import { fetchEmployeePPEHistory } from '@/actions/contractor/employee';
import DateFilterSection from './DateFilterSection';
import { SearchParamsType } from '@/types/index.types';

const AssignmentSection = async ({ searchParams }: SearchParamsType) => {
  const worksiteId = searchParams?.worksite ?? undefined;
  const fromParam = searchParams.from ?? undefined;
  const toParam = searchParams.to ?? undefined;

  const assignments = await fetchEmployeePPEHistory(
    worksiteId!,
    fromParam,
    toParam
  );

  return (
    <>
      {worksiteId && (
        <div>
          <DateFilterSection />

          <AssignmentsTable assignments={assignments} />
        </div>
      )}
    </>
  );
};

export default AssignmentSection;
