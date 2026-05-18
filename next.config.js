/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  transpilePackages: ['geist', 'leaflet'],
  reactStrictMode: true,
}

module.exports = nextConfig
