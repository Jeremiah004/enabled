/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
  },
  experimental: {
    serverComponentsExternalPackages: [
      'resend',
      '@react-email/components',
      '@react-email/render',
    ],
  },
};

export default nextConfig;
