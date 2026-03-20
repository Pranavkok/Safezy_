import NavigationBreadcrumbs from '@/components/NavigationBreadcrumbs';
import { BreadcrumbOptionsType } from '@/types/global.types';

type PrincipalEmployerTopbarLayoutPropsType = {
  children: React.ReactNode;
  title: string;
  breadcrumbOptions?: BreadcrumbOptionsType;
};

const PrincipalEmployerTopbarLayout = ({
  children,
  title,
  breadcrumbOptions
}: PrincipalEmployerTopbarLayoutPropsType) => {
  return (
    <>
      <div className="px-4 flex  flex-col justify-center bg-background mb-4 h-14 lg:h-16 rounded">
        <h1 className="font-bold uppercase text-sm  lg:text-xl">{title}</h1>
        {breadcrumbOptions && breadcrumbOptions.length > 0 && (
          <NavigationBreadcrumbs breadcrumbOptions={breadcrumbOptions} />
        )}
      </div>

      <div className="w-full">{children}</div>
    </>
  );
};

export default PrincipalEmployerTopbarLayout;
