import MainNavbar from '@/components/navbar/MainNavbar';
import Image from 'next/image';
import ASSETS from '@/assets';

const AuthTopbarLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen overflow-hidden relative">
      <div className="w-full flex justify-center pt-4 mb-4">
        <MainNavbar />
      </div>

      <div className="  w-full h-full  pointer-events-none ">
        <div className="absolute -left-32 top-64   rotate-90 z-[-1]">
          <Image
            src={ASSETS.IMG.SAFEZY_TEXT}
            alt="Safety Text"
            height={512}
            width={512}
            className="w-[450px] h-auto"
            priority
          />
        </div>
        <div className="absolute right-0 bottom-0 translate-x-1/2  z-[-1]">
          <Image
            src={ASSETS.IMG.HELMET}
            alt="Decorative Helmet"
            height={512}
            width={512}
            className="w-[550px] h-auto"
            priority
          />
        </div>
      </div>

      {children}
    </div>
  );
};

export default AuthTopbarLayout;
