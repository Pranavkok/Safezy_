/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      {
        protocol: 'http',
        hostname: 'static1.squarespace.com',
        port: '',
        pathname: '/static/**'
      }
    ]
  },
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY
  }
  // output: 'export'
};
export default nextConfig;
