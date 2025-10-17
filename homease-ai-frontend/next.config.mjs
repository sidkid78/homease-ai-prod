/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enables the standalone output, which creates a smaller deployment footprint
  // by copying only necessary files and node_modules into the .next/standalone folder.
  output: 'standalone',
  
  // Next.js 15: Mark server-only packages that should not be bundled for client
  serverExternalPackages: ['@google-cloud/firestore', 'firebase-admin'],
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve firebase-admin on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'firebase-admin': false,
        'firebase-admin/app': false,
        'firebase-admin/auth': false,
        'firebase-admin/firestore': false,
      };
    }
    return config;
  },
};

export default nextConfig;
