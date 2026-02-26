import React from 'react';
import { notFound } from 'next/navigation';
import { getBlogDetailsById } from '@/actions/admin/blog';
import { BlogDetailsSection } from './BlogDetailsSection';

const BlogSection = async ({ blogId }: { blogId: number }) => {
  const res = await getBlogDetailsById(blogId);

  if (!res.success || !res.data) {
    notFound();
  }
  return <BlogDetailsSection blog={res.data} />;
};

export default BlogSection;
