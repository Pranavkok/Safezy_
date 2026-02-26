export const blogSubscribedEmailHTML = () => `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Safezy Blog Subscription Confirmation</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        color: #333;
        background-color: #f8f9fa;
        padding: 24px;
        margin: 0;
        line-height: 1.6;
      }
      .container {
        max-width: 600px;
        background: #fff;
        margin: 0 auto;
        padding: 32px;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      }
      .header {
        border-bottom: 2px solid #ff914d;
        padding-bottom: 20px;
        margin-bottom: 24px;
      }
      .logo {
        font-size: 28px;
        font-weight: bold;
        color: #2d3748;
        margin-bottom: 8px;
      }
      .content-section {
        background-color: #fff5eb;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 24px;
        border-left: 4px solid #ff914d;
      }
      .footer {
        text-align: center;
        margin-top: 32px;
        padding-top: 20px;
        border-top: 1px solid #e2e8f0;
        color: #718096;
      }
      .footer p {
        margin: 8px 0;
        font-size: 14px;
      }
      .highlight {
        color: #ff914d;
        font-weight: 600;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">Safezy</div>
      </div>

      <div class="content-section">
        <h2 style="color: #2d3748; margin-bottom: 16px; font-size: 22px">
          🎉 Thank you for subscribing to Safezy Blog updates!
        </h2>
        <p style="font-size: 16px; color: #4a5568;">
          You’ll now receive the latest blogs updates directly in your inbox.
        </p>
      </div>

      <div class="footer">
        <p><strong>Stay connected with Safezy</strong></p>
        <p>
          For any questions or support, please reach out to us at
          <span class="highlight">safezy.support@gmail.com</span>.
        </p>
        <p style="margin-top: 16px; font-size: 12px; color: #a0aec0">
          You’re receiving this email because you subscribed to Safezy Blog
          updates.
        </p>
      </div>
    </div>
  </body>
</html>
`;
