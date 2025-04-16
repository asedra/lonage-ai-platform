/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        location: false
      };
    }
    return config;
  },
  // Sunucu tarafında location hatasını önlemek için
  serverExternalPackages: [],
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*' // Backend URL
      }
    ]
  }
};

module.exports = nextConfig; 