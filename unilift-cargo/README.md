## 🚀 Overview

Safezy is a full-stack application designed for managing workplace safety equipment, EHS (Environmental, Health & Safety) compliance, and contractor/employee management. The platform serves multiple user roles including Admins, Contractors, Principal Employers, and Warehouse Operators.

### Key Features

- 🎯 Multi-Role Dashboards: Separate interfaces for Admin, Contractor, Principal Employer, and Warehouse Operator
- 🛒 E-Commerce Platform: Complete product catalog with cart and order management
- 📱 Mobile App Support: Native Android and iOS apps via Capacitor
- 🏗️ Equipment Management: Track and manage workplace safety equipment
- 👷 Employee & Worksite Management: Comprehensive workforce and location tracking
- 📋 EHS Compliance: Checklists, toolbox talks, incident analysis, and safety news
- 📊 Order Management: Full order lifecycle from placement to delivery
- 📝 Blog System: Content management for safety articles and updates
- 🔐 Authentication: Secure login with OTP verification and password reset

## 🛠️ Tech Stack

### Frontend

- Framework: Next.js 14.2.11 (App Router)
- Language: TypeScript 5
- Styling: Tailwind CSS 3.4.1
- UI Components: Radix UI primitives
- State Management: React Context API, TanStack Query
- Form Handling: React Hook Form + Zod validation
- PDF Generation: React PDF Renderer
- Charts: Recharts

### Backend

- Database: Supabase
- Authentication: Supabase Auth with SSR support
- Email: Nodemailer
- AI Integration: OpenAI API

### Mobile

- Framework: Capacitor 6.2.0
- Platforms: Android & iOS
- Plugins: File Opener, Filesystem, Device, Keyboard, Status Bar, Splash Screen

### Development Tools

- Linting: ESLint + Prettier
- Git Hooks: Husky + lint-staged
- Package Manager: Yarn 1.22.22

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js: v18 or higher
- Yarn: v1.22.22 (specified in package manager)
- Git: Latest version
- Android Studio: For Android development (optional)
- Xcode: For iOS development (macOS only, optional)

## 🚀 Getting Started

### 1. Clone the Repository

bash
git clone <repository-url>
cd unilift-cargo

### 2. Install Dependencies

bash
yarn install

### 3. Run Development Server

bash
yarn dev

## 📱 Mobile Development

### Android

1. Sync Capacitor with Android:
   bash
   yarn run-android

2. Open in Android Studio (if needed):
   bash
   npx cap open android
   
3. Update the server URL in `capacitor.config.ts`:
   typescript
   server: {
     url: 'http://YOUR_LOCAL_IP:3000',
     cleartext: true
   }

### iOS

1. Sync Capacitor with iOS:

   bash
   yarn run-ios

2. Open in Xcode (if needed):
   bash
   npx cap open ios
   
Note: iOS development requires macOS with Xcode installed.

## 📁 Project Structure

unilift-cargo/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (public)/          # Public pages (home, about, blog, etc.)
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── contractor/        # Contractor dashboard pages
│   │   ├── principal-employer/# Principal Employer pages
│   │   ├── warehouse-operator/# Warehouse Operator pages
│   │   └── api/               # API routes
│   ├── actions/               # Server actions
│   │   ├── admin/
│   │   ├── contractor/
│   │   ├── principal-employer/
│   │   ├── warehouse-operator/
│   │   └── auth.ts
│   ├── components/            # React components
│   │   ├── ui/               # Shadcn UI components
│   │   ├── modals/           # Modal dialogs
│   │   ├── navbar/           # Navigation components
│   │   ├── sidebar/          # Sidebar components
│   │   └── ...
│   ├── sections/             # Page sections
│   ├── layouts/              # Layout components
│   ├── constants/            # App constants and routes
│   ├── context/              # React Context providers
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility libraries
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Utility functions
│   ├── validations/          # Zod validation schemas
│   └── middleware.ts         # Next.js middleware
├── public/                   # Static assets
├── android/                  # Android app files
├── ios/                      # iOS app files
├── assets/                   # App icons and splash screens
├── capacitor.config.ts       # Capacitor configuration
├── next.config.mjs           # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── package.json              # Project dependencies

## 🎭 User Roles & Access

