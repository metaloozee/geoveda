import "@geoveda/env/web";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  env: {
    SITE_URL: process.env.SITE_URL,
  },
};

export default nextConfig;
