import { MoveDown } from 'lucide-react';
import { FlowchartJsonType } from '@/types/ehs.types';

export default function IncidentFlowchart({
  flowchartPoints
}: {
  flowchartPoints: FlowchartJsonType[];
}) {
  // Styling constants
  const boxStyles =
    'relative p-4 bg-white shadow-md rounded-lg border-l-4 border-l-primary border w-full ';
  const titleStyles = 'font-bold text-lg text-gray-800';
  const descriptionStyles = 'text-gray-600 mt-1';
  const connectorStyles = 'flex justify-center my-2';

  return (
    <div className=" p-6 rounded-xl">
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
        Flowchart of Events leading to Incident
      </h2>
      <div className="max-w-2xl mx-auto">
        {flowchartPoints?.map((step, index) => (
          <div key={step.no}>
            <div className={boxStyles}>
              <h3 className={titleStyles}>{step.title}</h3>
              <p className={descriptionStyles}>{step.description}</p>
            </div>

            {index < flowchartPoints?.length - 1 && (
              <div className={connectorStyles}>
                <MoveDown className="text-primary" size={50} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
