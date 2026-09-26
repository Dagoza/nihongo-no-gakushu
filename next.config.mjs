/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
};

export default nextConfig;
