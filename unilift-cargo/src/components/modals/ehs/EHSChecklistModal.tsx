import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  CheckSquare,
  ClipboardCheck,
  BarChart,
  ArrowRight
} from 'lucide-react';
import { DialogClose, DialogTrigger } from '@radix-ui/react-dialog';

const EHSChecklistModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="bg-primary py-2 px-4 rounded-sm text-white font-bold text-sm sm:text-base cursor-pointer w-full sm:w-auto">
          How it Works?
        </button>
      </DialogTrigger>
      <DialogContent
        className="
              w-full max-w-full sm:max-w-md md:max-w-xl lg:max-w-2xl
              border-0 shadow-2xl rounded-xl
              p-4 sm:p-6
              max-h-[80vh] sm:max-h-[90vh] overflow-auto
              flex flex-col"
      >
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-primary text-center sm:text-left mt-6">
            Welcome to the EHS Checklist Module
          </DialogTitle>
          <DialogDescription className="pt-2 text-sm sm:text-base text-foreground/80">
            EHS Checklists are structured safety tools designed to ensure
            workplace compliance, identify hazards, and maintain equipment
            integrity. They help in:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-3 sm:py-4">
          <div className="rounded-xl bg-white p-3 sm:p-5 shadow-md border ">
            <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-primary flex items-center">
              <BarChart className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Understanding Checklist Weightage:
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {[
                'Each checklist item has an assigned weightage based on its importance.',
                'Higher-weighted items indicate critical safety aspects that require strict compliance.',
                'The final checklist score helps determine if the inspected area/equipment is safe for use or needs corrective action.'
              ].map((item, index) => (
                <li
                  key={item + index}
                  className="flex items-start gap-2 sm:gap-3"
                >
                  <span className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-white font-bold mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-sm sm:text-base">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-white p-3 sm:p-5 shadow-md border ">
            <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-primary flex items-center">
              <ClipboardCheck className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              How It Works:
            </h3>
            <ul className="space-y-1 sm:space-y-2">
              {[
                'Go through each checklist item carefully.',
                'Select the appropriate response (Yes, No, or N/A).',
                'Add remarks for any observations.',
                'Submit the checklist for review.'
              ].map((step, index) => (
                <li
                  key={step + index}
                  className="flex items-center gap-2 sm:gap-3"
                >
                  <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                  <span className="text-sm sm:text-base">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter className="pt-2 mt-2">
          <DialogClose asChild>
            <Button className="w-full text-white rounded-lg py-1 sm:py-2 text-sm sm:text-base ">
              View All Topics{' '}
              <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EHSChecklistModal;
