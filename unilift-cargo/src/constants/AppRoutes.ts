// Define the type for AppRoutes
type AppRoutesType = {
  HOME: string;
  ABOUT_US: string;
  BLOG: string;
  CONTACT_US: string;
  SITE_MAP: string;
  PRIVACY_POLICY: string;
  TERMS_AND_CONDITIONS: string;
  // Auth routes
  LOGIN: string;
  SIGN_UP: string;
  RESET_PASSWORD: string;
  FORGOT_PASSWORD: string;
  OTP_VERIFICATION: string;
  SIGN_UP_PRINCIPAL: string;

  // Admin Panel routes
  ADMIN_DASHBOARD: string;
  ADMIN_PRODUCT_LISTING: string;
  ADMIN_ADD_PRODUCT: string;
  ADMIN_UPDATE_PRODUCT: (id: string) => string;
  ADMIN_ORDER_LISTING: string;
  ADMIN_ORDER_DETAILS: (id: string) => string;
  ADMIN_CONTRACTOR_LISTING: string;
  ADMIN_CONTRACTOR_DETAILS: (id: number) => string;
  ADMIN_WAREHOUSE: string;
  ADMIN_COMPLAINTS: string;
  ADMIN_BLOG: string;

  // Contractor Panel routes
  CONTRACTOR_DASHBOARD: string;
  CONTRACTOR_ORDER_LISTING: string;
  CONTRACTOR_ORDER_DETAILS: (id: string) => string;
  CONTRACTOR_PROFILE: string;
  CONTRACTOR_EQUIPMENT_LISTING: string;
  CONTRACTOR_EMPLOYEE_LISTING: string;
  CONTRACTOR_WORKSITE_LISTING: string;
  CONTRACTOR_EQUIPMENT_DETAILS: (id: string) => string;
  CONTRACTOR_ASSIGNMENTS: string;
  CONTRACTOR_NOTIFICATION: string;
  CONTRACTOR_CART: string;
  // Warehouse operator dashboard
  WAREHOUSE_OPERATOR_DASHBOARD: string;
  CONTRACTOR_INVOICE_DOWNLOAD: (id: string) => string;

  RECOMMENDED_PRODUCTS: string;

  PRODUCT_LISTING: string;
  PRODUCT_LISTING_HEAD: string;
  PRODUCT_LISTING_HAND: string;
  PRODUCT_LISTING_LEG: string;
  PRODUCT_LISTING_FALL: string;
  PRODUCT_LISTING_EYE: string;
  PRODUCT_LISTING_FACE: string;
  PRODUCT_LISTING_RESPIRATORY: string;

  // Principal employer panel route
  PRINCIPAL_EMPLOYER_DASHBOARD: string;
  PRINCIPAL_EMPLOYER_ORDER_LISTING: string;
  PRINCIPAL_EMPLOYER_ORDER_DETAILS: (id: string) => string;
  PRINCIPAL_EMPLOYER_EQUIPMENT_LISTING: string;
  PRINCIPAL_EMPLOYER_EMPLOYEE_LISTING: string;
  PRINCIPAL_EMPLOYER_EQUIPMENT_DETAILS: (id: string) => string;
  PRINCIPAL_EMPLOYER_ASSIGNMENTS: string;

  // EHS
  ADMIN_EHS_NEWS_SAVE: (id: number) => string;
  ADMIN_EHS_TOOLBOX_TALK_LISTING: string;
  ADMIN_EHS_TOOLBOX_TALK_ADD: string;
  ADMIN_EHS_TOOLBOX_TALK_UPDATE: (id: number) => string;
  ADMIN_EHS_CHECKLIST_LISTING: string;
  ADMIN_EHS_CHECKLIST_ADD: string;
  ADMIN_EHS_CHECKLIST_UPDATE: (id: number) => string;
  ADMIN_EHS_NEWS_LISTING: string;

  EHS_NEWS_DETAILS: (id: number) => string;
  EHS_CHECKLIST_LISTING: string;
  EHS_CHECKLIST_DETAILS: (id: number) => string;
  EHS_TOOLBOX_TALK: string;
  EHS_TOOLBOX_TALK_DETAILS: (id: number) => string;
  ADMIN_EHS_FIRST_PRINCIPLES_LISTING: string;
  ADMIN_EHS_FIRST_PRINCIPLES_ADD: string;
  ADMIN_EHS_FIRST_PRINCIPLES_UPDATE: (id: number) => string;
  EHS_FIRST_PRINCIPLES: string;
  EHS_FIRST_PRINCIPLES_DETAILS: (id: number) => string;
  EHS_INCIDENT_ANALYSIS_ADD: string;
  EHS_INCIDENT_ANALYSIS_UPDATE: (id: number) => string;
  EHS_INCIDENT_ANALYSIS_REPORT: (id: number) => string;

  // BLOGS
  ADMIN_ADD_BLOG: string;
  ADMIN_UPDATE_BLOG: (id: number) => string;
  BLOG_DETAILS: (id: number) => string;
};

