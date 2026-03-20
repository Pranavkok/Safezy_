'use client';

import ASSETS from '@/assets';
import Image from 'next/image';
import { BlogType } from '@/types/index.types';
import { SecondaryLogo } from '@/components/svgs';
import BlogSummarizeModal from '@/components/modals/BlogSummarizeModal';

export const BlogDetailsSection = ({ blog }: { blog: BlogType }) => {
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
              Blogs
            </div>
          </div>

          {/* Title */}
          <div className="w-full text-center bg-primary text-white text-base sm:text-lg md:text-xl font-extrabold py-2 sm:py-3 mt-2 sm:mt-4 rounded-md px-2">
            {blog.title.toUpperCase()}
          </div>

          {/* Content Box */}
          {blog.description && (
            <div className="relative mt-6 p-6 bg-gray-100 border border-gray-300 rounded-lg overflow-hidden">
              <div className="relative z-[10] w-full break-words">
                {blog.description}
              </div>
            </div>
          )}

          {blog.image_url && (
            <div className="mt-6 w-full rounded-lg overflow-hidden">
              <Image
                src={blog.image_url}
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
            <BlogSummarizeModal blog={blog} />
          </div>
        </div>
      </div>
    </div>
  );
};
