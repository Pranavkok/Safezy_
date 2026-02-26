import { Suspense } from 'react';
import EhsFirstPrincipleSection from '@/sections/ehs/first-principles/first-principle-details';
import PageBanner from '@/components/PageBanner';
import ASSETS from '@/assets';
import { AppRoutes } from '@/constants/AppRoutes';
import Spinner from '@/components/loaders/Spinner';
import { fetchFirstPrincipleMetadataById } from '@/actions/metadata';
import { Metadata } from 'next';

export async function generateMetadata({
  params
}: {
  params: { id: number };
}): Promise<Metadata> {
  return await fetchFirstPrincipleMetadataById(params.id);
}

const BREADCRUMBS = [
  { label: 'HOME', route: AppRoutes.HOME },
  { label: 'First Principles', route: AppRoutes.EHS_FIRST_PRINCIPLES },
  {
    label: 'First Principle Details',
    route: AppRoutes.EHS_FIRST_PRINCIPLES_DETAILS(1)
  }
] as const;

const FirstPrinciplesDetailsPage = ({
  params
}: {
  params: {
    id: number;
  };
}) => {
  const principleId = params.id;

  return (
    <div className="bg-gray-50 relative ">
      <PageBanner
        image={ASSETS.IMG.EHS_TOOLBOX_BANNER}
        pageHeading="EHS First Principle Details"
        breadcrumbs={BREADCRUMBS}
      />
      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <EhsFirstPrincipleSection principleId={principleId} />
      </Suspense>
    </div>
  );
};

export default FirstPrinciplesDetailsPage;
