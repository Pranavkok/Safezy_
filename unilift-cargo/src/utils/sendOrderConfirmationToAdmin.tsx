import { OrderDetailsForAdmin } from '@/types/order.types';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD
  }
});

type EmailContext = {
  orderDetails: OrderDetailsForAdmin;
};

export const sendOrderToAdmin = async ({
  to,
  subject,
  context
}: {
  to: string[];
  subject: string;
  context: EmailContext;
}) => {
  const { id, date, total_amount, users, order_items } = context.orderDetails;

  const itemsTableRows = order_items
    .map(
      (item, index) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${index + 1}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${item.product.ppe_name}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${item.product.ppe_category}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${item.product.brand_name}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${item.product_size || '-'}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${item.product_color || '-'}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">₹${item.price.toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>New Order Notification</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f4f6f8;
              margin: 0;
              padding: 0;
              color: #333;
          }
          .container {
              max-width: 700px;
              background-color: #ffffff;
              margin: 40px auto;
              padding: 24px;
              border-radius: 8px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          }
          h1 {
              color: #2c3e50;
              font-size: 24px;
              margin-bottom: 16px;
          }
          p {
              font-size: 16px;
              margin: 8px 0;
          }
          .order-summary, .user-info {
              margin: 16px 0;
              padding: 16px;
              background-color: #f9f9f9;
              border-left: 4px solid #ff914c;
              border-radius: 6px;
          }
          .order-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
          }
          .order-table th, .order-table td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
          }
          .order-table th {
              background-color: #ff914c;
              color: white;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <h1>🛒 New Order Received</h1>
          <p>Dear Admin,</p>
          <p>A new order has been successfully placed on <strong>Safezy</strong>. Please find the details below:</p>

          <div class="order-summary">
              <p><strong>Order ID:</strong> ${id}</p>
              <p><strong>Date:</strong> ${date}</p>
              <p><strong>Total Amount:</strong> ₹${total_amount.toFixed(2)}</p>
          </div>

          <div class="user-info">
              <p><strong>Customer Name:</strong> ${users.first_name} ${users.last_name}</p>
              <p><strong>Email:</strong> ${users.email}</p>
              <p><strong>Contact Number:</strong> ${users.contact_number}</p>
          </div>

          <h2 style="margin-top: 32px;">Order Items</h2>
          <table class="order-table">
              <thead>
                  <tr>
                      <th>#</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Brand</th>
                      <th>Size</th>
                      <th>Color</th>
                      <th>Quantity</th>
                      <th>Price</th>
                  </tr>
              </thead>
              <tbody>
                  ${itemsTableRows}
              </tbody>
          </table>
      </div>
  </body>
  </html>
  `;

  try {
    const mailOptions = {
      from: process.env.SMTP_USERNAME,
      to,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email sending failed');
  }
};
