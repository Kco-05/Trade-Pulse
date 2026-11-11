import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [
      {
        source: "/api/users/:path*",
        destination: "http://localhost:8081/api/users/:path*",
      },
      {
        source: "/api/stocks/:path*",
        destination: "http://localhost:8082/api/stocks/:path*",
      },
      {
        source: "/api/trade/:path*",
        destination: "http://localhost:8083/api/trade/:path*",
      },
      {
        source: "/api/portfolio/:path*",
        destination: "http://localhost:8083/api/portfolio/:path*",
      },
    ];
  },
};

export default nextConfig;
