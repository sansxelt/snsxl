import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/evidence/[name]": ["./assets/evidence/*.webp", "./assets/evidence/*.jpg", "./assets/evidence/*.png"],
  },
};

export default nextConfig;
