/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
  },
};

export default nextConfig;
