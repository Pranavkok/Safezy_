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
  HardHat,
  Shield,
  AlertTriangle,
  Lightbulb,
  PenTool,
  ArrowRight
} from 'lucide-react';
import { DialogClose, DialogTrigger } from '@radix-ui/react-dialog';

const EHSToolboxTalksModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="bg-primary py-2 px-4 rounded-sm text-white font-bold text-sm sm:text-base cursor-pointer">
          How it Works?
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-xl border-0 shadow-2xl rounded-xl max-h-[70vh] sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-primary mt-2">
            {/* <Tool className="h-6 w-6 text-indigo-600" /> */}
            Welcome to EHS Toolbox Talks
          </DialogTitle>
          <DialogDescription className="pt-2 text-base text-foreground/80">
            EHS Toolbox Talks are short, focused discussions on workplace safety
            topics designed to raise awareness and prevent accidents. Each talk
            covers a specific safety concern, providing insights on:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1  gap-1">
            <div className="flex items-start gap-3 bg-indigo-50 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
              <span>Identifying hazards</span>
            </div>
            <div className="flex items-start gap-3 bg-indigo-50 p-3 rounded-lg">
              <Lightbulb className="h-6 w-6 text-yellow-500 shrink-0 mt-0.5" />
              <span>Understanding unsafe acts & conditions</span>
            </div>
            <div className="flex items-start gap-3 bg-indigo-50 p-3 rounded-lg">
              <Shield className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
              <span>Following best safety practices</span>
            </div>
            <div className="flex items-start gap-3 bg-indigo-50 p-3 rounded-lg">
              <PenTool className="h-6 w-6 text-blue-500 shrink-0 mt-0.5" />
              <span>Taking proactive measures to prevent accidents</span>
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 p-5 shadow-md border border-indigo-100">
            <h3 className="font-semibold text-lg mb-3 text-primary flex items-center">
              <HardHat className="mr-2 h-5 w-5 primary" />
              How It Works:
            </h3>
            <ul className="space-y-3">
              {[
                'Browse through different Toolbox Talk topics',
                'Learn about common safety risks & solutions',
                'Apply the knowledge to improve workplace safety'
              ].map((step, index) => (
                <li key={step + index} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-white font-bold">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <DialogClose asChild>
            <Button className="w-full text-white rounded-lg py-2">
              View All Topics <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EHSToolboxTalksModal;
