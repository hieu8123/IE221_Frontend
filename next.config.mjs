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
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "/**", // Cho phép tất cả đường dẫn trên hostname này
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "/**", // Cho phép tất cả đường dẫn trên hostname này
      },
      {
        protocol: "https",
        hostname: "flowbite.s3.amazonaws.com",
        pathname: "/**", // Cho phép tất cả đường dẫn trên hostname này
      },
      {
        protocol: "https",
        hostname: "cdn.hoanghamobile.com",
        pathname: "/**", // Cho phép tất cả đường dẫn trên hostname này
      },
    ],
  },
};

export default nextConfig;
