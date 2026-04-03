import UaUcNearMissListingSection from '@/sections/ehs/ua-uc-near-miss/UaUcNearMissListingSection';

export const metadata = {
  title: 'UA / UC / Near Miss Reports | Safezy',
  description: 'View and manage Unsafe Act, Unsafe Condition, and Near Miss observation reports.'
};

const UaUcNearMissListingPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <UaUcNearMissListingSection />
    </div>
  );
};

export default UaUcNearMissListingPage;