### Admin

- Full system access
- Product management (add, update, delete)
- Order management and tracking
- Contractor verification and management
- Warehouse operator management
- EHS content management (news, checklists, toolbox talks)
- Blog management
- Complaints handling

### Contractor

- Dashboard with analytics
- Equipment and employee management
- Worksite management
- Order placement and tracking
- Assignment management
- Equipment assignment to employees
- EHS resources access
- Notifications

### Principal Employer

- Employee oversight
- Equipment tracking
- Order management
- Assignment monitoring
- Compliance tracking

### Warehouse Operator

- Order fulfillment
- Inventory management
- Shipment tracking

## 📝 Available Scripts

| Script             | Description                               |
| ------------------ | ----------------------------------------- |
| `yarn dev`         | Start development server                  |
| `yarn build`       | Build production application with sitemap |
| `yarn start`       | Start production server                   |
| `yarn lint`        | Run ESLint                                |
| `yarn tsc`         | Type check without emitting files         |
| `yarn format`      | Check code formatting                     |
| `yarn format:fix`  | Fix code formatting                       |
| `yarn run-android` | Sync and run Android app                  |
| `yarn run-ios`     | Sync and run iOS app                      |
| `yarn site-map`    | Generate sitemap                          |

## 🔒 Authentication Flow

1. User registers with email (separate flows for Contractor and Principal Employer)
2. OTP verification via email
3. Password setup/reset capability
4. JWT-based session management with Supabase
5. Role-based access control via middleware

## 🛒 E-Commerce Features

### Product Categories

- Head Protection
- Hand Protection
- Leg Protection
- Fall Protection
- Eye Protection
- Face Protection
- Respiratory Protection

### Order Flow

1. Browse products by category
2. Add to cart
3. Review cart and checkout
4. Order confirmation email
5. Admin/Warehouse processing
6. Delivery tracking
7. Order history and invoice download

## 📊 EHS (Environment, Health & Safety) Module

- Checklists: Safety compliance checklists with completion tracking
- Toolbox Talks: Safety training content and sessions
- First Principles: Fundamental safety guidelines
- Incident Analysis: Report and analyze workplace incidents
- News: Latest safety updates and regulations

## 🎨 UI/UX Features

- Responsive design for all screen sizes
- Toast notifications
- Loading states and skeletons
- PDF generation for reports and invoices
- Data tables with sorting, filtering, and pagination
- Charts and analytics dashboards
- Modal dialogs for forms and confirmations

## 🔧 Configuration Files

### `capacitor.config.ts`

- App ID: `com.safezy.app`
- App Name: `Safezy`
- Update the `server.url` to your local IP for mobile development

### `next.config.mjs`

- Image optimization disabled for Capacitor compatibility
- Remote image patterns configured
- OpenAI API key injection

### `.env.local` (Create this file)

Required environment variables for Supabase, OpenAI, and email configuration.

## 🐛 Common Issues & Solutions

### Mobile App Not Connecting

- Update `capacitor.config.ts` with your local IP address
- Ensure your mobile device and development machine are on the same network
- Set `cleartext: true` for HTTP connections during development

### Build Errors

bash
# Clear cache and reinstall
rm -rf node_modules .next
yarn install
yarn build

### Type Errors

bash
# Run type check
yarn tsc

## 📦 Deployment

### Web Application

bash
yarn build
yarn start

Deploy to Vercel, Netlify, or any Node.js hosting platform.

### Mobile Apps

Android:

1. Update `capacitor.config.ts` to remove development server URL
2. Build the app: `npx cap sync android`
3. Open in Android Studio and generate signed APK/AAB
4. Upload to Google Play Store

iOS:

1. Update `capacitor.config.ts` to remove development server URL
2. Build the app: `npx cap sync ios`
3. Open in Xcode and archive
4. Upload to App Store Connect

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Ensure code passes linting: `yarn lint`
4. Format code: `yarn format:fix`
5. Commit your changes (Husky will run pre-commit checks)
6. Push and create a Pull Request

## 📄 Code Quality

- ESLint: Enforces code standards
- Prettier: Maintains consistent formatting
- Husky: Pre-commit hooks for linting and formatting
- TypeScript: Type safety across the application
- Zod: Runtime type validation