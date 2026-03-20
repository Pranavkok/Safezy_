import { Separator } from '@/components/ui/separator';
import BadgeList from '@/components/common/BadgeList';
import {
  INDUSTRIES_SERVED_OPTIONS,
  TOTAL_NUMBER_OF_WORKERS_OPTIONS,
  TYPES_OF_SERVICES_PROVIDED_OPTIONS
} from '@/constants/contractor';
import { ContractorOrdersTable } from './contractors-table/ContractorOrdersTable';
import { labelType } from '@/types/contractor.types';
import { SearchParamsType } from '@/types/index.types';
import ConfirmActiveInactiveSection from './ConfirmActiveInactiveSection';
import { USER_ROLES } from '@/constants/constants';
import ContractorStockAvailability from './ContractorStockAvailability';
import { fetchOrdersByUser } from '@/actions/admin/order';
import { fetchContractorById } from '@/actions/admin/contractor';
import { fetchContractorInventory } from '@/actions/admin/inventory';
import { notFound } from 'next/navigation';

// Utility function to get corresponding labels from options based on values
const getLabels = (
  values: string[],
  options: { value: string; label: string }[],
  otherType: string
) =>
  values
    ?.map(value => {
      if (value === 'other') {
        return `Other - ${otherType}`;
      } else {
        return options.find(opt => opt.value === value)?.label ?? value;
      }
    })
    .filter(Boolean);

// Move contractor info to a separate constant
const getContractorInfo = (
  email: string | undefined,
  contact_number: string | undefined,
  total_workers: string | undefined
) => [
  { label: 'Email', value: email ?? 'N/A' },
  { label: 'Phone', value: contact_number ?? 'N/A' },
  {
    label: 'Total Workers',
    value:
      TOTAL_NUMBER_OF_WORKERS_OPTIONS.find(data => data.value === total_workers)
        ?.label ?? 'N/A'
  }
];

type ContractorDetailsPropsType = SearchParamsType & { contractorId: string };

const ContractorDetails = async ({
  searchParams,
  contractorId
}: ContractorDetailsPropsType) => {
  // Sorting parameters from searchParams
  const sortParam = searchParams.sort ?? undefined;
  const page = parseInt(searchParams.page ?? '1');
  const pageSize = parseInt(searchParams.per_page ?? '10');
  const [sortBy, sortOrder] = sortParam ? sortParam.split('.') : [];

  const [contractorRes, inventoryRes, contractorOrders] = await Promise.all([
    fetchContractorById(contractorId),
    fetchContractorInventory(contractorId),
    fetchOrdersByUser(contractorId, sortBy, sortOrder, page, pageSize)
  ]);

  const { data: contractorDetails } = contractorRes;
  const { data: stockAvailability = [] } = inventoryRes;

  if (!contractorDetails) {
    notFound();
  }

  const {
    first_name,
    last_name,
    company_name,
    email,
    contact_number,
    total_workers,
    service_type,
    industries_type,
    locations_served,
    companies_served
  } = contractorDetails;

  const serviceLabels = getLabels(
    service_type as string[],
    TYPES_OF_SERVICES_PROVIDED_OPTIONS,
    contractorDetails.other_services_type as string
  );
  const industryLabels = getLabels(
    industries_type as string[],
    INDUSTRIES_SERVED_OPTIONS,
    contractorDetails.other_industries_type as string
  );
  const locationsLabels = locations_served
    ? (locations_served as labelType[]).map(data => data.value)
    : [];
  const companiesLabels = companies_served
    ? (companies_served as labelType[]).map(data => data.value)
    : [];

  // Contractor Information Array
  const contractorInfo = getContractorInfo(
    email,
    contact_number,
    total_workers!
  );

  return (
    <>
      <div className="flex flex-col lg:flex-row border p-2 lg:p-5 rounded">
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <div className="grid grid-cols-2  w-full">
              <div className=" row-start-1 row-end-3  w-full">
                <p className="text-lg md:text-xl font-semibold lg:whitespace-nowrap">{`${first_name || 'N/A'} ${last_name || 'N/A'}`}</p>{' '}
                <p className="text-primary font-bold lg:whitespace-nowrap">
                  {company_name || 'N/A'}
                </p>
              </div>

              <div className="place-self-end ">
                <ConfirmActiveInactiveSection
                  id={contractorDetails.id}
                  isActive={contractorDetails.is_active}
                  userRole={USER_ROLES.CONTRACTOR}
                />
              </div>
            </div>
          </div>

          <Separator className="my-2 w-40 bg-primary" />

          <div className="space-y-2">
            {contractorInfo.map(({ label, value }, index) => (
              <div key={index} className="text-base flex gap-2">
                <p className="font-medium">{label}:</p>
                <p>{value}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator
          className="mx-4 h-auto hidden lg:block"
          orientation="vertical"
        />

        <div className="space-y-4 mt-10 lg:mt-0 w-full overflow-hidden">
          <BadgeList title="Type of Services Provided" items={serviceLabels} />
          <BadgeList
            title="Industries Served"
            items={industryLabels}
            maxVisibleBadges={4}
          />
          <BadgeList
            title="Locations where Services Provided"
            items={locationsLabels}
          />
          <BadgeList
            title="Companies where Services Provided"
            items={companiesLabels}
          />
        </div>
      </div>

      <ContractorStockAvailability stockAvailability={stockAvailability} />

      <ContractorOrdersTable contractorOrders={contractorOrders} />
    </>
  );
};

export default ContractorDetails;
