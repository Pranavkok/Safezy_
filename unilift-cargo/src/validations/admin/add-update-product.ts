import { z } from 'zod';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm'];

export const AddProductSchema = z.object({
  productName: z.string().trim().min(1, 'Product Name is required'),
  category: z
    .string({
      required_error: 'Category is required'
    })
    .min(1, 'Category is required'),
  subCategory: z.string().min(1, 'Sub Category is required').optional(),
  productId: z.string().min(1, 'Product Id is required'),
  brandName: z.string().min(1, 'Brand Name is required'),
  productDescription: z.string().min(1, 'Product Description is required'),
  sizes: z.array(z.object({ id: z.string(), size: z.string() })),
  image: z
    .array(
      z
        .instanceof(File)
        .refine(file => file.size <= MAX_FILE_SIZE, 'Max file size is 5MB.')
        .refine(
          file => ACCEPTED_IMAGE_TYPES.includes(file.type),
          '.jpg, .jpeg, .png and .webp files are accepted.'
        ),
      {
        required_error: 'At least one image is required'
      }
    )
    .min(1, 'At least one image is required'),
  trainingVideo: z
    .any()
    .optional()
    .refine(files => {
      return !files || files.length <= 1; // No video or only one video allowed
    }, 'Only one video is allowed.')
    .refine(files => {
      if (
        files.length === 1 &&
        !ACCEPTED_VIDEO_TYPES.includes(files[0]?.type)
      ) {
        return false;
      }
      return true; // Check file type only if one video exists
    }, 'Only .mp4 and .webm video formats are accepted.'),
  colors: z.array(
    z.object({
      id: z.string().optional(),
      color: z.string().optional()
    })
  ),
  geographicalLocation: z
    .array(z.string())
    .min(1, 'Please select at least one  geographical industry.'),
  recommendedUseLife: z.string().min(1, 'Provide number of months'),
  recommendedIndustryUses: z.array(
    z.object({ id: z.string(), recommendedIndustryUse: z.string() })
  ),
  gst: z
    .string({
      required_error: 'GST is required'
    })
    .min(0, 'GST cannot be negative')
    .max(100, 'GST cannot exceed 100%')
    .optional(),
  hsn_code: z
    .string({
      required_error: 'HSN Code is required'
    })
    .optional(),
  priceWithQty: z
    .array(
      z.object({
        qtyFrom: z.string().optional(),
        qtyTo: z.string().optional(),
        price: z.string().optional(),
        id: z.string().min(1, 'ID is required.')
      })
    )
    .refine(
      priceWithQty => {
        if (priceWithQty.length === 0) return false;
        const { qtyFrom, qtyTo, price } = priceWithQty[0];
        return (
          qtyFrom?.trim() !== '' && qtyTo?.trim() !== '' && price?.trim() !== ''
        );
      },
      {
        message: 'At least one price range is required.',
        path: [0, 'price']
      }
    )
    .superRefine((priceWithQty, ctx) => {
      priceWithQty.forEach((item, index) => {
        const qtyFrom = parseFloat(item.qtyFrom || '0');
        const qtyTo = parseFloat(item.qtyTo || '0');
        if (qtyTo <= qtyFrom) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Max Qty must be greater than Min Qty',
            path: [index, 'qtyTo']
          });
        }
      });
    })
    .superRefine((priceWithQty, ctx) => {
      priceWithQty.forEach((item, index) => {
        if (!item.price?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Price is required',
            path: [index, 'price']
          });
        }
      });
    }),
  leadTimeWithQty: z
    .array(
      z.object({
        qtyFrom: z.string().optional(),
        qtyTo: z.string().optional(),
        timeInDays: z.string().optional(),
        id: z.string().min(1, 'ID is required.')
      })
    )
    .refine(
      leadTime => {
        if (leadTime.length === 0) return false;
        const { qtyFrom, qtyTo, timeInDays } = leadTime[0];
        return (
          qtyFrom?.trim() !== '' &&
          qtyTo?.trim() !== '' &&
          timeInDays?.trim() !== ''
        );
      },
      {
        message: 'At least one lead time range is required.',
        path: [0, 'timeInDays']
      }
    )
    .superRefine((leadTime, ctx) => {
      leadTime.forEach((item, index) => {
        const qtyFrom = parseFloat(item.qtyFrom || '0');
        const qtyTo = parseFloat(item.qtyTo || '0');
        if (qtyTo <= qtyFrom) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Max Qty must be greater than Min Qty',
            path: [index, 'qtyTo']
          });
        }
      });
    })
    .superRefine((leadTime, ctx) => {
      leadTime.forEach((item, index) => {
        if (!item.timeInDays?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Time in days is required',
            path: [index, 'timeInDays']
          });
        }
      });
    })
});

