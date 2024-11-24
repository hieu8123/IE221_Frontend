/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**", // Cho phép tất cả đường dẫn trên hostname này
      },
      {
        protocol: "https",
        hostname: "cdn1.viettelstore.vn",
        pathname: "/**", // Cho phép tất cả đường dẫn trên hostname này
      },
    ],
  },
};

export default nextConfig;
