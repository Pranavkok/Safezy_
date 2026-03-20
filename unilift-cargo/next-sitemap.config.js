module.exports = {
  siteUrl: 'https://unilift-cargo.vercel.app',
  exclude: [
    '/icon.svg',
    '/apple-icon.png',
    '/manifest.webmanifest',
    '/admin/*'
  ],
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/'
      }
    ],
    additionalSitemaps: [
      'https://example.com/server-sitemap-index.xml' // <==== Add here
    ]
  }
};
