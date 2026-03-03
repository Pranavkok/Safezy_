'use server';

import ExcelJS from 'exceljs';
import { BULK_UPLOAD_HEADERS } from '@/constants/bulkUpload';

const SAMPLE_ROW = [
  'Safety Helmet Pro',       // product_name *
  'SKU-001',                 // product_id
  'head_protection',         // category *
  'Hard Hats',               // sub_category
  '3M',                      // brand_name *
  'Industrial hard hat suitable for construction sites', // description *
  '365',                     // use_life * (days)
  'helmet_front.jpg',        // main_image * (must exist in images/ folder in ZIP)
  'helmet_side.jpg;helmet_back.jpg', // additional_images (semicolon-separated filenames)
  'S;M;L;XL',                // sizes * (semicolon-separated)
  'Red;Blue;Yellow',         // colors * (semicolon-separated)
  '18',                      // gst (percentage)
  '6506',                    // hsn_code
  'Construction;Mining',     // industry_use (semicolon-separated)
  'Maharashtra;Gujarat',     // geographical_locations (semicolon-separated)
  '',                        // training_video_url (optional external URL)
  1,                         // price_tier_1_min_qty
  100,                       // price_tier_1_max_qty
  500,                       // price_tier_1_price
  101,                       // price_tier_2_min_qty
  500,                       // price_tier_2_max_qty
  450,                       // price_tier_2_price
  '',                        // price_tier_3_min_qty
  '',                        // price_tier_3_max_qty
  '',                        // price_tier_3_price
  '',                        // price_tier_4_min_qty
  '',                        // price_tier_4_max_qty
  '',                        // price_tier_4_price
  '',                        // price_tier_5_min_qty
  '',                        // price_tier_5_max_qty
  '',                        // price_tier_5_price
  1,                         // lead_time_1_qty_from
  100,                       // lead_time_1_qty_to
  7,                         // lead_time_1_days
  101,                       // lead_time_2_qty_from
  500,                       // lead_time_2_qty_to
  14,                        // lead_time_2_days
  '',                        // lead_time_3_qty_from
  '',                        // lead_time_3_qty_to
  '',                        // lead_time_3_days
  '',                        // lead_time_4_qty_from
  '',                        // lead_time_4_qty_to
  '',                        // lead_time_4_days
  '',                        // lead_time_5_qty_from
  '',                        // lead_time_5_qty_to
  ''                         // lead_time_5_days
];

const INSTRUCTIONS_ROWS = [
  ['BULK PRODUCT UPLOAD — INSTRUCTIONS'],
  [''],
  ['HOW TO USE THIS TEMPLATE'],
  ['1. Fill in the "Products" sheet with your product data (one product per row).'],
  ['2. Delete the sample row (row 2) before uploading.'],
  ['3. Place all product images in an "images/" folder.'],
  ['4. Create a ZIP file containing: your filled Products.xlsx AND the images/ folder.'],
  ['5. Upload the ZIP on the Bulk Upload page.'],
  [''],
  ['COLUMN REFERENCE'],
  ['Column', 'Required', 'Type', 'Description / Allowed Values'],
  ['product_name', 'YES', 'text', 'Name of the product'],
  ['product_id', 'no', 'text', 'Optional SKU or external ID'],
  ['category', 'YES', 'text', 'One of: head_protection | respiratory_protection | face_protection | eye_protection | hand_protection | leg_protection | fall_protection'],
  ['sub_category', 'no', 'text', 'Optional sub-category'],
  ['brand_name', 'YES', 'text', 'Brand or manufacturer name'],
  ['description', 'YES', 'text', 'Full product description'],
  ['use_life', 'YES', 'number', 'Recommended use life in days (positive integer, e.g. 365)'],
  ['main_image', 'YES', 'filename', 'Filename of the primary image in the images/ folder (e.g. helmet.jpg). Max 10MB. Formats: jpg, jpeg, png, webp, gif'],
  ['additional_images', 'no', 'filenames', 'Semicolon-separated list of extra image filenames in images/ folder (e.g. side.jpg;back.jpg). Max 9 additional (10 total). Missing filenames are warned, not skipped.'],
  ['sizes', 'YES', 'list', 'Semicolon-separated sizes (e.g. S;M;L;XL or One Size)'],
  ['colors', 'YES', 'list', 'Semicolon-separated colors (e.g. Red;Blue;Yellow)'],
  ['gst', 'no', 'number', 'GST percentage, 0–100 (e.g. 18)'],
  ['hsn_code', 'no', 'text', 'HSN tax code (e.g. 6506)'],
  ['industry_use', 'no', 'list', 'Semicolon-separated industries (e.g. Construction;Mining)'],
  ['geographical_locations', 'no', 'list', 'Semicolon-separated regions (e.g. Maharashtra;Gujarat)'],
  ['training_video_url', 'no', 'url', 'External URL to a training video (not included in ZIP)'],
  [''],
  ['PRICE TIERS (up to 5)'],
  ['price_tier_N_min_qty', 'Together', 'number', 'Minimum quantity for this price tier (positive integer)'],
  ['price_tier_N_max_qty', 'Together', 'number', 'Maximum quantity for this price tier (positive integer, must be > min)'],
  ['price_tier_N_price', 'Together', 'number', 'Price per unit for this tier (positive number)'],
  ['Note: all 3 sub-columns for a tier must be filled together. Tiers must not overlap.', '', '', ''],
  [''],
  ['LEAD TIME TIERS (up to 5)'],
  ['lead_time_N_qty_from', 'Together', 'number', 'Quantity range start'],
  ['lead_time_N_qty_to', 'Together', 'number', 'Quantity range end (must be > qty_from)'],
  ['lead_time_N_days', 'Together', 'number', 'Delivery days for this range'],
  ['Note: all 3 sub-columns for a tier must be filled together. Tiers must not overlap.', '', '', ''],
  [''],
  ['SKIP RULES (rows that will be skipped with error)'],
  ['• Any required field is empty'],
  ['• main_image filename not found in images/ folder'],
  ['• main_image exceeds 10MB or is not jpg/jpeg/png/webp/gif'],
  ['• use_life, gst, price or quantity values are not valid numbers'],
  ['• gst is outside 0–100'],
  ['• price tier min_qty >= max_qty'],
  ['• price tier ranges overlap'],
  ['• lead time tier qty_from >= qty_to'],
  ['• lead time tier ranges overlap'],
  ['• only some sub-columns of a tier are filled (partial tier)'],
  ['• category is not one of the 7 valid values listed above'],
];

export async function generateBulkUploadTemplate() {
  const workbook = new ExcelJS.Workbook();

  const productsSheet = workbook.addWorksheet('Products');
  productsSheet.addRow([...BULK_UPLOAD_HEADERS]);
  productsSheet.addRow(SAMPLE_ROW);

  const instructionsSheet = workbook.addWorksheet('Instructions');
  for (const row of INSTRUCTIONS_ROWS) {
    instructionsSheet.addRow(row);
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return {
    fileName: 'bulk_upload_template.xlsx',
    contentType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    base64Data: Buffer.from(buffer).toString('base64')
  };
}
