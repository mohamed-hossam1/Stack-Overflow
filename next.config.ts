import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["pino", "pino-pretty"],
  images: {
    qualities: [100, 75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "*",
        port: "",
      },
    ],
  },
  
};

export default nextConfig;
