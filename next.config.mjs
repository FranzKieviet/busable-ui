// Served at franzkieviet.com/busable (proxied from the personal website)
const basePath = "/busable";

const nextConfig = {
  reactCompiler: true,
  basePath,
  env: {
    // basePath isn't applied to fetch() or next/image src, so expose it for those
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      // Keep the bare Amplify domain working
      { source: "/", destination: basePath, basePath: false, permanent: false },
    ];
  },
};

export default nextConfig;
