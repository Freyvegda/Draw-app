/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: "../../", // adjust depending on your monorepo layout
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
