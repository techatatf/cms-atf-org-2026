import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const filename = fileURLToPath(import.meta.url)
const directory = path.dirname(filename)
const publicServerURL = process.env.PAYLOAD_PUBLIC_SERVER_URL

const nextConfig: NextConfig = {
  allowedDevOrigins: publicServerURL ? [new URL(publicServerURL).hostname] : [],
  experimental: {
    useTypeScriptCli: false,
  },
  redirects: async () => [
    {
      destination: '/admin',
      permanent: false,
      source: '/',
    },
  ],
  turbopack: {
    root: path.resolve(directory),
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
