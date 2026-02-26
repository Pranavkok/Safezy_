import React, { Suspense } from 'react';
import AdminTopbarLayout from '@/layouts/AdminTopbarLayout';
import ToolboxTalkDetailsUpdateSection from '@/sections/admin/ehs/toolbox-talks/EhsToolboxTalkUpdateSection';
import { notFound } from 'next/navigation';
import { AppRoutes } from '@/constants/AppRoutes';
import { getToolboxTalkDetailsById } from '@/actions/admin/ehs/toolbox-talk';
import Spinner from '@/components/loaders/Spinner';

const BREADCRUMBS = [
  { label: 'Dashboard', route: `${AppRoutes.ADMIN_DASHBOARD}` },
  {
    label: 'Toolbox Talk',
    route: AppRoutes.ADMIN_EHS_TOOLBOX_TALK_LISTING
  },
  {
    label: 'Update',
    route: AppRoutes.ADMIN_EHS_TOOLBOX_TALK_UPDATE(0)
  }
] as const;

const ToolboxTalkDetailsUpdatePage = ({
  params
}: {
  params: {
    id: number;
  };
}) => {
  const toolboxId = params.id;

  return (
    <AdminTopbarLayout title="Ehs Toolbox Talk" breadcrumbOptions={BREADCRUMBS}>
      <Suspense
        fallback={
          <div className="flex justify-center items-center w-full h-[50vh]">
            <Spinner />
          </div>
        }
      >
        <ToolboxTalkUpdateSection toolboxId={toolboxId} />
      </Suspense>
    </AdminTopbarLayout>
  );
};
export default ToolboxTalkDetailsUpdatePage;

const ToolboxTalkUpdateSection = async ({
  toolboxId
}: {
  toolboxId: number;
}) => {
  const { data: toolboxDetails } = await getToolboxTalkDetailsById(toolboxId);

  if (!toolboxDetails) {
    notFound();
  }
  return <ToolboxTalkDetailsUpdateSection toolboxDetails={toolboxDetails} />;
};
