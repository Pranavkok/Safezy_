import { Button } from '@/components/ui/button';
import React from 'react';
import { useRouter } from 'next/navigation';
import { AppRoutes } from '@/constants/AppRoutes';

interface NextPreviousButtonProps {
  currentStep: number;
  isSubmitting: boolean;
  nextButtonText?: string;
  incidentId: number;
}

const NextPreviousButton: React.FC<NextPreviousButtonProps> = ({
  currentStep,
  isSubmitting,
  nextButtonText = 'Submit & Next',
  incidentId
}) => {
  const isFirstStep = currentStep === 1;

  const router = useRouter();

  const handlePrevious = () => {
    if (currentStep > 1) {
      router.replace(
        `${AppRoutes.EHS_INCIDENT_ANALYSIS_UPDATE(incidentId)}?stepId=${currentStep - 1}`
      );
    }
  };

  return (
    <div className="flex flex-col-reverse gap-2 xs:flex-row justify-between">
      {currentStep > 1 && (
        <Button
          type="button"
          onClick={handlePrevious}
          disabled={isFirstStep}
          variant="outline"
          className="px-6"
        >
          Previous
        </Button>
      )}
      <Button
        disabled={isSubmitting}
        type="submit"
        className="px-6 capitalize text-sm sm:ml-auto"
      >
        {isSubmitting && 'Submitting...'}
        {!isSubmitting && nextButtonText}
      </Button>
    </div>
  );
};

export default NextPreviousButton;
