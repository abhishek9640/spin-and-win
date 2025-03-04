import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/5.x/initials/svg",
      },
      {
        protocol: "https",
        hostname: "spinwin.shreyanshkataria.com",
        pathname: "/image/**",
      },
    ],
    domains: ["api.dicebear.com", "spinwin.shreyanshkataria.com"], 
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
