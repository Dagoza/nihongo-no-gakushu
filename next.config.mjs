/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ttlwngmidibgcuqsrvnb.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_E3Mz4l9IeI8BxTjVvKgapA_V9f_1ZyA',
  },
  outputFileTracingIncludes: {
    '/api/**/*': ['./data/**/*', './node_modules/kanji-data/data/**/*'],
  },
  // Headers to ensure PDFs and materials can be displayed inline in iframes without browser blocking
  async headers() {
    return [
      {
        source: '/material_de_estudio/:path*',
        headers: [
          {
            key: 'Content-Disposition',
            value: 'inline',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/stories',
        destination: '/story',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
