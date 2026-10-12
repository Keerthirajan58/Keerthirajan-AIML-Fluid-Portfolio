import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep `next dev` from writing instruction files into the repository.
  agentRules: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.prod.website-files.com" },
      { protocol: "https", hostname: "assets-global.website-files.com" },
      { protocol: "https", hostname: "uploads-ssl.webflow.com" },
    ],
  },
};

export default nextConfig;
