// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   turbopack: {},
//   webpack: (config) => {
//     config.resolve.alias = {
//       ...config.resolve.alias,
//       "plotly.js": "plotly.js-dist-min",
//     };
//     return config;
//   },
// };

// export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove static export - it breaks JavaScript
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  turbopack: {
    resolveAlias: {
      "plotly.js": "plotly.js-dist-min",
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "plotly.js": "plotly.js-dist-min",
    };
    return config;
  },
};

export default nextConfig;
