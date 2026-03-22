import UaUcNearMissForm from '@/sections/ehs/ua-uc-near-miss';

export const metadata = {
  title: 'New UA / UC / Near Miss Report | Safezy',
  description: 'Submit a new Unsafe Act, Unsafe Condition, or Near Miss observation report.'
};

const UaUcNearMissAddPage = () => {
  return <UaUcNearMissForm />;
};

export default UaUcNearMissAddPage;
