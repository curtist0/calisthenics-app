/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "wger.de" },
    ],
  },
};

export default nextConfig;
