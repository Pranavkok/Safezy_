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
import { Search, ClipboardList, AlertTriangle, ArrowRight } from 'lucide-react';
import { DialogClose, DialogTrigger } from '@radix-ui/react-dialog';

const EHSIncidentAnalysisModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="bg-primary py-2 px-4 rounded-sm text-white font-bold text-sm sm:text-base  cursor-pointer w-full sm:w-auto">
          How it Works?
        </button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-full sm:max-w-md md:max-w-xl lg:max-w-2xl border-0 shadow-2xl rounded-xl p-4 sm:p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-primary text-center sm:text-left">
            <Search className="h-5 w-5 sm:h-6 sm:w-6" />
            Welcome to EHS Incident Analysis
          </DialogTitle>
          <DialogDescription className="pt-2 text-sm sm:text-base text-foreground/80">
            The EHS Incident Analysis module provides a structured approach to
            investigating workplace incidents, identifying root causes, and
            ensuring corrective and preventive actions (CAPA) are implemented
            effectively. This process helps improve workplace safety by learning
            from past incidents and preventing future occurrences.
          </DialogDescription>
        </DialogHeader>

        {/* Added a fixed-height div with overflow-y-auto for scrolling */}
        <div className="max-h-64 sm:max-h-80 md:max-h-96 overflow-y-auto pr-2">
          <div className="space-y-4 sm:space-y-6 py-3 sm:py-4">
            <div className="rounded-xl bg-white p-3 sm:p-5 shadow-md border">
              <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-primary flex items-center">
                <AlertTriangle className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Why Conduct an Incident Analysis?
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                {[
                  'Identifies Root Causes – Finds the real reasons behind the incident.',
                  'Prevents Recurrence – Implements Corrective & Preventive Actions (CAPA) to stop similar incidents.',
                  'Improves Safety Procedures – Strengthens policies based on investigation findings.',
                  'Ensures Compliance – Aligns with industry safety standards and regulations.',
                  'Generates a Detailed Report – Documents all findings, actions taken, and recommendations for improvement.'
                ].map((item, index) => (
                  <li
                    key={item + index}
                    className="flex items-start gap-2 sm:gap-3"
                  >
                    <span className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-white font-bold mt-0.5">
                      ✓
                    </span>
                    <span className="text-sm sm:text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl bg-white p-3 sm:p-5 shadow-md border">
              <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-primary flex items-center">
                <ClipboardList className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                How the Analysis Works:
              </h3>
              <ul className="space-y-1 sm:space-y-2">
                {[
                  'Gather Basic Information – Document the who, what, when, and where of the incident.',
                  'Assess the Affected Entity – If a person is involved, record injury details and work conditions.',
                  'Collect Witness Statements – Gather observations from those who saw the incident.',
                  'Review Pre-Incident Operations – Analyze tasks, equipment, and training before the incident occurred.',
                  'Examine Historical Data – Compare with past incidents and review safety training records.',
                  'Investigate & Gather Evidence – Conduct interviews, collect photos, and analyze environmental factors.',
                  'Generate CAPA Points – Based on the investigation, generate Corrective and Preventive Actions to address root causes.',
                  'Final Report Generation – A comprehensive report is created, detailing the investigation, CAPA points, and safety improvements.'
                ].map((step, index) => (
                  <li
                    key={step + index}
                    className="flex items-start gap-2 sm:gap-3"
                  >
                    <span className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-white font-bold mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-sm sm:text-base">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2 mt-2">
          <DialogClose asChild>
            <Button className="w-full text-white rounded-lg py-1 sm:py-2 text-sm sm:text-base">
              Get Started{' '}
              <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EHSIncidentAnalysisModal;
