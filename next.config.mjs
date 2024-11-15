const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  reactStrictMode: true, // Enable React strict mode for better error detection
  swcMinify: true,       // Use SWC for faster production builds
  devIndicators: {
    autoPrerender: false, // Disable live reload indicators in production
  },
  poweredByHeader: false, // Remove the "X-Powered-By: Next.js" header
  compress: isProd,       // Enable compression only in production
};

export default nextConfig;
