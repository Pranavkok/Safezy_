import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import ExcelJS from 'exceljs';
import { createClient } from '@/utils/supabase/server';
import { createServiceClient } from '@/utils/supabase/service';
import { getUserRole } from '@/actions/user';
import { v4 as uuidv4 } from 'uuid';
import { BULK_UPLOAD_HEADERS } from '@/constants/bulkUpload';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 min for large batches

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_ZIP_SIZE = 100 * 1024 * 1024; // 100 MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_IMAGES_PER_PRODUCT = 10;

const VALID_CATEGORIES = [
  'head_protection',
  'respiratory_protection',
  'face_protection',
  'eye_protection',
  'hand_protection',
  'leg_protection',
  'fall_protection'
];

const IMAGE_MIME_MAP: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif'
};

// Column index mapping (matches BULK_UPLOAD_HEADERS order exactly)
const COL = {
  PRODUCT_NAME: 0,
  PRODUCT_ID: 1,
  CATEGORY: 2,
  SUB_CATEGORY: 3,
  BRAND_NAME: 4,
  DESCRIPTION: 5,
  USE_LIFE: 6,
  MAIN_IMAGE: 7,
  ADDITIONAL_IMAGES: 8,
  SIZES: 9,
  COLORS: 10,
  GST: 11,
  HSN_CODE: 12,
  INDUSTRY_USE: 13,
  GEOGRAPHICAL_LOCATIONS: 14,
  TRAINING_VIDEO_URL: 15,
  PRICE_TIER_1_MIN: 16,
  LEAD_TIME_1_FROM: 31
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

type RowResult = {
  row: number;
  productName: string;
  status: 'success' | 'skipped';
  reason?: string;
  warnings: string[];
};

type PriceTier = { min_quantity: number; max_quantity: number; price: number };
type LeadTimeTier = { qty_from: number; qty_to: number; days: number };

// ─── Helpers ──────────────────────────────────────────────────────────────────

// exceljs cell values can be rich text / formula objects — extract a primitive
function extractCellValue(val: ExcelJS.CellValue): string | number | boolean | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return val;
  if (val instanceof Date) return val.getTime();
  if (typeof val === 'object') {
    if ('richText' in val) return (val as ExcelJS.CellRichTextValue).richText.map(r => r.text).join('');
    if ('result' in val) {
      const r = (val as ExcelJS.CellFormulaValue).result;
      if (typeof r === 'string' || typeof r === 'number' || typeof r === 'boolean') return r;
    }
    if ('text' in val) return (val as ExcelJS.CellHyperlinkValue).text;
  }
  return String(val);
}