// Define the AppRoutes object with types
export const AppRoutes: AppRoutesType = {
  // Public routes
  HOME: '/',
  ABOUT_US: '/about-us',
  BLOG: '/blog',
  CONTACT_US: '/contact-us',
  SITE_MAP: '/site-map',
  PRIVACY_POLICY: '/privacy',
  TERMS_AND_CONDITIONS: '/term',

  // Auth routes
  LOGIN: '/login',
  SIGN_UP: '/sign-up',
  RESET_PASSWORD: '/reset-password',
  FORGOT_PASSWORD: '/forgot-password',
  OTP_VERIFICATION: '/otp-verification',
  SIGN_UP_PRINCIPAL: '/sign-up?type=principal',

  // Admin Panel routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_PRODUCT_LISTING: '/admin/products',
  ADMIN_ADD_PRODUCT: '/admin/products/add-product',
  ADMIN_UPDATE_PRODUCT: (id: string) => `/admin/products/update-product/${id}`,
  ADMIN_ORDER_LISTING: '/admin/orders',
  ADMIN_ORDER_DETAILS: (id: string) => `/admin/orders/${id}`,
  ADMIN_CONTRACTOR_LISTING: '/admin/contractors',
  ADMIN_CONTRACTOR_DETAILS: (id: number) => `/admin/contractors/${id}`,
  ADMIN_WAREHOUSE: '/admin/warehouse',
  ADMIN_COMPLAINTS: '/admin/complaints',
  ADMIN_BLOG: '/admin/blog',

  // Contractor Panel routes
  CONTRACTOR_DASHBOARD: '/contractor/dashboard',
  CONTRACTOR_ORDER_LISTING: '/contractor/orders',
  CONTRACTOR_ORDER_DETAILS: (id: string) => `/contractor/orders/${id}`,
  CONTRACTOR_EQUIPMENT_LISTING: '/contractor/equipments',
  CONTRACTOR_EMPLOYEE_LISTING: '/contractor/employees',
  CONTRACTOR_PROFILE: '/contractor/profile',
  CONTRACTOR_WORKSITE_LISTING: '/contractor/worksites',
  CONTRACTOR_EQUIPMENT_DETAILS: (id: string) => `/contractor/equipments/${id}`,
  CONTRACTOR_ASSIGNMENTS: '/contractor/assignments',
  CONTRACTOR_NOTIFICATION: '/contractor/notifications',
  CONTRACTOR_INVOICE_DOWNLOAD: (id: string) => `/invoice/${id}`,
  CONTRACTOR_CART: '/cart',

  WAREHOUSE_OPERATOR_DASHBOARD: '/warehouse-operator/dashboard',

  PRODUCT_LISTING: '/products',
  PRODUCT_LISTING_HEAD: '/products?category=head_protection',
  PRODUCT_LISTING_HAND: '/products?category=hand_protection',
  PRODUCT_LISTING_LEG: '/products?category=leg_protection',
  PRODUCT_LISTING_FALL: '/products?category=fall_protection',
  PRODUCT_LISTING_EYE: '/products?category=eye_protection',
  PRODUCT_LISTING_FACE: '/products?category=face_protection',
  PRODUCT_LISTING_RESPIRATORY: '/products?category=respiratory_protection',
  RECOMMENDED_PRODUCTS: '/recommended',

  // principal employer panel routes
  PRINCIPAL_EMPLOYER_DASHBOARD: '/principal-employer/dashboard',
  PRINCIPAL_EMPLOYER_ORDER_LISTING: '/principal-employer/orders',
  PRINCIPAL_EMPLOYER_EQUIPMENT_LISTING: '/principal-employer/equipments',
  PRINCIPAL_EMPLOYER_EMPLOYEE_LISTING: '/principal-employer/employees',
  PRINCIPAL_EMPLOYER_EQUIPMENT_DETAILS: (id: string) =>
    `/principal-employer/equipments/${id}`,
  PRINCIPAL_EMPLOYER_ORDER_DETAILS: (id: string) =>
    `/principal-employer/orders/${id}`,
  PRINCIPAL_EMPLOYER_ASSIGNMENTS: `/principal-employer/assignments`,

  // ehs
  ADMIN_EHS_NEWS_LISTING: '/admin/ehs/news',
  ADMIN_EHS_NEWS_SAVE: (id: number) => `/admin/ehs/news/save/${id}`,
  ADMIN_EHS_TOOLBOX_TALK_LISTING: '/admin/ehs/toolbox-talk',
  ADMIN_EHS_TOOLBOX_TALK_ADD: '/admin/ehs/toolbox-talk/add',
  ADMIN_EHS_TOOLBOX_TALK_UPDATE: (id: number) =>
    `/admin/ehs/toolbox-talk/update/${id}`,
  ADMIN_EHS_CHECKLIST_LISTING: '/admin/ehs/checklist',
  ADMIN_EHS_CHECKLIST_ADD: '/admin/ehs/checklist/add',
  ADMIN_EHS_CHECKLIST_UPDATE: (id: number) =>
    `/admin/ehs/checklist/update/${id}`,

  EHS_NEWS_DETAILS: (id: number) => `/ehs-news/${id}`,
  EHS_CHECKLIST_LISTING: '/ehs/checklist',
  EHS_CHECKLIST_DETAILS: (id: number) => `/ehs/checklist/${id}`,

  EHS_TOOLBOX_TALK: '/ehs/toolbox-talk',
  EHS_TOOLBOX_TALK_DETAILS: (id: number) => `/ehs/toolbox-talk/${id}`,
  ADMIN_EHS_FIRST_PRINCIPLES_LISTING: '/admin/ehs/first-principles',
  ADMIN_EHS_FIRST_PRINCIPLES_ADD: '/admin/ehs/first-principles/add',
  ADMIN_EHS_FIRST_PRINCIPLES_UPDATE: (id: number) =>
    `/admin/ehs/first-principles/update/${id}`,
  EHS_FIRST_PRINCIPLES: '/ehs/first-principles',
  EHS_FIRST_PRINCIPLES_DETAILS: (id: number) => `/ehs/first-principles/${id}`,
  EHS_INCIDENT_ANALYSIS_ADD: '/ehs/incident-analysis/add',
  EHS_INCIDENT_ANALYSIS_UPDATE: (id: number) =>
    `/ehs/incident-analysis/update/${id}`,
  EHS_INCIDENT_ANALYSIS_REPORT: (id: number) =>
    `/ehs/incident-analysis/report/${id}`,

  // blogs
  ADMIN_ADD_BLOG: '/admin/blog/add',
  ADMIN_UPDATE_BLOG: (id: number) => `/admin/blog/update/${id}`,
  BLOG_DETAILS: (id: number) => `/blog/${id}`
};

export const guestRoutes: string[] = [
  AppRoutes.HOME,
  AppRoutes.LOGIN,
  AppRoutes.SIGN_UP,
  AppRoutes.RESET_PASSWORD,
  AppRoutes.FORGOT_PASSWORD,
  AppRoutes.OTP_VERIFICATION
];
