/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nenapidu-s3.s3.us-east-1.amazonaws.com",
        port: "",
        pathname: "/profiles/**",
      },
    ],
  },
};

module.exports = nextConfig;
