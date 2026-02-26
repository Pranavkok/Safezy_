import IncidentReportStepper from '@/sections/ehs/incident-analysis';

export const metadata = {
  title: 'Incident Analysis | Safezy',
  description:
    'Record and analyze incidents to enhance workplace safety and compliance.'
};

const ContractorIncidentAnalysisAddPage = () => {
  return <IncidentReportStepper isFromAdd={true} />;
};

export default ContractorIncidentAnalysisAddPage;