function getCellString(row: unknown[], index: number): string {
  const val = row[index];
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

function getCellNumber(row: unknown[], index: number): number | null {
  const val = row[index];
  if (val === null || val === undefined || val === '') return null;
  const num = Number(val);
  return isNaN(num) ? null : num;
}

function parseSemicolonList(value: string): string[] {
  return value
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

function getMimeType(filename: string): string | null {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return IMAGE_MIME_MAP[ext] ?? null;
}

function isPresent(row: unknown[], index: number): boolean {
  const val = row[index];
  return val !== null && val !== undefined && String(val).trim() !== '';
}

// ─── Validation helpers ───────────────────────────────────────────────────────

function validatePriceTiers(
  row: unknown[]
): { tiers: PriceTier[]; error?: string } {
  const tiers: PriceTier[] = [];

  for (let i = 0; i < 5; i++) {
    const minIdx = COL.PRICE_TIER_1_MIN + i * 3;
    const maxIdx = minIdx + 1;
    const priceIdx = minIdx + 2;

    const hasMin = isPresent(row, minIdx);
    const hasMax = isPresent(row, maxIdx);
    const hasPrice = isPresent(row, priceIdx);

    if (!hasMin && !hasMax && !hasPrice) continue;

    if (!(hasMin && hasMax && hasPrice)) {
      return {
        tiers: [],
        error: `Price tier ${i + 1}: all three columns (min_qty, max_qty, price) must be filled together`
      };
    }

    const min = Number(row[minIdx]);
    const max = Number(row[maxIdx]);
    const price = Number(row[priceIdx]);

    if (isNaN(min) || isNaN(max) || isNaN(price)) {
      return {
        tiers: [],
        error: `Price tier ${i + 1}: min_qty, max_qty, and price must be valid numbers`
      };
    }

    if (min <= 0 || max <= 0 || price <= 0) {
      return {
        tiers: [],
        error: `Price tier ${i + 1}: min_qty, max_qty, and price must be positive`
      };
    }

    if (min >= max) {
      return {
        tiers: [],
        error: `Price tier ${i + 1}: min_qty (${min}) must be less than max_qty (${max})`
      };
    }

    if (tiers.length > 0 && min <= tiers[tiers.length - 1].max_quantity) {
      return {
        tiers: [],
        error: `Price tier ${i + 1}: overlaps with tier ${i} (min_qty ${min} ≤ previous max_qty ${tiers[tiers.length - 1].max_quantity})`
      };
    }

    tiers.push({ min_quantity: min, max_quantity: max, price });
  }

  return { tiers };
}

function validateLeadTimeTiers(
  row: unknown[]
): { tiers: LeadTimeTier[]; error?: string } {
  const tiers: LeadTimeTier[] = [];

  for (let i = 0; i < 5; i++) {
    const fromIdx = COL.LEAD_TIME_1_FROM + i * 3;
    const toIdx = fromIdx + 1;
    const daysIdx = fromIdx + 2;

    const hasFrom = isPresent(row, fromIdx);
    const hasTo = isPresent(row, toIdx);
    const hasDays = isPresent(row, daysIdx);

    if (!hasFrom && !hasTo && !hasDays) continue;

    if (!(hasFrom && hasTo && hasDays)) {
      return {
        tiers: [],
        error: `Lead time tier ${i + 1}: all three columns (qty_from, qty_to, days) must be filled together`
      };
    }

    const from = Number(row[fromIdx]);
    const to = Number(row[toIdx]);
    const days = Number(row[daysIdx]);

    if (isNaN(from) || isNaN(to) || isNaN(days)) {
      return {
        tiers: [],
        error: `Lead time tier ${i + 1}: qty_from, qty_to, and days must be valid numbers`
      };
    }

    if (from <= 0 || to <= 0 || days <= 0) {
      return {
        tiers: [],
        error: `Lead time tier ${i + 1}: qty_from, qty_to, and days must be positive`
      };
    }

    if (from >= to) {
      return {
        tiers: [],
        error: `Lead time tier ${i + 1}: qty_from (${from}) must be less than qty_to (${to})`
      };
    }

    if (tiers.length > 0 && from <= tiers[tiers.length - 1].qty_to) {
      return {
        tiers: [],
        error: `Lead time tier ${i + 1}: overlaps with tier ${i} (qty_from ${from} ≤ previous qty_to ${tiers[tiers.length - 1].qty_to})`
      };
    }

    tiers.push({ qty_from: from, qty_to: to, days });
  }

  return { tiers };
}

// ─── Server-side image upload to Supabase Storage ─────────────────────────────

async function uploadImageBuffer(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  const supabase = createServiceClient();
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `images/${uuidv4()}_${sanitized}`;

  const { error } = await supabase.storage
    .from('product_images')
    .upload(filePath, buffer, {
      contentType: mimeType,
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw new Error(`Failed to upload ${filename}: ${error.message}`);

  const {
    data: { publicUrl }
  } = supabase.storage.from('product_images').getPublicUrl(filePath);

  return publicUrl;
}

// ─── Process a single data row ────────────────────────────────────────────────

async function processRow(
  row: unknown[],
  rowNumber: number,
  imageFiles: Map<string, Buffer>
): Promise<RowResult> {
  const warnings: string[] = [];
  const productName = getCellString(row, COL.PRODUCT_NAME) || `Row ${rowNumber}`;

  // ── Mandatory field checks ──────────────────────────────────────────────────
  const requiredChecks: { field: string; value: string }[] = [
    { field: 'product_name', value: getCellString(row, COL.PRODUCT_NAME) },
    { field: 'category', value: getCellString(row, COL.CATEGORY) },
    { field: 'brand_name', value: getCellString(row, COL.BRAND_NAME) },
    { field: 'description', value: getCellString(row, COL.DESCRIPTION) },
    { field: 'use_life', value: getCellString(row, COL.USE_LIFE) },
    { field: 'main_image', value: getCellString(row, COL.MAIN_IMAGE) },
    { field: 'sizes', value: getCellString(row, COL.SIZES) },
    { field: 'colors', value: getCellString(row, COL.COLORS) }
  ];

  const missing = requiredChecks
    .filter(c => c.value === '')
    .map(c => c.field);

  if (missing.length > 0) {
    return {
      row: rowNumber,
      productName,
      status: 'skipped',
      reason: `Missing required fields: ${missing.join(', ')}`,
      warnings
    };
  }

  // ── Category validation ─────────────────────────────────────────────────────
  const category = getCellString(row, COL.CATEGORY);
  if (!VALID_CATEGORIES.includes(category)) {
    return {
      row: rowNumber,
      productName,
      status: 'skipped',
      reason: `Invalid category "${category}". Must be one of: ${VALID_CATEGORIES.join(', ')}`,
      warnings
    };
  }

  // ── use_life validation ─────────────────────────────────────────────────────
  const useLifeRaw = getCellNumber(row, COL.USE_LIFE);
  if (useLifeRaw === null || !Number.isInteger(useLifeRaw) || useLifeRaw <= 0) {
    return {
      row: rowNumber,
      productName,
      status: 'skipped',
      reason: `use_life must be a positive integer (days), got: "${getCellString(row, COL.USE_LIFE)}"`,
      warnings
    };
  }
  const useLife = useLifeRaw;

  // ── GST validation ──────────────────────────────────────────────────────────
  const gstStr = getCellString(row, COL.GST);
  let gst: number | undefined;
  if (gstStr !== '') {
    const gstVal = parseFloat(gstStr);
    if (isNaN(gstVal) || gstVal < 0 || gstVal > 100) {
      return {
        row: rowNumber,
        productName,
        status: 'skipped',
        reason: `gst must be a number between 0 and 100, got: "${gstStr}"`,
        warnings
      };
    }
    gst = gstVal;
  }

  // ── Sizes and Colors ────────────────────────────────────────────────────────
  const sizes = parseSemicolonList(getCellString(row, COL.SIZES));
  if (sizes.length === 0) {
    return {
      row: rowNumber,
      productName,
      status: 'skipped',
      reason: 'sizes must contain at least one value',
      warnings
    };
  }

  const colors = parseSemicolonList(getCellString(row, COL.COLORS));
  if (colors.length === 0) {
    return {
      row: rowNumber,
      productName,
      status: 'skipped',
      reason: 'colors must contain at least one value',
      warnings
    };
  }

  // ── Price tier validation ───────────────────────────────────────────────────
  const { tiers: priceTiers, error: priceTierError } = validatePriceTiers(row);
  if (priceTierError) {
    return {
      row: rowNumber,
      productName,
      status: 'skipped',
      reason: priceTierError,
      warnings
    };
  }

  // ── Lead time tier validation ───────────────────────────────────────────────
  const { tiers: leadTimeTiers, error: leadTimeError } =
    validateLeadTimeTiers(row);
  if (leadTimeError) {
    return {
      row: rowNumber,
      productName,
      status: 'skipped',
      reason: leadTimeError,
      warnings
    };
  }

  // ── Main image validation ───────────────────────────────────────────────────
  const mainImageFilename = getCellString(row, COL.MAIN_IMAGE);
  const mainImageBuffer = imageFiles.get(mainImageFilename.toLowerCase());

  if (!mainImageBuffer) {
    return {
      row: rowNumber,
      productName,
      status: 'skipped',
      reason: `main_image "${mainImageFilename}" not found in images/ folder of the ZIP`,
      warnings
    };
  }

  const mainMimeType = getMimeType(mainImageFilename);
  if (!mainMimeType) {
    return {
      row: rowNumber,
      productName,
      status: 'skipped',
      reason: `main_image "${mainImageFilename}" has unsupported format. Allowed: jpg, jpeg, png, webp, gif`,
      warnings
    };
  }

  if (mainImageBuffer.length > MAX_IMAGE_SIZE) {
    return {
      row: rowNumber,
      productName,
      status: 'skipped',
      reason: `main_image "${mainImageFilename}" exceeds 10MB limit (${(mainImageBuffer.length / (1024 * 1024)).toFixed(1)}MB)`,
      warnings
    };
  }

  // ── Additional images validation (non-fatal, warn only) ────────────────────
  const additionalImageFilenames = parseSemicolonList(
    getCellString(row, COL.ADDITIONAL_IMAGES)
  );

  const validAdditionalImages: { buffer: Buffer; filename: string; mime: string }[] = [];

  for (const filename of additionalImageFilenames) {
    const buf = imageFiles.get(filename.toLowerCase());
    if (!buf) {
      warnings.push(`additional_image "${filename}" not found in images/ folder — skipped`);
      continue;
    }
    const mime = getMimeType(filename);
    if (!mime) {
      warnings.push(`additional_image "${filename}" has unsupported format — skipped`);
      continue;
    }
    if (buf.length > MAX_IMAGE_SIZE) {
      warnings.push(
        `additional_image "${filename}" exceeds 10MB (${(buf.length / (1024 * 1024)).toFixed(1)}MB) — skipped`
      );
      continue;
    }
    validAdditionalImages.push({ buffer: buf, filename, mime });
  }

  // Enforce max 10 images total (1 main + up to 9 additional)
  const maxAdditional = MAX_IMAGES_PER_PRODUCT - 1;
  if (validAdditionalImages.length > maxAdditional) {
    warnings.push(
      `Only the first ${maxAdditional} additional images are used (10 total max)`
    );
    validAdditionalImages.splice(maxAdditional);
  }

  // ── Upload images ───────────────────────────────────────────────────────────
  let mainImageUrl: string;
  try {
    mainImageUrl = await uploadImageBuffer(
      mainImageBuffer,
      mainImageFilename,
      mainMimeType
    );
  } catch (err) {
    return {
      row: rowNumber,
      productName,
      status: 'skipped',
      reason: `Failed to upload main_image: ${err instanceof Error ? err.message : 'unknown error'}`,
      warnings
    };
  }

  const additionalImageUrls: string[] = [];
  for (const img of validAdditionalImages) {
    try {
      const url = await uploadImageBuffer(img.buffer, img.filename, img.mime);
      additionalImageUrls.push(url);
    } catch {
      warnings.push(`Failed to upload additional_image "${img.filename}" — skipped`);
    }
  }

  // ── Insert product into DB ──────────────────────────────────────────────────
  const supabase = createServiceClient();

  const industryUse = parseSemicolonList(getCellString(row, COL.INDUSTRY_USE));
  const geographicalLocations = parseSemicolonList(
    getCellString(row, COL.GEOGRAPHICAL_LOCATIONS)
  );
  const trainingVideoUrl = getCellString(row, COL.TRAINING_VIDEO_URL);

  const newProduct = {
    ppe_name: getCellString(row, COL.PRODUCT_NAME),
    product_ID: getCellString(row, COL.PRODUCT_ID) || null,
    ppe_category: category,
    sub_category: getCellString(row, COL.SUB_CATEGORY) || null,
    brand_name: getCellString(row, COL.BRAND_NAME),
    description: getCellString(row, COL.DESCRIPTION),
    image: mainImageUrl,
    size: sizes,
    color: colors,
    use_life: useLife,
    industry_use: industryUse.length > 0 ? industryUse : null,
    training_video: trainingVideoUrl || '',
    price: priceTiers.length > 0 ? priceTiers[0].price : null,
    lead_time:
      leadTimeTiers.length > 0
        ? leadTimeTiers.map(t => ({
            qtyFrom: t.qty_from,
            qtyTo: t.qty_to,
            timeInDays: t.days
          }))
        : null,
    gst: gst ?? null,
    hsn_code: getCellString(row, COL.HSN_CODE) || null,
    geographical_location: geographicalLocations.length > 0 ? geographicalLocations : []
  };

  const { data: productData, error: productError } = await supabase
    .from('product')
    .insert(newProduct)
    .select('id')
    .single();

  if (productError || !productData) {
    return {
      row: rowNumber,
      productName,
      status: 'skipped',
      reason: `Database error inserting product: ${productError?.message ?? 'unknown error'}`,
      warnings
    };
  }

  const productId = productData.id;

  // Insert all images into images table (main + additional)
  const allImageUrls = [mainImageUrl, ...additionalImageUrls];
  const imageRecords = allImageUrls.map(url => ({
    image_url: url,
    product_id: productId
  }));

  const { error: imagesError } = await supabase
    .from('images')
    .insert(imageRecords);

  if (imagesError) {
    warnings.push(`Product created but images table insert failed: ${imagesError.message}`);
  }

  // Insert price tiers
  if (priceTiers.length > 0) {
    const tierRecords = priceTiers.map(t => ({
      product_id: productId,
      min_quantity: t.min_quantity,
      max_quantity: t.max_quantity,
      price: t.price
    }));

    const { error: tiersError } = await supabase
      .from('price_tiers')
      .insert(tierRecords);

    if (tiersError) {
      warnings.push(`Product created but price tiers insert failed: ${tiersError.message}`);
    }
  }

  return {
    row: rowNumber,
    productName,
    status: 'success',
    warnings
  };
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // ── Auth check ──────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = await getUserRole();
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // ── Read FormData ───────────────────────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: 'Failed to parse request. Ensure Content-Type is multipart/form-data.' },
      { status: 400 }
    );
  }

  const zipFile = formData.get('zipFile') as File | null;
  if (!zipFile) {
    return NextResponse.json({ error: 'No zipFile provided' }, { status: 400 });
  }

  if (zipFile.size > MAX_ZIP_SIZE) {
    return NextResponse.json(
      { error: `ZIP file exceeds the 100MB limit (${(zipFile.size / (1024 * 1024)).toFixed(1)}MB)` },
      { status: 400 }
    );
  }

  // ── Parse ZIP ───────────────────────────────────────────────────────────────
  const zipArrayBuffer = await zipFile.arrayBuffer();
  const zipBuffer = Buffer.from(zipArrayBuffer);

  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(zipBuffer);
  } catch {
    return NextResponse.json(
      { error: 'Could not read ZIP file. Ensure it is a valid .zip archive.' },
      { status: 400 }
    );
  }

  // ── Find the Excel file ─────────────────────────────────────────────────────
  // Filter out macOS metadata files (__MACOSX/._filename.xlsx)
  const excelFiles = zip.file(/\.xlsx$/i).filter(
    f => !f.name.startsWith('__MACOSX/') && !f.name.split('/').pop()!.startsWith('._')
  );

  if (excelFiles.length === 0) {
    return NextResponse.json(
      { error: 'No .xlsx file found in the ZIP. Upload a ZIP containing your filled template.' },
      { status: 400 }
    );
  }

  if (excelFiles.length > 1) {
    return NextResponse.json(
      { error: `ZIP contains ${excelFiles.length} Excel files. Only one .xlsx file is allowed.` },
      { status: 400 }
    );
  }

  const excelBuffer = Buffer.from(
    await excelFiles[0].async('arraybuffer')
  );

  // ── Parse Excel ─────────────────────────────────────────────────────────────
  let workbook: ExcelJS.Workbook;
  try {
    workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(excelBuffer);
  } catch {
    return NextResponse.json(
      { error: 'Could not parse the Excel file. Ensure it was created using the official template.' },
      { status: 400 }
    );
  }

  const productsSheet =
    workbook.getWorksheet('Products') ??
    workbook.getWorksheet('products') ??
    workbook.worksheets[0];

  if (!productsSheet) {
    return NextResponse.json(
      { error: 'Products sheet not found in the Excel file.' },
      { status: 400 }
    );
  }

  // Build rows array from exceljs (row.values is 1-indexed; index 0 is undefined)
  const rows: unknown[][] = [];
  productsSheet.eachRow(row => {
    const values = (row.values as ExcelJS.CellValue[])
      .slice(1)
      .map(extractCellValue);
    rows.push(values);
  });

  if (rows.length < 1) {
    return NextResponse.json(
      { error: 'Excel file is empty.' },
      { status: 400 }
    );
  }

  // ── Validate headers ────────────────────────────────────────────────────────
  const headerRow = rows[0].map(h => String(h ?? '').trim().toLowerCase());
  const expectedHeaders = BULK_UPLOAD_HEADERS.map(h => h.toLowerCase());
  const mismatched = expectedHeaders.filter((h, i) => headerRow[i] !== h);

  if (mismatched.length > 0) {
    return NextResponse.json(
      {
        error: `Excel headers do not match the template. Mismatched columns: ${mismatched.join(', ')}. Please use the official downloaded template.`
      },
      { status: 400 }
    );
  }

  // ── Extract image files from images/ folder in ZIP ──────────────────────────
  const imageFiles = new Map<string, Buffer>();

  const imagesFolder = zip.folder('images');
  if (imagesFolder) {
    const imageEntries: Promise<void>[] = [];
    imagesFolder.forEach((relativePath, file) => {
      const filename = relativePath.split('/').pop() ?? relativePath;
      // Skip macOS metadata files
      if (!file.dir && !filename.startsWith('._') && !relativePath.startsWith('__MACOSX/')) {
        const entry = file.async('nodebuffer').then(buf => {
          imageFiles.set(filename.toLowerCase(), buf);
        });
        imageEntries.push(entry);
      }
    });
    await Promise.all(imageEntries);
  }

  // ── Process data rows (skip header row 0) ───────────────────────────────────
  const dataRows = rows.slice(1).filter(row => {
    // Skip completely empty rows
    const firstCell = getCellString(row as unknown[], 0);
    return firstCell !== '';
  });

  if (dataRows.length === 0) {
    return NextResponse.json(
      { error: 'No product rows found in the Excel file. Add at least one product row.' },
      { status: 400 }
    );
  }

  const results: RowResult[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const result = await processRow(
      dataRows[i] as unknown[],
      i + 2, // +2 because row 1 is headers, data starts at row 2
      imageFiles
    );
    results.push(result);
  }

  const successCount = results.filter(r => r.status === 'success').length;
  const skippedCount = results.filter(r => r.status === 'skipped').length;

  return NextResponse.json({
    success: true,
    totalRows: dataRows.length,
    successCount,
    skippedCount,
    results
  });
}
