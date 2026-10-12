import type { NextConfig } from "next";
import { cmsImageHosts } from "./src/lib/content/hosts";
import { securityHeaders } from "./src/lib/security";

const nextConfig: NextConfig = {
  // Keep `next dev` from writing instruction files into the repository.
  agentRules: false,
  poweredByHeader: false,
  images: {
    remotePatterns: cmsImageHosts.map((hostname) => ({
      protocol: "https",
      hostname,
    })),
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
