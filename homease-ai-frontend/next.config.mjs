/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enables the standalone output, which creates a smaller deployment footprint
  // by copying only necessary files and node_modules into the .next/standalone folder.
  output: 'standalone',
  experimental: {
    // Recommended for serverless environments to optimize cold starts
    serverComponentsExternalPackages: ['@google-cloud/firestore'],
  },
};

export default nextConfig;
