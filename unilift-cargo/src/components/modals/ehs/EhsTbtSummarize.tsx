'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DialogClose, DialogTrigger } from '@radix-ui/react-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const DEFAULT_FONT_SIZE = 16;
const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 28;

const EhsTbtSummarizeModal = ({ summary }: { summary: string }) => {
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="bg-primary rounded-md px-4 sm:px-6 py-2 text-white font-extrabold text-xs sm:text-sm md:text-base">
          Summarize
        </button>
      </DialogTrigger>
      <DialogContent
        className="
          w-full
          max-w-[calc(100vw-2rem)] sm:max-w-xl lg:max-w-2xl
          border-0 shadow-2xl rounded-xl p-4 sm:p-6 bg-white
          max-h-[90vh] overflow-y-auto
        "
      >
        <DialogHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-left">
                Summarize
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base text-foreground/80 text-left">
                Summarize this topic to make it easier to understand and remember.
              </DialogDescription>
            </div>
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 shrink-0 mt-1">
              <button
                onClick={() => setFontSize(prev => Math.max(prev - 2, MIN_FONT_SIZE))}
                className="px-2 py-0.5 text-xs border border-gray-400 rounded hover:bg-gray-100 font-bold select-none"
                title="Decrease text size"
              >
                A−
              </button>
              <button
                onClick={() => setFontSize(DEFAULT_FONT_SIZE)}
                className="px-2 py-0.5 text-xs border border-gray-400 rounded hover:bg-gray-100 select-none"
                title="Reset text size"
              >
                Reset
              </button>
              <button
                onClick={() => setFontSize(prev => Math.min(prev + 2, MAX_FONT_SIZE))}
                className="px-2 py-0.5 text-xs border border-gray-400 rounded hover:bg-gray-100 font-bold select-none"
                title="Increase text size"
              >
                A+
              </button>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-2 sm:mt-4 w-full">
          <ScrollArea
            className="
              w-full max-w-full
              h-[50vh] sm:h-[55vh] md:h-[60vh]
              rounded-md border
            "
          >
            <div
              className="
                p-2 sm:p-4 prose prose-sm sm:prose-base max-w-full overflow-x-auto break-words
                [&>ul]:list-disc [&>ul]:ml-4 sm:[&>ul]:ml-6 [&>ul]:mt-2 sm:[&>ul]:mt-4
                [&>ul>li]:mb-1 sm:[&>ul>li]:mb-2
                [&>p.ql-align-center]:text-center [&>p]:my-1 sm:[&>p]:my-2
                [&>p>strong]:font-bold [&>p>em]:italic
                [&>.ql-size-large]:text-base sm:[&>.ql-size-large]:text-lg
                [&>*]:max-w-full
              "
              style={{ wordBreak: 'break-word', fontSize: `${fontSize}px` }}
              dangerouslySetInnerHTML={{ __html: summary }}
            />
          </ScrollArea>
        </div>

        <DialogFooter className="pt-2 mt-2 flex justify-end items-end w-full">
          <DialogClose asChild>
            <Button className="w-full max-w-full text-white rounded-lg py-1 sm:py-2 text-sm sm:text-base">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EhsTbtSummarizeModal;
