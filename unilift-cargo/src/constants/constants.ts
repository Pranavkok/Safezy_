import { Database } from '@/types/supabase';

export const ERROR_MESSAGES = {
  // General
  REQUIRED_FIELDS_MISSING: 'Missing required fields',
  UNEXPECTED_ERROR: 'An unexpected error occurred. Please try again later',
  INVALID_CREDENTIALS:
    'Invalid credentials. Please check your email and password',
  MISSING_REQUIRED_FIELDS:
    'Required fields are missing.Please provide all required fields',
  MERCHANT_SALT_MISSING: 'Internal error: missing configuration',
  HASH_NOT_GENERATED: 'Error generating hash',

  // Export to Excel
  FAILED_DOWNLOADING_EXCEL_FILE:
    'Failed to download Excel file. Please try again',

  // CSV
  CSV_DATA_NOT_FOUND: 'No employee data found in the CSV file',
  FAILED_ADDING_CSV_DATA: 'Failed to add employees from CSV',
  FAILED_PARSING_CSV_DATA: 'Failed to parse CSV file',
  DATA_NOT_FOUND: 'No valid employee data found',

  // Product
  PRODUCT_ID_NOT_FOUND: 'Please provide Product ID to update the product',
  PRODUCT_NOT_ADDED: 'Failed to add product details. Please try again',
  PRODUCT_NOT_UPDATED: 'Failed to update product details. Please try again',
  PRODUCT_NOT_DELETED: 'Failed to delete product details. Please try again',
  PRODUCT_NOT_FETCHED: 'Failed to fetch product details. Please try again',
  PRODUCT_IMAGE_NOT_ADDED: 'Failed to add product images. Please try again',
  IMAGE_UPLOAD_FAILED: 'Failed to upload product image. Please try again',
  VIDEO_UPLOAD_FAILED: 'Failed to upload product video. Please try again',
  PRODUCT_REVIEWS_NOT_FETCHED:
    'Failed to fetch product reviews. Please try again',
  PRODUCT_IMAGE_NOT_DELETED: 'Failed to delete product image. Please try again',

  // Employee
  EMPLOYEE_NOT_ADDED: 'Failed to add employee details.Please try again',
  EMPLOYEE_NOT_UPDATED: 'Failed to update employee details.Please try again',
  EMPLOYEE_NOT_DELETED: 'Failed to delete employee details.Please try again',
  EMPLOYEE_NOT_FETCHED: 'Failed to fetch employee details.Please try again',
  EMPLOYEE_NOT_FOUND: 'There is no employee found for provided details',

  // Order
  ORDER_ID_REQUIRED: 'Order ID is required',
  ORDER_NOT_FOUND: 'Order details not found or invalid',
  ORDER_NOT_ADDED: 'Failed to add order details.Please try again',
  ORDER_NOT_UPDATED: 'Failed to update order details.Please try again',
  ORDER_NOT_DELETED: 'Failed to delete order details.Please try again',
  ORDER_NOT_FETCHED: 'Failed to fetch order details.Please try again',
  NO_ITEMS_IN_ORDER: 'No items were found in the order',
  ORDER_STATUS_NOT_UPDATED: 'Inventory updated, but order status not updated',
  ORDER_ONLY_IN_GUJARAT: 'We are coming to your region soon.',

  // Complaint
  COMPLAINT_NOT_ADDED: 'Failed to add complaint details.Please try again',
  COMPLAINT_NOT_UPDATED: 'Failed to update complaint details.Please try again',
  COMPLAINT_NOT_DELETED: 'Failed to delete complaint details.Please try again',
  COMPLAINT_NOT_FETCHED: 'Failed to fetch complaint details.Please try again',
  COMPLAINT_ID_MISSING: 'Please add Complaint ID to update the complaint',

  //Contact
  CONTACT_NOT_ADDED: 'Failed to add contact details.Please try again',

  // Contractor
  CONTRACTOR_NOT_ADDED: 'Failed to add user details. Please try again',
  CONTRACTOR_NOT_UPDATED: 'Failed to update user details. Please try again',
  CONTRACTOR_NOT_DELETED: 'Failed to delete user details. Please try again',
  CONTRACTOR_NOT_FETCHED: 'Failed to add customer details. Please try again',
  CONTRACTOR_WORKSITES_NOT_FETCHED:
    'Failed to fetch worksites of selected customer. Please try again',

  CONTRACTOR_ACCOUNT_NOT_DELETED:
    'Failed to delete customer account. Please try again',

  // User
  USER_ALREADY_REGISTERED: 'User with this email is already registered',
  ERROR_CHECKING_EXISTING:
    'An error occurred while checking for existing users',
  USER_ID_NOT_FOUND: 'User ID not found after sign-up',
  USER_NOT_FOUND:
    'User not found. You need to register first before logging in',
  USER_NOT_REGISTERED:
    'User with this email is not registered. Please sign up first',
  USER_NOT_FETCHED: 'Failed to fetch user details. Please try again',
  USER_STATUS_NOT_UPDATED: 'Failed to deactivate the user. Please try again',

  // Auth
  SIGNUP_ERROR: 'An unexpected error occurred during sign-up',
  LOGIN_ERROR: 'An unexpected error occurred during login',
  SIGNUP_WAREHOUSE_ERROR: 'Failed to send signup warehouse email',
  TOOLBOX_COMPLETE_SEND_ERROR: 'Failed to send toolbox talk complete email',

  // OTP
  OTP_VERIFICATION_FAILED: 'Failed to verify OTP. Please try again',
  OTP_VERIFY_ERROR: 'An unexpected error occurred while verifying OTP',
  OTP_RESEND_ERROR: 'An error occurred while resending the OTP',

  // Reset-password
  RESET_EMAIL_NOT_SENT: 'Failed to send password reset email. Please try again',
  RESET_PASSWORD_FAILED: 'Failed to reset password. Please try again',

  SIGN_OUT_FAILED: 'Failed to sign you out. Please try again',

  // Order-items
  ORDER_ITEMS_NOT_FETCHED: 'Failed to fetch order items.Please try again',
  ORDER_ITEMS_NOT_ADDED: 'Failed to add order items.Please try again',
  ORDER_ID_NOT_FETCHED:
    'Failed to fetch the required order ids. Please try again',
  ORDER_COMPLAINT_NOT_ADDED: 'Failed to add order in complaint section',

  // Inventory-shipping
  SHIPPING_DETAILS_NOT_FETCHED: 'Failed to fetch shipping details',
  DELIVERY_ADDRESS_NOT_FETCHED: 'Failed to fetch delivery address',
  DELIVERY_STATUS_NOT_FETCHED: 'Failed to fetch delivery status',

  // Worksite
  WORKSITE_NOT_FETCHED: 'Failed to fetch worksite details.Please try again',
  WORKSITE_NOT_ADDED: 'Failed to add worksite details.Please try again',
  WORKSITE_NOT_FOUND: 'Worksite not found.Please try again',
  WORKSITE_NOT_DELETED: 'Failed to delete worskite.Please try again',
  WORKSITE_NOT_UPDATED: 'Failed to update the worksite. Please try again',
  WORKSITE_INVENTORY_NOT_FETCHED:
    'Worksite wise inventory could not be fetched. Please try again',

  // Cart-Items
  CART_ITEMS_NOT_FETCHED: 'Failed to fetch cart items',
  CART_ITEMS_NOT_ADDED: 'Failed to add cart items',
  CART_COUNT_NOT_FETCHED: 'Failed to fetch cart items count',
  CART_NOT_CLEARED: 'Failed to clear cart',
  CART_ITEM_NOT_REMOVED: 'Failed to remove cart items',
  CART_ITEM_QUANTITY_NOT_UPDATED: 'Failed to update item quantity',
  CART_TOTAL_NOT_FETCHED: "Failed to fetch cart's total amount",
  CART_EMPTY: 'No items in the cart to place an order',

  // Price-tiers
  PRICE_TIERS_NOT_ADDED: 'Failed to add price. Please try again',
  PRICE_TIERS_NOT_FETCHED: 'Failed to fetch price. Please try again',
  PRICE_TIERS_NOT_DELETED:
    'Failed to delete existing price tier. Please try again',
  ITEM_PRICE_NOT_UPDATED: 'Could not update the item price. Please try again',

  // Warehouse
  WAREHOUSE_NOT_FETCHED: 'Failed to fetch warehouse details. Please try again',
  WAREHOUSE_NOT_ADDED: 'Failed to add warehouse details. Please try again',
  WAREHOUSE_NOT_UPDATED: 'Failed to update warehouse details. Please try again',
  WAREHOUSE_NOT_DELETED: 'Failed to delete warehouse details. Please try again',
  WAREHOUSE_ADDRESS_NOT_FETCHED:
    'Failed to fetch warehouse address. Please try again',

  //Principal
  PRINCIPAL_USER_NOT_FETCHED:
    'Failed to fetch Principal details. Please try again',
  PRINCIPAL_USER_NOT_ADDED: 'Failed to add Principal details. Please try again',
  PRINCIPAL_USER_NOT_UPDATED:
    'Failed to update Principal details. Please try again',
  PRINCIPAL_USER_NOT_DELETED:
    'Failed to delete Principal details. Please try again',

  // Address
  ADDRESS_NOT_ADDED: 'Address details could not be added',
  ADDRESS_NOT_UPDATED: 'Address details could not be updated',
  SHIPPING_ADDRESS_NOT_ADDED:
    'Failed to add shipping address. Please try again',

  EMAIL_NOT_SENT: 'Error sending email. Please try again',
  ROLE_ERROR: 'Error providing user role',
  USER_DEACTIVATED:
    'Your account has been deactivated. Please contact admin for further details.',

  USER_NOT_DEACTIVATED:
    'Failed to sent your account delete request to admin. Please try again',
  USER_DELETED:
    'No action has been performed on your account deletion request, till then you cannot login',

  INVENTORY_NOT_UPDATED: 'Failed to update inventory. Please try again',
  INVENTORY_NOT_FETCHED: 'Failed to fetch inventory details. Please try again',

  PPE_NOT_ASSIGNED:
    'Failed to assign the selected PPE to employee. Please try again',
  PPE_NOT_UNASSIGNED: 'Could not unassign the selected PPE. Please try again',
  INSUFFICIENT_QUANTITY:
    "The inventory doesn't have enough products to assign to employee",
  EMPLOYEE_HISTORY_NOT_FETCHED:
    'Failed to fetch equipments assigned to employee. Please try again',
  ASSIGNED_EQUIPMENTS_NOT_FETCHED: 'Failed to fetch assigned equipments',
  HISTORY_NOT_FETCHED: 'Failed to fetch equipment history',

  WORKSITE_AND_USER_IDS_NOT_FOUND:
    'Worksite and user id could not be fetched. Please try again',
  IN_TRANSIT_ITEMS_FETCH_FAILED:
    'Failed to fetch the in-transit products. Please try again',

  RATING_NOT_ADDED: 'Failed to add product rating. Please try again',

  TOOLBOX_DETAILS_NOT_FETCHED:
    'Failed to fetch toolbox talk details. Please try again',
  TOOLBOX_DETAILS_NOT_ADDED:
    'Failed to add toolbox talk details. Please try again',
  TOOLBOX_DETAILS_NOT_UPDATED:
    'Failed to update toolbox talk details. Please try again',
  TOOLBOX_DETAILS_NOT_DELETED:
    'Failed to delete toolbox talk details. Please try again',
  TOOLBOX_USERS_NOT_FETCHED:
    'Failed to fetch toolbox talk users. Please try again',
  TOOLBOX_USERS_NOT_ADDED: 'Failed to add toolbox talk users. Please try again',
  TOOLBOX_IMAGE_NOT_ADDED:
    'Failed to add toolbox talk attendence images. Please try again',
  TOOLBOX_SUGGESTION_NOT_ADDED:
    'Failed to add toolbox talk suggestion. Please try again',
  TOOLBOX_SUGGESTION_NOT_FETCHED:
    'Failed to fetch toolbox talk suggestions. Please try again',
  TOOLBOX_NOTE_NOT_UPDATED: 'Failed to update toolbox note. Please try again',
  TOOLBOX_NOTE_NOT_ADDED: 'Failed to add toolbox note. Please try again',
  TOOLBOX_NOTE_NOT_FETCHED: 'Failed to fetch toolbox note. Please try again',

  INCIDENT_TITLE_NOT_ADDED: 'Failed to add incident title. Please try again',
  INCIDENT_TITLE_NOT_UPDATED:
    'Failed to update incident title. Please try again',
  INCIDENT_BASIC_DETAILS_NOT_ADDED:
    'Failed to add incident basic details. Please try again',
  AFFECTED_PERSON_DETAILS_NOT_ADDED:
    "Failed to add affected person's details. Please try again",
  PRE_INCIDENT_DETAILS_NOT_ADDED:
    'Failed to add pre incident operation details. Please try again',
  INCIDENT_HISTORY_DETAILS_NOT_ADDED:
    'Failed to add incident history details.Please try again',
  INVESTIGATION_CHECKLIST_NOT_ADDED:
    'Failed to add investigation checklist details. Please try again',
  ADDITIONAL_COMMENTS_NOT_ADDED:
    'Failed to add additional comments. Please try again',
  WITNESS_DETAILS_NOT_ADDED:
    'Failed to add incident witness details. Please try again',
  INCIDENT_IMAGE_NOT_ADDED: 'Failed to add incident images. Please try again',
  INCIDENT_VIDEO_NOT_ADDED: 'Failed to add incident videos. Pleas etry again',
  INCIDENT_DETAILS_NOT_FETCHED:
    'Failed to fetch incident details. Please try again',

  FIRST_PRINCIPLES_NOT_ADDED:
    'Failed to add First Principles. Please try again',
  FIRST_PRINCIPLES_NOT_UPDATED:
    'Failed to update First Principles. Please try again',
  FIRST_PRINCIPLES_NOT_FETCHED:
    'Failed to fetch First Principles. Please try again',
  FIRST_PRINCIPLES_NOT_DELETED:
    'Failed to delete First Principle. Please try again',
  FIRST_PRINCIPLE_SUGGESTION_NOT_FETCHED:
    'Failed to fetch First Principle suggestions. Please try again',
  FIRST_PRINCIPLE_SUGGESTION_NOT_ADDED:
    'Failed to add First Principle suggestions. Please try again',

  NEWS_NOT_ADDED: 'Failed to add news. Please try again',
  NEWS_NOT_UPDATED: 'Failed to update news. Please try again',
  NEWS_NOT_FETCHED: 'Failed to fetch news. Please try again',
  NEWS_NOT_DELETED: 'Failed to delete news. Please try again',

  CHECKLIST_TOPIC_NOT_ADDED: 'Failed to add checklist topic. Please try again',
  CHECKLIST_QUESTION_NOT_ADDED:
    'Failed to add checklist question. Please try again',
  CHECKLIST_DETAILS_NOT_ADDED:
    'Failed to add checklist details. Please try again',
  CHECKLIST_DETAILS_NOT_FETCHED:
    'Failed to fetch checklist details. Please try again',
  CHECKLIST_TOPICS_NOT_FETCHED:
    'Failed to fetch checklist topics. Please try again',
  CHECKLIST_SUGGESTION_NOT_ADDED:
    'Failed to add checklist suggestion. Please try again',
  CHECKLIST_SUGGESTION_NOT_FETCHED:
    'Failed to fetch checklist suggestions. Please try again',

  CHECKLIST_TOPIC_NOT_UPDATED:
    'Failed to update the checklist topic. Please try again.',
  CHECKLIST_TOPIC_NOT_FOUND: 'Checklist topic not found.',
  CHECKLIST_TOPIC_NOT_DELETED: 'Failed to delete the checklist topic.',

  // Blogs
  BLOG_DETAILS_NOT_FETCHED: 'Failed to fetch blog details. Please try again',
  BLOG_DETAILS_NOT_ADDED: 'Failed to add blog. Please try again',
  BLOG_DETAILS_NOT_UPDATED: 'Failed to update blog details. Please try again',
  BLOG_DETAILS_NOT_DELETED: 'Failed to delete blog. Please try again',
  BLOG_ALREADY_SUBSCRIBED: 'You are already subscribed to safezy blogs',
  BLOG_SUBSCRIBER_NOT_FETCHED:
    'Failed to fetch blog subscribers. Please try again',
  SUBSCRIBER_CONTRACTOR_NOT_FOUND:
    'No subscribers or contractors found to send email',
  SUBSCRIBER_DETAILS_NOT_FETCHED:
    'Failed to fetch blog subscribers details. Please try again',
  CONTRACTOR_USERS_NOT_FETCHED:
    'Failed to fetch contractor users. Please try again',

  BLOG_SUBSCRIPTION_DETAILS_NOT_ADDED:
    'Failed to add blog subscription. Please try again',
  BLOG_SUBSCRIPTION_SUCCESS_EMAIL_ERROR:
    'Failed to send blog subscription email',
  BLOG_NOTIFICATION_SUCCESS_EMAIL_ERROR:
    'Failed to send blog notification email to subscribers and contractors.',

  // Question related errors

  CHECKLIST_QUESTION_NOT_UPDATED:
    'Failed to update checklist questions. Please try again.',
  CHECKLIST_QUESTION_NOT_DELETED: 'Failed to delete existing questions.',
  CHECKLIST_QUESTION_NOT_FOUND: 'Checklist questions not found.',
  CHECKLIST_FETCH_FAILED: 'Failed to fetch checklist.',
  CHECKLIST_UPDATE_FAILED: 'Failed to update checklist',
  CHECKLIST_COMPLETE_NOT_SENT:
    'Checklist complete email could not be sent. Please try again',
  CHECKLIST_CONTRACTOR_NOT_FETCHED:
    'Failed to fetch customers who completed this checklist. Please try again',

  SIGNUP_SUCCESS_EMAIL_ERROR: 'Failed to send signup success email',
  CONTACT_EMAIL_ERROR: 'Failed to send contact safezy email',
  ORDER_EMAIL_SEND_EMAIL: 'Failed to send order email to admin'
};

