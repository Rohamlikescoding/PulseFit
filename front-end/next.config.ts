import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["recharts"],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.workoutapi.com",
      },
    ],
  },
  output: "export",
  trailingSlash: true,
  basePath: "/PulseFit",
  assetPrefix: "/PulseFit/",
};

export default nextConfig;