export type addProductType = z.infer<typeof AddProductSchema>;

export const UpdateProductSchema = z.object({
  productName: z.string().trim().min(1, 'Product Name is required'),
  category: z
    .string({
      required_error: 'Category is required'
    })
    .min(1, 'Category is required'),
  subCategory: z.string().min(1, 'Sub Category is required'),
  productId: z.string().min(1, 'Product Id is required'),
  brandName: z.string().min(1, 'Brand Name is required'),
  productDescription: z.string().min(1, 'Product Description is required'),
  sizes: z.array(z.object({ id: z.string(), size: z.string() })),
  image: z
    .array(
      z
        .instanceof(File)
        .refine(file => file.size <= MAX_FILE_SIZE, 'Max file size is 5MB.')
        .refine(
          file => ACCEPTED_IMAGE_TYPES.includes(file.type),
          '.jpg, .jpeg, .png and .webp files are accepted.'
        )
    )
    .optional(),
  trainingVideo: z
    .any()
    .optional()
    .refine(files => {
      if (
        files.length === 1 &&
        !ACCEPTED_VIDEO_TYPES.includes(files[0]?.type)
      ) {
        return false;
      }
      return true; // Check file type only if one video exists
    }, 'Only .mp4 and .webm video formats are accepted.'),
  colors: z.array(
    z.object({
      id: z.string().optional(),
      color: z.string().optional()
    })
  ),
  geographicalLocation: z
    .array(z.string())
    .min(1, 'Please select at least one  geographical industry.'),
  recommendedUseLife: z.string().min(1, 'Provide number of months'),
  recommendedIndustryUses: z.array(
    z.object({ id: z.string(), recommendedIndustryUse: z.string() })
  ),
  gst: z
    .string({
      required_error: 'GST is required'
    })
    .min(0, 'GST cannot be negative')
    .max(100, 'GST cannot exceed 100%')
    .optional(),
  hsn_code: z
    .string({
      required_error: 'HSN Code is required'
    })
    .optional(),
  priceWithQty: z
    .array(
      z.object({
        qtyFrom: z.string().optional(),
        qtyTo: z.string().optional(),
        price: z.string().optional(),
        id: z.string().min(1, 'ID is required.')
      })
    )
    .refine(
      priceWithQty => {
        if (priceWithQty.length === 0) return false;
        const { qtyFrom, qtyTo, price } = priceWithQty[0];
        return (
          qtyFrom?.trim() !== '' && qtyTo?.trim() !== '' && price?.trim() !== ''
        );
      },
      {
        message: 'At least one price range is required.',
        path: ['0', 'price']
      }
    ),
  leadTimeWithQty: z
    .array(
      z.object({
        qtyFrom: z.string().optional(),
        qtyTo: z.string().optional(),
        timeInDays: z.string().optional(),
        id: z.string().min(1, 'ID is required.')
      })
    )
    .refine(
      leadTime => {
        if (leadTime.length === 0) return false;
        const { qtyFrom, qtyTo, timeInDays } = leadTime[0];
        return (
          qtyFrom?.trim() !== '' &&
          qtyTo?.trim() !== '' &&
          timeInDays?.trim() !== ''
        );
      },
      {
        message: 'At least one lead time range is required.',
        path: ['0', 'timeInDays']
      }
    ),
  isOutOfStock: z.boolean().optional()
});

export type updateProductType = z.infer<typeof UpdateProductSchema>;
