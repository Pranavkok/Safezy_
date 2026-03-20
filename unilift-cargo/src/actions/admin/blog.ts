'use server';

import { AppRoutes } from '@/constants/AppRoutes';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants/constants';
import { AddBlogType, UpdateBlogType } from '@/types/ehs.types';
import { BlogType } from '@/types/index.types';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// Get all Blogs
export const getAllBlogDetails = async (
  searchQuery: string,
  page: number = 1,
  pageSize: number = 10
): Promise<{
  success: boolean;
  message: string;
  data?: BlogType[];
  pageCount?: number;
  count?: number;
}> => {
  const supabase = await createClient();

  try {
    let query = supabase.from('blogs').select('*', { count: 'exact' });

    if (searchQuery) {
      query.or(`title.ilike.%${searchQuery}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error while feteching blog details', error);
      return {
        success: false,
        message: ERROR_MESSAGES.BLOG_DETAILS_NOT_FETCHED
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.BLOG_DETAILS_FETCHED,
      data,
      pageCount: count ? Math.ceil(count / pageSize) : 1,
      count: count ? count : 0
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while fetching blog details',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

// Get blog by id
export const getBlogDetailsById = async (
  blogId: number
): Promise<{
  success: boolean;
  message: string;
  data?: BlogType;
}> => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', blogId)
      .single();

    if (error) {
      console.error('Error while fetching blog details', error);
      return {
        success: false,
        message: ERROR_MESSAGES.BLOG_DETAILS_NOT_FETCHED
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.BLOG_DETAILS_FETCHED,
      data
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while fetching blog details',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

// Add blog
export const addBlogDetails = async (
  blog: AddBlogType
): Promise<{
  success: boolean;
  message: string;
  blog?: { id: number; title: string; image_url: string | null };
}> => {
  const supabase = await createClient();

  try {
    const newBlog = {
      title: blog.title,
      description: blog.description,
      long_description: blog.long_description,
      image_url: blog.image_url
    };

    const { data: insertedBlog, error } = await supabase
      .from('blogs')
      .insert(newBlog)
      .select()
      .single();

    if (error || !insertedBlog) {
      console.error('Error adding blog', error);
      return {
        success: false,
        message: ERROR_MESSAGES.BLOG_DETAILS_NOT_ADDED
      };
    }

    revalidatePath(AppRoutes.ADMIN_BLOG);

    return {
      success: true,
      message: SUCCESS_MESSAGES.BLOG_DETAILS_ADDED,
      blog: {
        id: insertedBlog.id,
        title: insertedBlog.title,
        image_url: insertedBlog.image_url ?? null
      }
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while adding blog details',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

// Update blog
export const updateBlogDetails = async (
  blog: UpdateBlogType,
  blogId: number
): Promise<{ success: boolean; message: string }> => {
  const supabase = await createClient();

  try {
    const blogData = {
      title: blog.title,
      image_url: blog.image_url,
      description: blog.description,
      long_description: blog.long_description
    };

    const { error } = await supabase
      .from('blogs')
      .update(blogData)
      .eq('id', blogId);

    if (error) {
      console.error('Error updating blog', error);
      return {
        success: false,
        message: ERROR_MESSAGES.BLOG_DETAILS_NOT_UPDATED
      };
    }
    revalidatePath(AppRoutes.ADMIN_BLOG);

    return {
      success: true,
      message: SUCCESS_MESSAGES.BLOG_DETAILS_UPDATED
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while updating blog details',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

// Delete blog
export const deleteBlog = async (blogId: number) => {
  const supabase = await createClient();

  try {
    const { data: blog, error: fetchError } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', blogId)
      .single();

    if (fetchError) {
      console.error('Error while fetching blog details', fetchError);
      return {
        success: false,
        message: ERROR_MESSAGES.BLOG_DETAILS_NOT_FETCHED
      };
    }

    if (blog?.image_url) {
      await deleteFile(blog.image_url, 'blogs', 'images');
    }

    const { error } = await supabase.from('blogs').delete().eq('id', blogId);

    if (error) {
      console.error('Error deleting blog', error);
      return {
        success: false,
        message: ERROR_MESSAGES.BLOG_DETAILS_NOT_DELETED
      };
    }

    revalidatePath(AppRoutes.ADMIN_BLOG);

    return {
      success: true,
      message: SUCCESS_MESSAGES.BLOG_DETAILS_DELETED
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while deleting blog or its image',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const addBlogSubscriberDetails = async (
  subscriberEmail: string
): Promise<{ success: boolean; message: string }> => {
  const supabase = await createClient();

  try {
    const { data: existingSubscription } = await supabase
      .from('blog_subscribers')
      .select('*')
      .eq('subscriber_email', subscriberEmail)
      .single();

    if (existingSubscription) {
      return {
        success: false,
        message: ERROR_MESSAGES.BLOG_ALREADY_SUBSCRIBED
      };
    }

    const { error: insertError } = await supabase
      .from('blog_subscribers')
      .insert({ subscriber_email: subscriberEmail });

    if (insertError) {
      console.error('Error adding blog subscription', insertError);
      return {
        success: false,
        message: ERROR_MESSAGES.BLOG_SUBSCRIPTION_DETAILS_NOT_ADDED
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.BLOG_SUBSCRIPTION_DETAILS_ADDED
    };
  } catch (error) {
    console.error(
      'An unexpected error occurred while subscribing to blog',
      error
    );
    return {
      success: false,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR
    };
  }
};

export const deleteFile = async (
  fileUrl: string,
  bucket: string,
  folder: string
) => {
  const supabase = await createClient();

  try {
    const fileName = fileUrl.split('/').pop();

    if (!fileName) {
      throw new Error('Invalid file URL: Unable to extract filename.');
    }

    const filePath = `${folder}/${fileName}`;

    const { error: deleteError } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (deleteError) {
      throw new Error(`Failed to delete file: ${deleteError.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};
