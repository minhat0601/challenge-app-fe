/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Tắt kiểm tra ESLint trong quá trình build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Tắt kiểm tra TypeScript trong quá trình build
    ignoreBuildErrors: true,
  },
  // Bỏ qua lỗi khi export
  output: 'standalone',
};

module.exports = nextConfig;
