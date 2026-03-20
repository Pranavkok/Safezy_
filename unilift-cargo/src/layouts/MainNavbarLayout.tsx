import MainNavbar from '@/components/navbar/MainNavbar';
import FooterSection from '@/sections/footer/FooterSection';

const MainNavbarLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col  ">
      <div className="h-14 xl:h-16 ">
        <MainNavbar />
      </div>
      {children}
      <FooterSection />
    </div>
  );
};

export default MainNavbarLayout;
