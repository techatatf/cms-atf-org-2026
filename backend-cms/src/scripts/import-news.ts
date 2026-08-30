import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { getPayload, type Payload } from 'payload'

import {
  importNewsArticles,
  type NewsImportResult,
} from '../news-import/importNewsArticles'
import config from '../payload.config'

const fileArgumentIndex = process.argv.indexOf('--file')
const datasetPath = process.argv[fileArgumentIndex + 1]

if (fileArgumentIndex === -1 || !datasetPath || datasetPath.startsWith('--')) {
  console.error('Approved News Dataset import requires --file <path>.')
  process.exit(1)
} else {
  const exitCode = await runImport(
    datasetPath,
    process.argv.includes('--overwrite'),
  )

  process.exit(exitCode)
}

function printResult(result: NewsImportResult) {
  console.log(`Created: ${result.created.length}`)
  console.log(`Skipped: ${result.skipped.length}`)
  console.log(`Updated: ${result.updated.length}`)
  console.log(`Rejected: ${result.rejected.length}`)

  for (const outcome of result.created) {
    console.log(`created ${outcome.legacyId} as News Article ${outcome.documentId}`)
  }

  for (const outcome of result.skipped) {
    console.log(`skipped ${outcome.legacyId} at News Article ${outcome.documentId}`)
  }

  for (const outcome of result.updated) {
    console.log(`updated ${outcome.legacyId} at News Article ${outcome.documentId}`)
  }

  for (const outcome of result.rejected) {
    console.log(`rejected ${outcome.legacyId}: ${outcome.reason}`)
  }
}

async function runImport(file: string, overwrite: boolean) {
  let payload: Payload | undefined

  try {
    const source = await readFile(path.resolve(file), 'utf8')
    const records: unknown = JSON.parse(source)

    if (!Array.isArray(records)) {
      throw new Error('Approved News Dataset must be a JSON array.')
    }

    payload = await getPayload({ config })
    const result = await importNewsArticles({ overwrite, payload, records })

    printResult(result)

    return result.rejected.length > 0 ? 1 : 0
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    console.error(`Approved News Dataset import failed: ${message}`)
    return 1
  } finally {
    await payload?.destroy()
  }
}
