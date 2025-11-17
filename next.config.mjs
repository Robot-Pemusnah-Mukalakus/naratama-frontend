/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
      },
      {
        protocol: "https",
        hostname: "images-na.ssl-images-amazon.com",
      },
      {
        protocol: "https",
        hostname: "covers.openlibrary.org",
      },
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)", // apply to all routes
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' https://app.sandbox.midtrans.com https://snap-assets.al-pc-id-b.cdn.gtfblabs.io;
              frame-src https://app.sandbox.midtrans.com https://app.midtrans.com;
              connect-src 'self' https://app.sandbox.midtrans.com;
              img-src 'self' data: https:;
              style-src 'self' 'unsafe-inline';
            `.replace(/\s+/g, " ")
          },

        ],
      },
    ];
  },
};

export default nextConfig;
