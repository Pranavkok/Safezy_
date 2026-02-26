# Unilift Cargo Backend

A Supabase-based backend application for Unilift Cargo, providing database management, authentication, edge functions, and API services.

## Prerequisites

Before you begin, ensure you have the following installed:

- Supabase CLI: [Installation Guide](https://supabase.com/docs/guides/cli/getting-started)
- Docker: Required for running Supabase locally ([Install Docker](https://docs.docker.com/get-docker/))
- Node.js (optional): For any additional tooling
- Git: For version control

### Installing Supabase CLI

bash
# macOS
brew install supabase/tap/supabase

# Linux
npm install -g supabase

# Windows
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase


## Installation

1. Clone the repository
   bash
   git clone <repository-url>
   cd unilift-cargo-BE
   

2. Verify Supabase CLI installation
   bash
   supabase --version
   

3. Start Docker Desktop (if not already running)

4. Initialize and start Supabase locally
   bash
   supabase start
   
   This command will:
   - Pull the necessary Docker images
   - Start all Supabase services (PostgreSQL, API, Auth, Storage, etc.)
   - Run all database migrations
   - Seed the database (if seed.sql exists)

## Configuration

The main configuration file is located at `supabase/config.toml`. This file contains settings for:

- API: Port 54321
- Database: PostgreSQL 15 on port 54322
- Studio: Supabase Studio on port 54323
- Auth: Authentication settings
- Storage: File storage configuration
- Edge Functions: Deno runtime configuration
- Email Testing: Inbucket on port 54324

### Default Ports

| Service | Port | URL |
|---------|------|-----|
| API | 54321 | http://localhost:54321 |
| Database | 54322 | postgresql://postgres:postgres@localhost:54322/postgres |
| Studio | 54323 | http://localhost:54323 |
| Inbucket (Email) | 54324 | http://localhost:54324 |
| SMTP | 54325 | localhost:54325 |
| Analytics | 54327 | http://localhost:54327 |

## Running the Project

### Start Supabase Services

bash
supabase start


After starting, you'll see output with:
- API URL
- Database connection string
- Studio URL
- Anon key and Service role key

### Stop Supabase Services

bash
supabase stop


### Reset Database

To reset the database and re-run all migrations:

bash
supabase db reset


This will:
- Drop all tables
- Re-run all migrations in order
- Re-seed the database

## Project Structure


unilift-cargo-BE/
├── supabase/
│   ├── config.toml              # Supabase configuration file
│   ├── seed.sql                 # Database seed data
│   ├── .gitignore              # Git ignore rules
│   │
│   ├── migrations/             # Database migration files
│   │   ├── 20240924085032_User.sql
│   │   ├── 20240924085109_Worksite.sql
│   │   ├── 20240924085128_Address.sql
│   │   ├── 20240924085152_Product.sql
│   │   ├── 20240924085244_Transaction.sql
│   │   ├── 20240924085302_Order.sql
│   │   ├── 20240924085327_Order_Items.sql
│   │   ├── 20240924085348_Cart_Items.sql
│   │   ├── 20240924085432_Employee.sql
│   │   ├── 20240924085456_Complaint.sql
│   │   ├── 20240924085525_Price_Tiers.sql
│   │   ├── 20240924085557_Product_Inventory.sql
│   │   ├── 20241209112650_Contact.sql
│   │   ├── 20241209113113_Images.sql
│   │   ├── 20241209113331_Product_History.sql
│   │   ├── 20241209114254_Product_Rating.sql
│   │   ├── 20241209115909_User_Roles.sql
│   │   ├── 20250108124057_EHS_News.sql
│   │   ├── 20250109060950_EHS_Toolbox_Talk.sql
│   │   ├── 20250109123748_Buckets.sql
│   │   ├── 20250115115028_EHS_Checklist_Topics.sql
│   │   ├── 20250115122153_EHS_Checklist_Questions.sql
│   │   ├── 20250115122556_EHS_Checklist_Users.sql
│   │   ├── 20250120084202_EHS_Toolbox_Users.sql
│   │   ├── 20250120121148_EHS_Incident_Analysis.sql
│   │   ├── 20250120125233_Videos.sql
│   │   ├── 20250121093810_Changes.sql
│   │   ├── 20250121114531_EHS_First_Principles.sql
│   │   ├── 20250204120809_EHS_Checklist_Done_Questions.sql
│   │   ├── 20250205130105_EHS_Suggestions.sql
│   │   ├── 20250213060202_Functions.sql
│   │   ├── 20250307085015_EHS_Toolbox_Notes.sql
│   │   ├── 20250403095538_Updated_EHS_Incident_Analysis.sql
│   │   ├── 20250411045158_Updated_Order_And_Order_Items.sql
│   │   ├── 20250411090048_Updated_Order.sql
│   │   ├── 20250415124208_Updated_EHS_Incident_Analysis.sql
│   │   ├── 20250416085744_Modified_EHS_Incident_Analysis.sql
│   │   ├── 20250417051622_Modified_EHS_Toolbox_Talk.sql
│   │   ├── 20250514074540_Updated_Users.sql
│   │   ├── 20250807083034_Blogs.sql
│   │   ├── 20250807095625_blogs_bucket.sql
│   │   ├── 20250808090829_Modified_Blogs.sql
│   │   ├── 20250813111912_blog_subscribers.sql
│   │   ├── 20250814132855_Modified_blog_subscribers.sql
│   │   └── 20251103071232_Modified_User_Contact.sql
│   │
│   ├── functions/              # Edge Functions (Deno)
│   │   └── send-email/
│   │       └── index.ts        # Email sending function
│   │
│   └── templates/              # Email templates
│       ├── confirmation.html   # Email confirmation template
│       └── invite.html         # Invitation email template
│
└── README.md                   # This file


## Database Migrations

Migrations are SQL files that define the database schema. They are executed in chronological order based on their timestamp prefix.

### Key Database Tables

The database includes the following main entities:

#### Core E-commerce
- users: User accounts and profiles
- products: Product catalog
- orders: Order management
- order_items: Order line items
- cart_items: Shopping cart items
- transactions: Payment transactions
- price_tiers: Pricing tiers
- product_inventory: Inventory management
- product_history: Product change history
- product_rating: Product ratings

#### EHS (Environmental Health & Safety)
- ehs_news: EHS news articles
- ehs_toolbox_talk: Toolbox talk sessions
- ehs_toolbox_users: Toolbox talk participants
- ehs_toolbox_notes: Toolbox talk notes
- ehs_checklist_topics: Checklist topics
- ehs_checklist_questions: Checklist questions
- ehs_checklist_users: Checklist assignments
- ehs_checklist_done_questions: Completed checklist items
- ehs_incident_analysis: Incident analysis records
- ehs_first_principles: EHS first principles
- ehs_suggestions: EHS suggestions

#### Other Features
- worksites: Worksite locations
- addresses: Address management
- employees: Employee records
- complaints: Complaint tracking
- contacts: Contact information
- images: Image storage references
- user_roles: User role assignments
- videos: Video content
- changes: Change log
- blogs: Blog posts
- blog_subscribers: Blog subscription management
- buckets: Storage buckets

### Creating a New Migration

bash
supabase migration new <migration_name>


This creates a new migration file with a timestamp prefix. Edit the file and add your SQL statements.

### Applying Migrations

Migrations are automatically applied when you run `supabase start` or `supabase db reset`. To apply migrations manually:

bash
supabase db reset


## Edge Functions

Edge Functions are serverless functions written in TypeScript/JavaScript using Deno runtime.

### Available Functions

#### send-email

Sends emails using nodemailer and Gmail SMTP.

Location: `supabase/functions/send-email/index.ts`

### Creating a New Edge Function

bash
supabase functions new <function-name>

This creates a new function directory in `supabase/functions/`.

### Testing Edge Functions Locally

bash
supabase functions serve <function-name>

## Environment Variables

### Required for Edge Functions

Create a `.env` file in the `supabase` directory (it's already in `.gitignore`):


### Setting Environment Variables for Edge Functions

For local development, create a `.env` file in the `supabase` directory. For production, set environment variables in your Supabase project dashboard.

To set secrets for edge functions:

bash
supabase secrets set SMTP_USERNAME=your-email@gmail.com
supabase secrets set SMTP_PASSWORD=your-app-password


## Development Workflow

### 1. Starting Development

bash
# Start Supabase services
supabase start

# Access Supabase Studio
# Open http://localhost:54323 in your browser


### 2. Making Database Changes

1. Create a new migration:
   bash
   supabase migration new <description>
   

2. Edit the migration file in `supabase/migrations/`

3. Test the migration:
   bash
   supabase db reset
   

### 3. Testing Edge Functions

1. Serve the function locally:
   bash
   supabase functions serve send-email
   

2. Test with curl or your API client

### 4. Viewing Logs

bash
# View all logs
supabase logs

# View logs for a specific service
supabase logs --type edge-runtime


## Useful Commands

bash
# Start Supabase
supabase start

# Stop Supabase
supabase stop

# Check status
supabase status

# Reset database (drops all data and re-runs migrations)
supabase db reset

# Create a new migration
supabase migration new <name>

# Generate TypeScript types from database
supabase gen types typescript --local > types/database.types.ts

# Link to remote project
supabase link --project-ref <project-ref>

# Pull remote database schema
supabase db pull

# Push local migrations to remote
supabase db push

# View logs
supabase logs

# Serve edge function locally
supabase functions serve <function-name>

# Deploy edge function
supabase functions deploy <function-name>
   

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Database Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Local Development Guide](https://supabase.com/docs/guides/cli/local-development)
