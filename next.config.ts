import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable source maps in production to reduce build time and bundle size
  productionBrowserSourceMaps: false,
  
  // Reduce memory usage during builds
  outputFileTracingIncludes: {},
  
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
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
    ],
    
    // Enable parallel routes compilation for faster builds
    parallelServerCompiles: true,
    parallelServerBuildTraces: true,
  },
  
};

export default nextConfig;
