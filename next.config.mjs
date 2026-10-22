/** @type {import('next').NextConfig} */
import withPWAInit  from '@ducanh2912/next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
})

const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default withPWA(nextConfig)
