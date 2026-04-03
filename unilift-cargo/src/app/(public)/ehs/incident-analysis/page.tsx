import IncidentAnalysisListingSection from '@/sections/ehs/incident-analysis/IncidentAnalysisListingSection';

export const metadata = {
  title: 'Incident Analysis Reports | Safezy',
  description: 'View and manage your submitted incident analysis reports.'
};

const IncidentAnalysisListingPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <IncidentAnalysisListingSection />
    </div>
  );
};

export default IncidentAnalysisListingPage;
