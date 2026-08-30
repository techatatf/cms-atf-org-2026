import { getPayload, type Payload } from 'payload'

import {
  importNewsArticles,
  type NewsImportResult,
} from '../news-import/importNewsArticles'
import { localNewsSeed } from '../news-import/localNewsSeed'
import config from '../payload.config'

if (process.env.NODE_ENV === 'production') {
  console.error('Local News Seed refuses to run when NODE_ENV is production.')
  process.exit(1)
} else {
  const exitCode = await runSeed(process.argv.includes('--overwrite'))

  process.exit(exitCode)
}

function printResult(result: NewsImportResult) {
  console.log(`Created: ${result.created.length}`)
  console.log(`Skipped: ${result.skipped.length}`)
  console.log(`Updated: ${result.updated.length}`)
  console.log(`Rejected: ${result.rejected.length}`)

  for (const outcome of result.rejected) {
    console.log(`rejected ${outcome.legacyId}: ${outcome.reason}`)
  }
}

async function runSeed(overwrite: boolean) {
  let payload: Payload | undefined

  try {
    payload = await getPayload({ config })
    const result = await importNewsArticles({
      overwrite,
      payload,
      records: localNewsSeed,
    })

    printResult(result)

    return result.rejected.length > 0 ? 1 : 0
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    console.error(`Local News Seed failed: ${message}`)
    return 1
  } finally {
    await payload?.destroy()
  }
}
