'use client';

import ASSETS from '@/assets';
import Image from 'next/image';
import { ToolboxTalkType } from '@/types/index.types';
import { SecondaryLogo } from '@/components/svgs';
import { ToolboxNoteType } from '@/types/ehs.types';
import EhsTbtSummarizeModal from '@/components/modals/ehs/EhsTbtSummarize';
import ToolboxNoteModal from '@/components/modals/ehs/AddNoteForTBT';
import MarkTBTDoneModal from '@/components/modals/ehs/MarkTBTDoneModal';

export const EHSToolboxTalkDetailsSection = ({
  toolboxTalk,
  toolboxNote
}: {
  toolboxTalk: ToolboxTalkType;
  toolboxNote: ToolboxNoteType;
}) => {
  return (
    <div className="relative overflow-hidden">
      <div className="w-full h-full pointer-events-none">
        <div className="absolute -left-32 top-44 rotate-90">
          <Image
            src={ASSETS.IMG.SAFEZY_TEXT}
            alt="Safety Text"
            height={512}
            width={512}
            className="w-[450px] h-auto"
            priority
          />
        </div>
        <div className="absolute right-0 bottom-0 translate-x-1/2 ">
          <Image
            src={ASSETS.IMG.HELMET}
            alt="Decorative Helmet"
            height={512}
            width={512}
            className="w-[550px] h-auto"
            priority
          />
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center w-full max-w-7xl mx-auto px-4 py-8 ">
        <div className="bg-white shadow-lg rounded-xl w-full p-6 sm:p-8 border border-gray-300 z-20">
          <div className="flex flex-col sm:flex-row justify-between items-center border-b-2 border-gray-300  pb-2 sm:pb-4 gap-3 sm:gap-0">
            <SecondaryLogo className="bg-primary pt-3 rounded sm:w-40 md:w-48 " />
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-black text-center sm:text-right">
              EHS Toolbox Talk
            </div>
          </div>

          {/* Topic Name */}
          <div className="w-full text-center bg-primary text-white text-base sm:text-lg md:text-xl font-extrabold py-2 sm:py-3 mt-2 sm:mt-4 rounded-md px-2">
            {toolboxTalk.topic_name.toUpperCase()}
          </div>

          {/* Content Box */}
          {toolboxTalk.description && (
            <div className="relative mt-6 p-6 bg-gray-100 border border-gray-300 rounded-lg overflow-hidden">
              <div
                className="relative z-[10] w-full prose break-words [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mt-4 [&>ul>li]:mb-2 [&>p.ql-align-center]:text-center [&>p]:my-2 [&>p>strong]:font-bold [&>p>em]:italic [&>.ql-size-large]:text-lg"
                dangerouslySetInnerHTML={{
                  __html: toolboxTalk.description
                }}
              />
              <div className="absolute z-[5] opacity-20 inset-0 justify-center items-center hidden sm:flex">
                <Image
                  src={ASSETS.IMG.TOOLBOX_BG}
                  alt="Question"
                  height={512}
                  width={512}
                  className="w-[550px] h-auto object-contain max-h-full"
                  priority
                />
              </div>
            </div>
          )}

          {toolboxTalk.pdf_url && (
            <div className="mt-6 w-full rounded-lg overflow-hidden">
              <Image
                src={toolboxTalk.pdf_url}
                alt={'Data is not visible'}
                height={1080}
                width={1080}
                className="w-[1200px] h-auto max-h-full"
              />
            </div>
          )}
        </div>

        <div className="w-full flex flex-col gap-2 sm:flex-row sm:justify-between items-center mt-6">
          <div className="space-x-2">
            <ToolboxNoteModal
              noteData={toolboxNote}
              toolboxId={toolboxTalk.id}
            />
            {toolboxTalk.summarized && (
              <EhsTbtSummarizeModal summary={toolboxTalk.summarized} />
            )}
          </div>
          <div>
            <MarkTBTDoneModal
              toolboxTalkId={toolboxTalk.id}
              toolboxTopic={toolboxTalk.topic_name}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
