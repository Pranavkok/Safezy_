/**
 * One-time migration script: recreates missing auth.users accounts for users
 * who exist in the public.users table but have no corresponding auth account.
 *
 * Run: npx ts-node --project tsconfig.json scripts/fix-missing-auth-accounts.ts
 *
 * After this runs, affected users must use "Forgot Password" to set a new password.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// All users from: SELECT id, email, auth_id FROM users LEFT JOIN auth.users ... WHERE auth.users.id IS NULL
const AFFECTED_USERS = [
  { id: '371413fb-c108-45cd-866c-b484dbe89260', email: 'pranay.aggarwal1@gmail.com' },
  { id: '8c9a5397-9b6d-4e6c-b451-1f5d03d8a689', email: 'aatish.zarapkar@uniliftcargo.com' },
  { id: '864e994b-df26-4c21-831d-faa9576e6d0c', email: 'rahulkrojha@gmail.com' },
  { id: 'c75cb901-5c1e-4906-844c-cd32723510aa', email: 'ravi.fallprotection@gmail.com' },
  { id: 'f002e3ad-ab09-4199-abb4-ed9a10b778c4', email: 'deepak.bhavsar@uniliftcargo.com' },
  { id: 'a81d5ee5-ca53-4e24-81bd-4157e19a6ab2', email: 'consultant1548@gmail.com' },
  { id: 'ea7ccc2b-474b-428a-a118-98b467749309', email: 'lancy.fernandes@uniliftcargo.com' },
  { id: 'ac37a14e-9bfd-4ffe-a4a3-83b44b81402f', email: 'lancy.fernandes@unilift.com' },
  { id: '71a7c2e6-c3a8-42b2-a2a9-e7f81ffa5ade', email: 'avneeshdubey527@gmail.com' },
  { id: 'e9d7f7c1-6015-41fe-b8a8-f1b161a37c83', email: 'rishitachhajer02@gmail.com' },
  { id: '805d71fe-23fa-422e-bfa9-9cfdd274ffb9', email: 'kgadhvi7777@gmail.com' },
  { id: '2b43385d-ccfd-465f-832c-e6cf203b751f', email: 'sovereign.ai23@gmail.com' },
  { id: '9fda5cda-111f-4cba-b939-37bfe3abacec', email: 'Anuragbandewar19@gmail.com' },
  { id: '75f33581-108d-4455-8be7-79ca302cf08c', email: 'gouranga.adhikari@uniliftcargo.com' },
  { id: 'af5369e9-6fad-42de-a11c-162341a0b75f', email: 'hiteshsinhjethva44@gmail.com' },
  { id: 'd33d8a59-9a59-4496-85d7-a9a033efc4ee', email: 'himanshu.verma@uniliftcargo.com' },
  { id: '88a4b645-4b2b-4837-816c-cfd9ca2f2caf', email: 'sanjeev277121@gmail.com' },
  { id: '43f2b9f2-f36f-4e34-8beb-876ae8ef9c43', email: 'pragyanraj.das@uniliftcargo.com' },
  { id: '55c51851-578c-40da-829e-e6dbdf170abb', email: 'sanjay.rajput@uniliftcargo.com' },
  { id: '913706e2-fd5d-485a-b5ef-294819086324', email: 'abhijitmaity08@gmail.com' },
  { id: '88b659e2-a789-4837-a354-819e9de4001b', email: 'dshah3157@gmail.com' },
  { id: '5ef146a1-e939-471d-8b0d-146a2e649f9a', email: 'vivek.sonawane@uniliftcargo.com' },
  { id: '6a25fb31-f8cf-48ee-9fd0-f4b30210c141', email: 'shaurab168@gmail.com' },
  { id: '1287b5b6-18af-4009-bff4-5d1b8ed6b929', email: 'sejalsabale1201@gmail.com' },
  { id: '4f833f0a-5a2e-4646-a98b-7fc029ffc301', email: 'chakku1227@gmail.com' },
  { id: '3434c57c-2917-4d00-b4b1-ac2b98a99568', email: 'jitendra.choudhary@uniliftcargo.com' },
  { id: '2af07b06-75cc-4bef-961b-0d00b7cf05e3', email: 'divya.shelar@uniliftcargo.com' },
  { id: '00e3f94c-71d6-41b4-bd94-bcba2965bf68', email: 'satendra.pandey@uniliftcargo.com' },
  { id: '0a6123c3-a07b-4bd5-9c37-6d9ae9686bbe', email: 'reyazahmad5372@gmail.com' },
  { id: '4b9a6d83-c76e-40a0-81df-0894117fc51d', email: 'rajpal.shekhawt@uniliftcargo.com' },
  { id: 'df78ea1d-ace4-4b4e-9fa4-3ac9f67288a6', email: 'Mukesh.singh@uniliftcargo.com' },
  { id: 'd311e077-706d-4117-b8bf-2ffe46a2d408', email: 'sinod.prajapati@unilftcargo.com' },
  { id: 'da6fcb9d-b5d5-49e1-9d26-cd27f80d1a57', email: 'dasharghya@gmail.com' },
  { id: 'fd6d4b17-29a7-48d7-8c50-36520f8fb4f8', email: 'avinandan.sharma235@gmail.com' },
  { id: '60ba217b-f0bd-4cc5-8421-a30d4a54dd0c', email: 'prayashminz@gmail.com' },
  { id: '33242a84-b613-4d56-a182-206dec3a7934', email: 'mukleshprasadsah@gmail.com' },
  { id: '0ed02670-0a95-4de7-94f4-a17445d363c1', email: 'priyodarsi91@gmail.com' },
  { id: 'c2fe8392-ed6b-4604-9083-0a6ced755c24', email: 'mafatlalparekh71@gmail.com' },
  { id: '1c38c682-d070-422e-ab5f-af786fbd887c', email: 'soma.mohanty@uniliftcargo.com' },
  { id: 'db7c22e8-931e-4d80-a682-bee35ac2019e', email: 'sinod.com4@gmail.com' },
  { id: 'a406d2d0-3c7e-4838-9a38-fed61f42de98', email: 'govind.bhargav@uniliftcargo.com' },
  { id: '61700f59-58dc-46b0-b0ae-dd56bf055f5a', email: 'chavdashrenik@gmail.com' },
  { id: '11c5b5b7-c1c7-4ad9-83f7-f1635d710477', email: 'dharmraj.varma@uniliftcargo.com' },
  { id: '087d044b-ae3c-47bf-b3f7-9a03f9ac7f69', email: 'surajdubeyssm@gmail.com' },
  { id: '894e1890-c468-4e0d-9c79-d8d29d1b1607', email: 'info@zeropublicity.com' },
  { id: '51662f90-b0d3-425a-819d-fe91179538ab', email: 'sales.commercial@uniliftcargo.com' },
  { id: 'c2e02ab2-b913-43ec-b691-94d29d87ea16', email: 'Anuragbandewar19@gmaip.com' },
  { id: 'e039a03d-00e9-4bf0-9ece-e136a664b1f8', email: 'mishalrajput1997@gmail.com' },
  { id: '4dd427cb-5075-4d97-95cc-edd08e603b9e', email: 'rajiv.soni@uniliftcargo.com' },
  { id: '836a96cb-d128-4783-adb9-2ec42093291d', email: 'rudra.godhani@propelius.tech' },
  { id: 'bcabc179-fe3e-49c9-964f-51ee55200186', email: 'pranav.kryptmedia@gmail.com' },
  { id: '42134f7a-d70e-4f99-ae6a-acd9a77a119f', email: 'propeliusdev@yopmail.com' },
  { id: 'd54d0da4-27b0-4145-9bc9-fa7413572a19', email: 'mayank.patel@uniliftcargo.com' },
  { id: '011305c8-9fda-4912-89bb-37456717d7eb', email: 'nimitcompany@yopmail.com' },
  { id: 'f64239d4-ef94-4562-a144-2b59dbb0c8f0', email: 'hemangk@godeepak.com' },
  { id: '49149a58-da3c-4f0b-8f10-0c37711dd50e', email: 'Jessica@bbsafetyindia.com' },
  { id: 'dcb91534-557f-4add-bbf8-8b63c9b9f136', email: 'DEEPAK.SETHI@STRATXG.COM' },
  { id: '2f7ce3dc-a019-4c32-b881-591c67ddf79b', email: 'amitkumarsah.mzp@gmail.com' },
  { id: '8664c75e-9943-4650-9514-f6646f5d03ca', email: 'ajayj19swal@gmail.com' },
  { id: 'e602101f-0521-4f70-a862-7a05b7f38438', email: 'Rohit.patkar@everestind.com' },
  { id: '1d99e7c8-d2b1-46f5-af91-46eda84ade97', email: 'mdongare1188@gmail.com' },
  { id: '10b80f5c-3e20-4daa-af8a-c463e4426cf0', email: 'Pranay.koli@cushwake.com' },
  { id: 'c7940141-e34e-49d4-967f-fc9bf9bc8ff5', email: 'anirudhaarakh21@gmail.com' },
  { id: '76356aae-b73b-43f2-96ba-a04b7d8f9c38', email: 'priyakapse48@gmail.com' },
  { id: '9efa1a50-2fde-48cc-8560-19cedaf61f71', email: 'sharibjet@gmail.com' },
  { id: '8fd89e1b-5515-4ebf-addc-0e3dc9ebaf33', email: 'gyanswain0@gmail.com' },
  { id: 'f4d0e26d-434b-49ce-80e4-e679012addab', email: 'vishramteli777@gmail.com' },
  { id: '5c751adf-50bc-4d36-82a2-90424e82d8db', email: 'CHANDAN985244765@gmail.com' },
  { id: '712ea3ef-d0a3-4925-91f9-7fd926213fd0', email: 'shaikhshabaaz00@gmail.com' },
  { id: 'c14f7304-b824-4210-bb5e-7395623ec934', email: 'gopili.ganpati@eroselevators.com' },
  { id: 'fc42536b-160e-4c5a-8664-e2e468c05a58', email: 'Jomy.thomas@eroselevators.com' },
  { id: '0b6a54eb-babe-466d-abb6-61249cb37e10', email: 'manikandan24mi@gmail.com' },
  { id: '61004e97-54ec-4073-bb72-eff3a3d1a98c', email: 'amitatah@gmail.com' },
  { id: 'ce8a261a-5f87-4769-b1f5-f6b1a8762340', email: 'anjalipandey40582@gmail.com' },
  { id: 'e3d55827-f042-47a0-952e-ccaa32a73d2c', email: 'yasirmirkar12@gmail.com' },
  { id: 'd6c92111-76df-448b-a51e-1e145faeec90', email: 'rutikvichare00@gmail.com' },
  { id: '1ad0f03f-f2bb-4d2a-b037-1c28e2a8fe99', email: 'anand.mohanty@eroselevetors.com' },
  { id: '1515ad59-fa8c-492e-b952-44d22986ad0e', email: 'muliksagar42@gmail.com' },
  { id: '11604e56-7804-4189-834d-3bf2a98b580e', email: 'tsathe@radiancerenewables.com' },
  { id: 'e47c4fdd-a7d7-4b15-b094-b98a9dee0898', email: 'anilmanigkp6@gmail.com' },
  { id: 'a61179b9-c5f8-4956-95ca-bae96cba2115', email: 'Bajaprajapati11@gmail.com' },
  { id: '32c56da1-4b31-4e8d-9f20-a010424b3f11', email: 'Ashish91.mallick@gmail.com' },
  { id: 'e1770261-e256-4f8f-bff2-047b210d6491', email: 'satishsidar794@gmail.com' },
  { id: '44890447-7f48-4f4c-aca9-d7ade8fad8ca', email: 'prince.sharma@uniliftcargo.com' },
  { id: '7b230987-24f1-4ce5-967b-b560639d642c', email: 'nimit.admin@yopmail.com' },
  { id: '72b0af1e-926b-4661-87dc-d57e6786974a', email: 'swifteeg@gmail.com' },
  { id: 'c9418ec4-6819-4f26-99be-60b6372d6fa4', email: 'subodh09122@gmail.com' },
  { id: 'c3e313fa-9ec7-4766-8818-ac55babdfb4a', email: 'vikas.kmahajan@gmail.com' },
  { id: '160f21d0-7b8c-40c4-b793-2b94a4f9482a', email: 'amanrajbhar126@gmail.com' },
  { id: 'fcd5c17e-f667-4e9c-ae67-ae2af29282ed', email: 'sinod.prajapati@uniliftcargo.com' },
  { id: '5dd8c818-bc4f-42f6-9a75-95ff02345499', email: 'Swapnilchaudhari27@yahoo.com' },
  { id: '1b9a0362-61ea-4e58-bd70-d79be25797b9', email: 'hitesh11mumbai@gmail.com' },
  { id: '7093cdcb-aa08-487d-8f9d-8ba974930136', email: 'jwalantb@gmail.com' },
  { id: 'c1c57939-4419-441d-841a-85de57d7e8aa', email: 'divyanshi.varde@propelius.tech' },
  { id: '5f5a5d74-c6c4-43dc-a588-21d7fabf183f', email: 'safety.nayara@uniliftcargo.com' },
  { id: '676a74f5-0520-414c-b4de-e3f2398a6cc1', email: 'corpseek.ai25@gmail.com' },
  { id: 'eaaeb76d-756f-4d13-b246-01c75d19bb15', email: 'Subodhmw121@gmail.com' },
  { id: '2e72d33b-6a1b-41f8-b3cd-dad47564e7c1', email: 'sanjay.maity@uniliftcargo.com' },
  { id: 'eca2ae96-dc43-4bfb-a3e0-9c2265882b3e', email: 'bugudeteja97@gmail.com' },
  { id: 'c9c92446-4ecd-48cf-ab20-a4f3309010d7', email: 'jagadeeshabhi888@gmail.com' },
  // dhhilton4@gmail.com — confirmed missing from auth.users
  { id: '3ee3526a-17d7-4cda-bd31-e2de5b41590e', email: 'dhhilton4@gmail.com' },
];

async function fixMissingAuthAccounts() {
  let fixed = 0;
  let failed = 0;

  for (const user of AFFECTED_USERS) {
    // Normalize email to lowercase to avoid case mismatch issues
    const email = user.email.toLowerCase();

    // Create new auth account (email_confirm: true so forgot-password works immediately)
    const { data, error: createError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
    });

    if (createError) {
      // If the user already exists in auth (e.g. from a prior partial run), skip
      if (createError.message.includes('already been registered')) {
        console.log(`[SKIP] ${email} — already exists in auth.users`);
        continue;
      }
      console.error(`[FAIL] ${email} — ${createError.message}`);
      failed++;
      continue;
    }

    const newAuthId = data.user.id;

    // Update auth_id in public.users to point to the new auth account
    const { error: updateError } = await supabase
      .from('users')
      .update({ auth_id: newAuthId })
      .eq('id', user.id);

    if (updateError) {
      console.error(`[FAIL] update auth_id for ${email} — ${updateError.message}`);
      failed++;
      continue;
    }

    console.log(`[OK] ${email} -> new auth_id: ${newAuthId}`);
    fixed++;
  }

  console.log(`\nDone. Fixed: ${fixed}, Failed: ${failed}`);
  console.log('Affected users can now use "Forgot Password" to set a new password.');
}

fixMissingAuthAccounts().catch(console.error);
