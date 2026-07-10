import { AppRoutes } from '@/constants/AppRoutes';
import { PRODUCT_BRANDS, PRODUCT_CATEGORIES } from '@/constants/product';
import { createClient } from './supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { LeadTimeTierType, PriceTierType } from '@/context/CartContext';

export const ROLE_TO_PATH_MAP: Record<string, string> = {
  admin: AppRoutes.ADMIN_DASHBOARD,
  contractor: AppRoutes.HOME,
  warehouse_operator: AppRoutes.WAREHOUSE_OPERATOR_DASHBOARD,
  principle: AppRoutes.PRINCIPAL_EMPLOYER_DASHBOARD,
  manager: AppRoutes.MANAGER_DASHBOARD,
  safety_officer: AppRoutes.SAFETY_OFFICER_DASHBOARD
};

export const getProductCategoryLabel = (category: string) => {
  return PRODUCT_CATEGORIES.find(cat => cat.value === category)?.label ?? '';
};

export const getProductBrandLabel = (value: string): string => {
  const brand = PRODUCT_BRANDS.find(brand => brand.value === value);
  return brand ? brand.label : '';
};

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'heic', 'heif'];

// Derive the file extension from a (possibly query-stringed) public URL.
export const getUrlExtension = (url: string): string => {
  const withoutQuery = url.split(/[?#]/)[0];
  const lastSegment = withoutQuery.split('/').pop() ?? '';
  const dotIndex = lastSegment.lastIndexOf('.');
  return dotIndex === -1 ? '' : lastSegment.slice(dotIndex + 1).toLowerCase();
};

// True when the URL points at an image we can safely render with <img>/<Image>.
export const isImageUrl = (url: string): boolean =>
  IMAGE_EXTENSIONS.includes(getUrlExtension(url));

// Human-friendly label for a non-image attachment based on its extension.
export const getAttachmentLabel = (url: string): string => {
  const ext = getUrlExtension(url);
  if (ext === 'pdf') return 'PDF';
  if (ext === 'doc' || ext === 'docx') return 'Word';
  if (ext === 'xls' || ext === 'xlsx') return 'Excel';
  return ext ? ext.toUpperCase() : 'File';
};

interface UploadResult {
  publicUrl: string;
}

export const uploadMultipleFiles = async (
  files: File[],
  bucket: string,
  folder: string
  // options?: {
  //   maxFiles?: number;
  //   maxFileSizeMB?: number;
  //   allowedFileTypes?: string[];
  // }
): Promise<UploadResult[]> => {
  const supabase = createClient();
  // const results: UploadResult[] = [];

  // Process files in parallel
  const uploadPromises = files?.map(async file => {
    try {
      // Generate unique filename
      const fileName = `${uuidv4()}_${file.name.replace(/[^a-zA-Z0-9\s.-]/g, '')}`;
      const filePath = `${folder}/${fileName}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        return {
          file,
          error: uploadError.message
        };
      }

      // Get public URL
      const {
        data: { publicUrl }
      } = supabase.storage.from(bucket).getPublicUrl(filePath);

      return {
        file,
        publicUrl
      };
    } catch (error) {
      return {
        file,
        error: error instanceof Error ? error.message : 'Unknown upload error'
      };
    }
  });

  // Await all uploads
  const uploadResults = await Promise.all(uploadPromises);

  // Collect and return results
  return uploadResults.map(result => ({
    publicUrl: result.publicUrl as string
  }));
};

export const uploadFile = async (
  file: File,
  bucket: string,
  folder: string
) => {
  const supabase = createClient();

  try {
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

    const fileName = `${uuidv4()}_${sanitizedFileName}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    const {
      data: { publicUrl }
    } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error(`Error uploading file:`, error);
    throw error;
  }
};

export const deleteFile = async (
  fileUrl: string,
  bucket: string,
  folder: string
) => {
  const supabase = createClient();

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

export const getProductPriceFromPriceTiers = (
  quantity: number,
  priceTiers: PriceTierType[]
) => {
  const sortedTiers = [...priceTiers].sort(
    (a, b) => a.minQuantity - b.minQuantity
  );
  const tier = sortedTiers.find(
    tier =>
      quantity >= tier.minQuantity &&
      (quantity <= tier.maxQuantity || tier.maxQuantity === -1)
  );
  return tier ? tier.price : (sortedTiers[sortedTiers.length - 1]?.price ?? 0);
};

export const getProductLeadTimeFromLeadTimeTiers = (
  quantity: number,
  leadTimeTiers: LeadTimeTierType[]
) => {
  const sortedTiers = [...leadTimeTiers].sort(
    (a, b) => a.minQuantity - b.minQuantity
  );
  const tier = sortedTiers.find(tier => {
    return (
      quantity >= tier.minQuantity &&
      (quantity <= tier.maxQuantity || tier.maxQuantity === -1)
    );
  });
  return tier ? tier.days : (sortedTiers[sortedTiers.length - 1]?.days ?? 0);
};
