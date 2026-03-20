type NewBlogContext = {
  blog_title: string;
  blog_id: number;
  blog_image_url?: string | null;
};

export const newBlogHTML = (context: NewBlogContext) => `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>New Blog Published on Safezy</title>
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
        .subtitle {
          color: #000000;
          font-size: 16px;
          margin: 0;
        }
        .content-section {
          background-color: #fff5eb;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 24px;
          border-left: 4px solid #ff914d;
        }
        .blog-title {
          font-size: 20px;
          font-weight: 600;
          color: #2d3748 !important;
          margin-bottom: 12px;
          line-height: 1.4;
          text-decoration: none !important;
          display: block;
        }
        .blog-title:hover {
          text-decoration: underline !important;
          color: #2d3748 !important;
        }
        .blog-link {
          display: inline-block;
          background-color: #ff914d;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin-top: 16px;
          transition: background-color 0.2s ease;
        }
        .blog-link:hover {
          background-color: #e67e22;
        }
        .blog-image {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 16px 0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          display: block;
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
        @media (max-width: 768px) {
          body {
            padding: 16px;
          }
          .container {
            padding: 20px;
          }
          .logo {
            font-size: 24px;
          }
          .blog-title {
            font-size: 18px;
          }
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
            🆕 A new blog has been published!
          </h2>
  
          <div class="info-box">
            <h3>Check out our latest blog:</h3>
            <a 
              href="${process.env.NEXT_PUBLIC_BASE_URL}/blog/${context.blog_id}" 
              target="_blank" 
              class="blog-title"
            >
              ${context.blog_title}
            </a>
            ${
              context.blog_image_url
                ? `
              <a 
                href="${process.env.NEXT_PUBLIC_BASE_URL}/blog/${context.blog_id}" 
                target="_blank"
                style="display:block;"
              >
                <img
                  src="${context.blog_image_url}"
                  alt="${context.blog_title}"
                  class="blog-image"
                />
              </a>
            `
                : ''
            }
          </div>
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
