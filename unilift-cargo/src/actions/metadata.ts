'use sever';
import { getProductCategoryLabel } from '@/utils';
import { createClient } from '@/utils/supabase/server';

export const fetchToolboxTalkMetadataById = async (toolboxId: number) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ehs_toolbox_talk')
    .select('topic_name, description')
    .eq('id', toolboxId)
    .single();

  return error || !data
    ? {
        title: 'EHS Toolbox Talk | Safezy',
        description: 'Detailed insights on this EHS Toolbox Talk.'
      }
    : {
        title: `${data.topic_name} | EHS Toolbox Talk | Safezy`,
        description:
          data.description ?? 'Detailed insights on this EHS Toolbox Talk.'
      };
};

export const fetchChecklistMetadataById = async (topicId: number) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ehs_checklist_topics')
    .select('topic_name')
    .eq('id', topicId)
    .single();

  return error || !data
    ? {
        title: 'EHS Checklist | Safezy',
        description:
          'Browse and manage EHS checklists to ensure workplace safety and compliance.'
      }
    : {
        title: `${data.topic_name} | EHS Checklist | Safezy`,
        description: `Explore the checklist for ${data.topic_name} and ensure workplace safety and compliance.`
      };
};

export const fetchFirstPrincipleMetadataById = async (principleId: number) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ehs_first_principles')
    .select('title')
    .eq('id', principleId)
    .single();

  return error || !data
    ? {
        title: 'EHS First Principle | Safezy',
        description:
          'Explore the core EHS First Principles that drive workplace safety and best practices.'
      }
    : {
        title: `${data.title} | EHS First Principle | Safezy`,
        description: `Learn about the EHS First Principle: ${data.title} and its significance in workplace safety.`
      };
};

export const fetchIncidentMetadataById = async (incidentId: number) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ehs_incident_analysis')
    .select('title')
    .eq('id', incidentId)
    .single();

  return error || !data
    ? {
        title: 'Incident Analysis Report | Safezy',
        description:
          'Review and analyze incidents report to improve workplace safety and prevent future occurrences.'
      }
    : {
        title: `${data.title} | Incident Analysis Report | Safezy`,
        description: `Explore the details of the incident: ${data.title} report  and its impact on workplace safety.`
      };
};

export const fetchEhsNewsMetadataById = async (newsId: number) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ehs_news')
    .select('title')
    .eq('id', newsId)
    .single();

  return error || !data
    ? {
        title: 'EHS News | Safezy',
        description:
          'Stay updated with the latest EHS news, safety updates, and industry insights.'
      }
    : {
        title: `${data.title} | EHS News | Safezy`,
        description: `Read about ${data.title} and stay informed on workplace safety and environmental health trends.`
      };
};

export const fetchProductMetadataById = async (productId: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('product')
    .select('ppe_name, ppe_category, description, brand_name, price')
    .eq('id', productId)
    .maybeSingle();

  return error || !data
    ? {
        title: 'Product Details | Safezy',
        description: 'Discover high-quality products available on Safezy.'
      }
    : {
        title: `${data.ppe_name} - ${getProductCategoryLabel(data.ppe_category)} - ${getProductCategoryLabel(data.brand_name)} - ${data.price}Rs | Safezy`,
        description:
          data.description ||
          `Explore the ${data.ppe_name}, a ${data.ppe_category} from ${data.brand_name}, available for ₹${data.price} on Safezy.`
      };
};

export const fetchBlogMetadataById = async (blogId: number) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('blogs')
    .select('title, description')
    .eq('id', blogId)
    .single();

  return error || !data
    ? {
        title: 'Blogs | Safezy',
        description: 'Detailed insights on this blog post.'
      }
    : {
        title: `${data.title} | Blogs | Safezy`,
        description: data.description ?? 'Detailed insights on this blog post.'
      };
};
