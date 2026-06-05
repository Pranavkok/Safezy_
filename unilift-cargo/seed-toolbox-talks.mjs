/**
 * Seed script: uploads toolbox talk PDFs to Supabase Storage and inserts
 * records into ehs_toolbox_talk.
 *
 * Usage:
 *   node seed-toolbox-talks.mjs
 *
 * Reads credentials from unilift-cargo/.env
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- Load .env ---
function loadEnv() {
  const envPath = join(__dirname, '.env');
  const raw = readFileSync(envPath, 'utf-8');
  const vars = {};
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    vars[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return vars;
}

const env = loadEnv();
const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL'];
const SERVICE_KEY = env['SUPABASE_SERVICE_ROLE_KEY'];
const BUCKET = 'toolbox_talk_pdfs';
const FOLDER = 'pdfs';

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// --- Toolbox talk definitions ---
// Each entry: { file, topic }
// Duplicates (road_safety, mentor_and_mantee) deduplicated — using the double-underscore variant.
const TOOLBOX_TALKS = [
  {
    file: '/Users/pranav/Downloads/toolbox__electrical_safety.pdf',
    topic: 'Electrical Safety',
  },
  {
    file: '/Users/pranav/Downloads/toolbox__road_safety.pdf',
    topic: 'Road Safety',
  },
  {
    file: '/Users/pranav/Downloads/toolbox_loto_v_and_11_steps_of_isolation.pdf',
    topic: 'LOTO V and 11 Steps of Isolation',
  },
  {
    file: '/Users/pranav/Downloads/toolbox_talk _lifting_tools_and_tackles.pdf',
    topic: 'Lifting Tools and Tackles',
  },
  {
    file: '/Users/pranav/Downloads/toolbox_talk machine_guarding_.pdf',
    topic: 'Machine Guarding',
  },
  {
    file: '/Users/pranav/Downloads/toolbox_talk welding_job_safety.pdf',
    topic: 'Welding Job Safety',
  },
  {
    file: '/Users/pranav/Downloads/toolbox_talk__5s_system.pdf',
    topic: '5S System',
  },
  {
    file: '/Users/pranav/Downloads/toolbox_talk__bbs_(behavior_based_safety).pdf',
    topic: 'BBS (Behavior Based Safety)',
  },
  {
    file: '/Users/pranav/Downloads/toolbox_talk__fire.pdf',
    topic: 'Fire Safety',
  },
  {
    file: '/Users/pranav/Downloads/toolbox_talk__local_emergency_.pdf',
    topic: 'Local Emergency',
  },
  {
    file: '/Users/pranav/Downloads/toolbox_talk__mentor_and_mantee.pdf',
    topic: 'Mentor and Mentee',
  },
  {
    file: '/Users/pranav/Downloads/toolbox_talk__molten_mental_safety.pdf',
    topic: 'Molten Metal Safety',
  },
  {
    file: '/Users/pranav/Downloads/toolbox_talk__ppes.pdf',
    topic: 'PPEs (Personal Protective Equipment)',
  },
  {
    file: '/Users/pranav/Downloads/toolbox_talk__safety_precaution_during_other_area_and_remote_area.pdf',
    topic: 'Safety Precaution During Other Area and Remote Area',
  },
  {
    file: '/Users/pranav/Downloads/toolbox_talk__sustainability_policy.pdf',
    topic: 'Sustainability Policy',
  },
  {
    file: '/Users/pranav/Downloads/toolbox_talk_safety_standard.pdf',
    topic: 'Safety Standard',
  },
  {
    file: '/Users/pranav/Downloads/toolbox_talk_sops_and_smps.pdf',
    topic: 'SOPs and SMPs',
  },
  {
    file: '/Users/pranav/Downloads/toolbox_vehicle_and_driving.pdf',
    topic: 'Vehicle and Driving',
  },
];

async function run() {
  let success = 0;
  let failed = 0;

  for (const talk of TOOLBOX_TALKS) {
    if (!existsSync(talk.file)) {
      console.warn(`  SKIP (file not found): ${talk.file}`);
      failed++;
      continue;
    }

    const fileName = `${Date.now()}_${basename(talk.file)}`;
    const storagePath = `${FOLDER}/${fileName}`;

    console.log(`\nProcessing: ${talk.topic}`);

    // 1. Upload PDF to storage
    const fileBuffer = readFileSync(talk.file);
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (uploadError) {
      console.error(`  UPLOAD FAILED: ${uploadError.message}`);
      failed++;
      continue;
    }

    // 2. Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storagePath);

    const pdfUrl = urlData.publicUrl;
    console.log(`  Uploaded → ${pdfUrl}`);

    // 3. Insert DB record
    const { error: insertError } = await supabase
      .from('ehs_toolbox_talk')
      .insert({
        topic_name: talk.topic,
        pdf_url: pdfUrl,
        description: '',
        summarized: '',
      });

    if (insertError) {
      console.error(`  DB INSERT FAILED: ${insertError.message}`);
      failed++;
      continue;
    }

    console.log(`  Inserted into ehs_toolbox_talk ✓`);
    success++;
  }

  console.log(`\n--- Done: ${success} inserted, ${failed} failed ---`);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
