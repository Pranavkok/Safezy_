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
import Image from 'next/image';
import { BlogType } from '@/types/index.types';
import 'react-quill/dist/quill.snow.css';

const BlogSummarizeModal = ({ blog }: { blog: BlogType }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="bg-primary rounded-md px-4 sm:px-6 py-2 mt-2 text-white font-extrabold text-xs sm:text-sm md:text-base">
          View Full Blog
        </button>
      </DialogTrigger>
      <DialogContent
        className="w-[95vw] max-w-4xl
          border-0 shadow-2xl rounded-xl p-4 sm:p-6 bg-white
          max-h-[90vh] overflow-y-auto mx-auto
        "
      >
        {/* header */}
        <DialogHeader className="gap-2">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-left pr-6">
            {blog.title}
          </DialogTitle>

          <div className="h-[2px] bg-primary" />

          <DialogDescription className="text-base sm:text-xl text-foreground/80 text-left pr-6 break-words">
            {blog.description}
          </DialogDescription>
        </DialogHeader>

        {/* Image */}
        {blog.image_url && (
          <div className="my-3 w-full flex justify-center">
            <Image
              src={blog.image_url}
              alt={blog.title}
              width={500}
              height={400}
              className="rounded-lg object-cover sm:max-w-full h-auto"
            />
          </div>
        )}

        {/* Long description */}
        {blog.long_description && (
          <div
            className="ql-editor border rounded-md w-full mx-auto min-h-[30vh] max-h-[75vh] overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: blog.long_description }}
          />
        )}

        {/* Footer */}
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

export default BlogSummarizeModal;
