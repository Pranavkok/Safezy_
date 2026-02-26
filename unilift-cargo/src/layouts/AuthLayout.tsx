import { cn } from '@/lib/utils';

const AuthLayout = ({
  children,
  title,
  subtitle,
  className
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  className: string;
}) => {
  return (
    <div className="flex flex-grow items-center justify-center px-4">
      <div className={cn('bg-white shadow-lg', className)}>
        <div className="p-4 xs:p-6 sm:p-8 md:p-12">
          <div className="pb-6 sm:pb-8 xl:pb-12">
            <p className="text-2xl sm:text-3xl font-bold text-center">
              {title}
            </p>
            {subtitle && (
              <p className="text-xs sm:text-sm text-center text-gray-500 pt-2">
                {subtitle}
              </p>
            )}
          </div>
          <div className="p-1">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
