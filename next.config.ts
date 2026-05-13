import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Tree-shake heavy icon and chart libraries to reduce bundle size
    optimizePackageImports: [
      'lucide-react',
      'recharts', 
      'framer-motion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-tooltip',
    ],
  },
};

export default nextConfig;
