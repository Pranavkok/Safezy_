'use client';

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
import { DialogClose, DialogTrigger } from '@radix-ui/react-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const EhsTbtSummarizeModal = ({ summary }: { summary: string }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="bg-primary rounded-md px-4 sm:px-6 py-2 mt-2 text-white font-extrabold text-xs sm:text-sm md:text-base">
          Hindi Speaking Points
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
          <DialogTitle className="text-xl sm:text-2xl font-bold text-left">
            Hindi Speaking Points
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-foreground/80 text-left">
            Summarize this topic to make it easier to understand and remember.
          </DialogDescription>
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
              style={{ wordBreak: 'break-word' }}
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
