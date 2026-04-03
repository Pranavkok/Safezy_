import IncidentReportStepper from '@/sections/ehs/incident-analysis';

export const metadata = {
  title: 'Incident Analysis | Safezy',
  description:
    'Record and analyze incidents to enhance workplace safety and compliance.'
};

const ContractorIncidentAnalysisAddPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <IncidentReportStepper isFromAdd={true} />
    </div>
  );
};

export default ContractorIncidentAnalysisAddPage;
