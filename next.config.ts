import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pazhwlmwkhlcuiikirpc.supabase.co",
        pathname: "/storage/v1/object/public/service-images/**",
      },
    ],
  },
};

export default nextConfig;
