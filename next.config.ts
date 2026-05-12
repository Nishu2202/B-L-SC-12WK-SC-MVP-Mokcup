import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable source maps in production to reduce build time
  productionBrowserSourceMaps: false,
  
  experimental: {
    // Optimize package imports - tree-shake heavy libraries
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
