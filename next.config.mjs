/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Chấp nhận tất cả hostname
        pathname: "/**", // Cho phép tất cả đường dẫn trên hostname này
      },
    ],
  },
};

export default nextConfig;
