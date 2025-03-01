import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/5.x/initials/svg",
      },
    ],
    domains: ["api.dicebear.com"], // Ensure this is present
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
