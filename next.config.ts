import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["192.168.29.90"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  webpack(config) {
    for (const rule of config.module.rules) {
      if (!rule || typeof rule !== "object" || !rule.oneOf) continue;
      for (const item of rule.oneOf) {
        if (!item || !Array.isArray(item.use)) continue;
        for (const useItem of item.use) {
          if (
            useItem?.loader?.includes("css-loader") &&
            useItem?.options &&
            typeof useItem.options === "object"
          ) {
            useItem.options.url = false;
          }
        }
      }
    }
    return config;
  },
};

export default nextConfig;
