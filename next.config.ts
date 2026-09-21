import type { NextConfig } from "next";

// Export estático: la web de una clínica no necesita servidor. Se sirve desde
// cualquier CDN o GitHub Pages (NEXT_PUBLIC_BASE_PATH cuando cuelga de /<repo>/).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true },
};

export default nextConfig;
