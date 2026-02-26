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
  Shield,
  Eye,
  RefreshCw,
  ScrollText,
  Heart,
  ArrowRight,
  Users
} from 'lucide-react';
import { DialogClose, DialogTrigger } from '@radix-ui/react-dialog';

const EHSFirstPrinciplesModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="bg-primary py-2 px-4 rounded-sm text-white font-bold text-sm sm:text-base  cursor-pointer w-full sm:w-auto">
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
            Welcome to EHS First Principles
          </DialogTitle>
          <DialogDescription className="pt-2 text-sm sm:text-base text-foreground/80 text-justify">
            <span className="font-semibold">EHS First Principles</span> form the
            foundation of a{' '}
            <span className="font-semibold">strong safety culture</span> in the
            workplace. These principles help organizations{' '}
            <span className="font-semibold">
              identify risks, prevent accidents, and create a proactive safety
              environment
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-3 sm:py-4">
          <div className="rounded-xl bg-white p-3 sm:p-5 shadow-md border ">
            <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-primary flex items-center">
              <Shield className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
              Why are EHS First Principles Important?
            </h3>
            <div className="grid grid-cols-1 gap-2 sm:gap-3">
              <div className="flex items-start gap-2 sm:gap-3">
                <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-sm sm:text-base">
                  <span className="font-semibold">
                    Proactive Safety Approach
                  </span>{' '}
                  – Focuses on preventing incidents before they happen.
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <Eye className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500 shrink-0 mt-0.5" />
                <div className="text-sm sm:text-base">
                  <span className="font-semibold">Risk Awareness</span> –
                  Encourages employees to recognize and address hazards.
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 shrink-0 mt-0.5" />
                <div className="text-sm sm:text-base">
                  <span className="font-semibold">Continuous Improvement</span>{' '}
                  – Helps refine safety policies through lessons learned.
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <ScrollText className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 shrink-0 mt-0.5" />
                <div className="text-sm sm:text-base">
                  <span className="font-semibold">
                    Legal & Compliance Benefits
                  </span>{' '}
                  – Ensures alignment with industry safety regulations.
                </div>
              </div>
              <div className="flex items-start gap-2 sm:gap-3">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-pink-500 shrink-0 mt-0.5" />
                <div className="text-sm sm:text-base">
                  <span className="font-semibold">Employee Well-Being</span> –
                  Creates a safer and healthier work environment.
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-3 sm:p-5 shadow-md border bg-white">
            <h3 className="font-semibold text-base sm:text-lg mb-2 sm:mb-3 text-primary flex items-center">
              <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              How Does It Work?
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {[
                'Understanding <strong>safety fundamentals</strong> and their real-world applications.',
                'Encouraging employees to <strong>identify and report potential hazards</strong>.',
                'Implementing <strong>corrective actions</strong> based on safety observations.',
                'Building a <strong>culture of accountability and awareness</strong> in the workplace.'
              ].map((item, index) => (
                <li
                  key={item + index}
                  className="flex items-start gap-2 sm:gap-3"
                >
                  <div className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-white font-bold mt-0.5">
                    {index + 1}
                  </div>
                  <div
                    className="text-sm sm:text-base"
                    dangerouslySetInnerHTML={{ __html: item }}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter className="pt-2 mt-2">
          <DialogClose asChild>
            <Button
              className="
                  w-full text-white rounded-lg py-2 sm:py-2 text-sm sm:text-base
                  flex items-center flex-wrap justify-center
                  whitespace-normal break-words text-center h-full"
            >
              <span className="flex-1">
                Build a stronger safety culture with First Principles
              </span>
              <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EHSFirstPrinciplesModal;
