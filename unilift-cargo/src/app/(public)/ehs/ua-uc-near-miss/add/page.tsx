import UaUcNearMissForm from '@/sections/ehs/ua-uc-near-miss';

export const metadata = {
  title: 'New UA / UC / Near Miss Report | Safezy',
  description: 'Submit a new Unsafe Act, Unsafe Condition, or Near Miss observation report.'
};

const UaUcNearMissAddPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <UaUcNearMissForm />
    </div>
  );
};

export default UaUcNearMissAddPage;