export const SUCCESS_MESSAGES = {
  // Auth
  LOGGED_IN: 'You have successfully logged in',
  SIGN_OUT_SUCCESS: 'You have successfully signed out',
  USER_VERIFICATION:
    "Please check your email, we've sent you a verification token to complete the process.",
  CONTRACTOR_DEACTIVATED: 'Customer deactivated successfully',
  CONTRACTOR_ACTIVATED: 'Customer activated successfully',
  WAREHOUSE_DEACTIVATED: 'Warehouse deactivated successfully',
  WAREHOUSE_ACTIVATED: 'Warehouse activated successfully',

  // Export to Excel
  EXCEL_FILE_DOWNLOADED: 'Excel file downloaded successfully.',

  // OTP
  OTP_VERIFIED: 'OTP verified successfully',
  OTP_RESENT: 'OTP has been resent. Please check your email',

  // Reset-password
  PASSWORD_RESET_EMAIL:
    'Password reset email sent successfully. Please check your inbox',
  PASSWORD_RESET: 'Password reset successful',

  // Contractor
  CONTRACTOR_DETAILS_ADDED: 'Customer details added successfully',
  CONTRACTOR_DETAILS_FETCHED: 'Customer details fetched successfully',
  CONTRACTOR_DETAILS_UPDATED: 'Customer details updated successfully',
  CONTRACTOR_DETAILS_DELETED: 'Customer details deleted successfully',
  CONTRACTOR_ACCOUNT_DELETED:
    'Your account delete request has been sent to the admin successfully',

  //Principal
  PRINCIPAL_USER_DETAILS_ADDED: 'Customer details added successfully',
  PRINCIPAL_USER_DETAILS_FETCHED: 'Customer details fetched successfully',
  PRINCIPAL_USER_DETAILS_UPDATED: 'Customer details updated successfully',
  PRINCIPAL_USER_DETAILS_DELETED: 'Customer details deleted successfully',

  // Worksite
  WORKSITE_ADDED: 'Worksite added successfully',
  WORKSITE_FETCHED: 'Worksite details fetched successfully',
  WORKSITE_DELETED: 'Worksite details deleted successfully',
  WORKSITE_UPDATED: 'Worksite details updated successfully',
  WORKSITE_INVENTORY_FETCHED: 'Worksite wise inventory fetched successfully',

  // Product
  PRODUCT_FETCHED: 'Product details fetched successfully',
  PRODUCT_ADDED: 'Product details added successfully',
  PRODUCT_UPDATED: 'Product details updated successfully',
  PRODUCT_DELETED: 'Product details deleted successfully',
  PRODUCT_REVIEWS_FETCHED: 'Product reviews fetched successfully',

  // Order
  ORDER_FETCHED: 'Order details fetched successfully',
  ORDER_ADDED: 'Order details added successfully',
  ORDER_UPDATED: 'Order details updated successfully',
  ORDER_DELETED: 'Order details deleted successfully',
  ORDER_ID_FETCHED: 'Order Ids fetched successfully',
  ORDER_COMPLAINT_ADDED: 'Complaint for selected order registered successfully',
  ORDER_EMAIL_SENT: 'Order details email sent to admin succuessfully',

  // Employee
  EMPLOYEE_FETCHED: 'Employee details fetched successfully',
  EMPLOYEE_ADDED: 'Employee details added successfully',
  EMPLOYEE_UPDATED: 'Employee details updated successfully',
  EMPLOYEE_DELETED: 'Employee details deleted successfully',

  // CSV
  CSV_DATA_ADDED: 'CSV data of employees added successfully',

  // Complaint
  COMPLAINT_FETCHED: 'Complaint details fetched successfully',
  COMPLAINT_ADDED: 'Complaint details added successfully',
  COMPLAINT_UPDATED: 'Complaint details updated successfully',
  COMPLAINT_DELETED: 'Complaint details deleted successfully',

  //Contact
  CONTACT_ADDED: 'Contact details added successfully',

  // Cart-items
  CART_ITEMS_FETCHED: 'Cart items fetched successfully',
  CART_ITEMS_ADDED: 'Cart items added successfully',
  CART_COUNT_FETCHED: 'Cart items count fetched successfully',
  CART_ITEMS_REMOVED: 'Cart items removed successfully',
  CART_TOTAL_FETCHED: "Cart's total amount fetched successfully",
  CART_ITEMS_QUANTITY_UPDATED: 'Cart item quantity updated',
  CART_ITEMS_UPDATED: 'Cart items updated successfully',
  CART_CLEARED: 'Cart cleared successfully',
  REMOVED_ITEM: 'Item removed successfully',

  // Warehouse
  WAREHOUSE_FETCHED: 'Warehouse details fetched successfully',
  WAREHOUSE_ADDED: 'Warehouse details added successfully',
  WAREHOUSE_UPDATED: 'Warehouse details updated successfully',
  WAREHOUSE_DELETED: 'Warehouse details deleted successfully',

  // Order-Items
  ORDER_ITEMS_FETCHED: 'Order items fetched successfully',
  ORDER_ITEM_DETAILS_FETHCED: 'Ordered product details fetched successfully',

  EMAIL_SENT: 'Order confirmation email sent successfully',

  SIGNED_OUT: 'Signed out successfully',

  SHIPPING_ADDRESS_ADDED: 'Shipping address added successsfully',

  HASH_GENERATED: 'Hash generated successfully',

  ITEM_PRICE_UPDATED: "Cart item's price updated successfully",

  INVENTORY_UPDATED: 'Inventory updated successfully',
  INVENTORY_DETAILS_FETCHED: 'Inventory details fetched successfully',

  PPE_ASSIGNED: 'PPE successfully assigned to the employee',
  PPE_UNASSIGNED: 'PPE unassigned successfully',
  EMPLOYEE_HISTORY_FETCHED: "Employee's equipment history fetched successfully",
  SIGNUP_WAREHOUSE: 'Please check your mail for a link to create warehouse',

  IN_TRANSIT_ITEMS_FETCHED: 'In-Transit products fetched successfully',
  INVOICE_DATA_FETCHED: 'Invoice data fetched successfully',

  RATING_ADDED: 'Product rating added successfully',
  COUNT_FETCHED: 'Counts retrieved successfully',

  TOOLBOX_DETAILS_FETCHED: 'Toolbox talk details fetched successfully',
  TOOLBOX_DETAILS_UPDATED: 'Toolbox talk details updated successfully',
  TOOLBOX_DETAILS_DELETED: 'Toolbox talk details deleted successfully',
  TOOLBOX_DETAILS_ADDED: 'Toolbox talk details added successfully',
  TOOLBOX_COMPLETE_SEND: 'Toolbox talk complete email sent successfully',
  TOOLBOX_USERS_FETCHED: 'Toolbox talk user details fetched successfully',
  TOOLBOX_USERS_ADDED: 'Toolbox talk user details added successfully',
  TOOLBOX_SUGGESTION_ADDED: 'Toolbox talk suggestion added successfully',
  TOOLBOX_SUGGESTION_FETCHED: 'Toolbox talk suggestions fetched successfully',
  TOOLBOX_NOTE_UPDATED: 'Toolbox talk note updated successfully',
  TOOLBOX_NOTE_ADDED: 'Toolbox talk note added successfully',
  TOOLBOX_NOTE_FETCHED: 'Toolbox talk note fetched successfully',

  INCIDENT_TITLE_ADDED: 'Incident title added successfully',
  INCIDENT_TITLE_UPDATED: 'Incident title updated successfully',
  INCIDENT_BASIC_DETAILS_ADDED: 'Incident basic details addedd successfully',
  AFFECTED_PERSON_DETAILS_ADDED: "Affetced person's details added successfully",
  PRE_INCIDENT_DETAILS_ADDED:
    'Pre Incident operation details addedd successfully',
  INCIDENT_HISTORY_DETAILS_ADDED: 'Incident history details added successfully',
  INVESTIGATION_CHECKLIST_ADDED:
    'Investigation checklist details added successfully',
  ADDITIONAL_COMMENTS_ADDED: 'Additional comments added successfully',
  WITNESS_DETAILS_ADDED: 'Incident witness details added successfully',
  INCIDENT_DETAILS_FETCHED: 'Incident details fetched successfully',

  FIRST_PRINCIPLES_ADDED: 'First Principles added successfully',
  FIRST_PRINCIPLES_FETCHED: 'First Principles fetched successfully',
  FIRST_PRINCIPLES_UPDATED: 'First Principles updated successfully',
  FIRST_PRINCIPLE_DELETED: 'First Principle deleted successfully',
  FIRST_PRINCIPLE_SUGGESTION_ADDED:
    'First Principle suggestion added successfully',
  FIRST_PRINCIPLE_SUGGESTION_FETCHED:
    'First Principle suggestions fetched successfully',

  NEWS_ADDED: 'News added successfully',
  NEWS_UPDATED: 'News updated successfully',
  NEWS_FETCHED: 'News fetched successfully',
  NEWS_DELETED: 'News deleted successfully',

  CHECKLIST_DETAILS_ADDED: 'Checklist details added successfully',
  CHECKLIST_DETAILS_FETCHED: 'Checklist details fetched successfully',
  CHECKLIST_TOPICS_FETCHED: 'Checklist topics fetched successfully',
  CHECKLIST_SUGGESTION_ADDED: 'Checklist suggestion added successfully',
  CHECKLIST_SUGGESTION_FETCHED: 'Checklist suggestions fetched successfully',

  CHECKLIST_TOPIC_ADDED: 'Checklist topic has been successfully added.',
  CHECKLIST_TOPIC_UPDATED: 'Checklist topic has been successfully updated.',
  CHECKLIST_TOPIC_DELETED: 'Checklist topic has been successfully deleted.',
  CHECKLIST_COMPLETE: 'Checklist Complete Email sent successfully',
  CHECKLIST_CONTRACTOR_FETCHED:
    'Customers completed this checklist fetched successfully',

  // Blogs

  BLOG_DETAILS_FETCHED: 'Blog details fetched successfully',
  BLOG_DETAILS_ADDED: 'Blog added successfully',
  BLOG_DETAILS_UPDATED: 'Blog details updated successfully',
  BLOG_DETAILS_DELETED: 'Blog deleted successfully',
  BLOG_SUBSCRIPTION_DETAILS_ADDED: 'Blog subscription added successfully',
  BLOG_SUBSCRIPTION_SUCCESS_EMAIL: 'Blog subscription email sent successfully',
  BLOG_NOTIFICATION_SUCCESS_EMAIL:
    'Blog notification email sent to all subscribers and contractors',

  // Question related success
  CHECKLIST_QUESTION_ADDED: 'Checklist questions have been successfully added.',
  CHECKLIST_QUESTION_UPDATED:
    'Checklist questions have been successfully updated.',
  CHECKLIST_QUESTION_DELETED:
    'Checklist questions have been successfully deleted.',

  CHECKLIST_UPDATED: 'Checklist Save Successfully.',
  CHECKLIST_DELETED: 'Checklist deleted successfully',

  SIGNUP_SUCCESS_EMAIL: 'Signup email sent successfully',
  CONTACT_SUCCESS_EMAIL: 'Contact email sent successfully',

  PRODUCT_IMAGE_DELETED: 'Product image deleted successfully'
};

type AppRole = Database['public']['Enums']['app_role'];

export const USER_ROLES: {
  CONTRACTOR: AppRole;
  ADMIN: AppRole;
  PRINCIPAL_EMPLOYER: AppRole;
  WAREHOUSE_OPERATOR: AppRole;
} = {
  CONTRACTOR: 'contractor',
  ADMIN: 'admin',
  PRINCIPAL_EMPLOYER: 'principle',
  WAREHOUSE_OPERATOR: 'warehouse_operator'
} as const;

export const STATE: {
  GUJARAT: string;
} = {
  GUJARAT: 'gujarat'
};
