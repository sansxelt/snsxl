import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/evidence/[name]": ["./assets/evidence/*.webp"],
  },
};

export default nextConfig;
