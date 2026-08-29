import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig } from 'payload'

import { Media } from './collections/Media'
import { NewsArticles } from './collections/NewsArticles'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const directory = path.dirname(filename)
const publicServerURL = process.env.PAYLOAD_PUBLIC_SERVER_URL
const allowedOrigins = Array.from(
  new Set(
    [publicServerURL, ...(process.env.PAYLOAD_ALLOWED_ORIGINS || '').split(',')]
      .map((origin) => origin?.trim())
      .filter((origin): origin is string => Boolean(origin)),
  ),
)

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(directory),
    },
    user: Users.slug,
  },
  collections: [Users, Media, NewsArticles],
  cors: allowedOrigins,
  csrf: allowedOrigins,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  serverURL: publicServerURL,
  typescript: {
    outputFile: path.resolve(directory, 'payload-types.ts'),
  },
})
