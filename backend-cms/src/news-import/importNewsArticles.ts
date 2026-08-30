import type { Payload } from 'payload'

import type { NewsArticle } from '../payload-types'

export const newsArticleCategories = [
  'Press',
  'Programs',
  'Research',
  'Partnerships',
  'Chapters',
] as const

export type NewsImportRecord = {
  body: string[]
  category: (typeof newsArticleCategories)[number]
  excerpt: string
  featured: boolean
  legacyId: string
  publishedAt: string
  status: 'draft' | 'published'
  title: string
}

type NewsImportOutcome = {
  documentId: number | string
  legacyId: string
}

export type NewsImportResult = {
  created: NewsImportOutcome[]
  rejected: Array<{ legacyId: string; reason: string }>
  skipped: NewsImportOutcome[]
  updated: NewsImportOutcome[]
}

type RecordValidation =
  | { record: NewsImportRecord; valid: true }
  | { legacyId: string; reason: string; valid: false }

const publicNewsSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function recordValue(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function invalidRecord(
  legacyId: string,
  reason: string,
): RecordValidation {
  return { legacyId, reason, valid: false }
}

function validateNewsImportRecord(
  value: unknown,
  index: number,
): RecordValidation {
  const candidate = recordValue(value)
  const fallbackIdentifier = `record ${index + 1}`

  if (candidate === null) {
    return invalidRecord(fallbackIdentifier, 'Record must be a JSON object.')
  }

  const legacyId =
    typeof candidate.legacyId === 'string' && candidate.legacyId.length > 0
      ? candidate.legacyId
      : fallbackIdentifier

  if (
    typeof candidate.legacyId !== 'string' ||
    !publicNewsSlugPattern.test(candidate.legacyId)
  ) {
    return invalidRecord(
      legacyId,
      'legacyId must be a valid Public News Slug.',
    )
  }

  if (typeof candidate.title !== 'string' || candidate.title.trim() === '') {
    return invalidRecord(legacyId, 'title must be a non-empty string.')
  }

  if (
    typeof candidate.excerpt !== 'string' ||
    candidate.excerpt.trim() === ''
  ) {
    return invalidRecord(legacyId, 'excerpt must be a non-empty string.')
  }

  if (
    !Array.isArray(candidate.body) ||
    candidate.body.length === 0 ||
    candidate.body.some(
      (paragraph) =>
        typeof paragraph !== 'string' || paragraph.trim() === '',
    )
  ) {
    return invalidRecord(
      legacyId,
      'body must contain at least one non-empty paragraph.',
    )
  }

  if (
    typeof candidate.publishedAt !== 'string' ||
    Number.isNaN(Date.parse(candidate.publishedAt))
  ) {
    return invalidRecord(
      legacyId,
      'publishedAt must be a valid date and time string.',
    )
  }

  if (
    typeof candidate.category !== 'string' ||
    !newsArticleCategories.includes(
      candidate.category as NewsImportRecord['category'],
    )
  ) {
    return invalidRecord(
      legacyId,
      `category must be one of: ${newsArticleCategories.join(', ')}.`,
    )
  }

  if (typeof candidate.featured !== 'boolean') {
    return invalidRecord(legacyId, 'featured must be true or false.')
  }

  if (candidate.status !== 'draft' && candidate.status !== 'published') {
    return invalidRecord(
      legacyId,
      'status must be either draft or published.',
    )
  }

  return {
    record: {
      body: candidate.body as string[],
      category: candidate.category as NewsImportRecord['category'],
      excerpt: candidate.excerpt,
      featured: candidate.featured,
      legacyId: candidate.legacyId,
      publishedAt: candidate.publishedAt,
      status: candidate.status,
      title: candidate.title,
    },
    valid: true,
  }
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

function relationshipID(value: unknown): number | string | null {
  if (typeof value === 'number' || typeof value === 'string') {
    return value
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    (typeof value.id === 'number' || typeof value.id === 'string')
  ) {
    return value.id
  }

  return null
}

function lexicalBody(paragraphs: string[]): NewsArticle['body'] {
  return {
    root: {
      children: paragraphs.map((paragraph) => ({
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: paragraph,
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      })),
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

async function findExistingDocumentID(payload: Payload, legacyId: string) {
  const reservations = await payload.find({
    collection: 'news-slug-reservations',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      slug: {
        equals: legacyId,
      },
    },
  })

  return relationshipID(reservations.docs[0]?.newsArticle)
}

export async function importNewsArticles({
  overwrite,
  payload,
  records,
}: {
  overwrite: boolean
  payload: Payload
  records: unknown[]
}): Promise<NewsImportResult> {
  const result: NewsImportResult = {
    created: [],
    rejected: [],
    skipped: [],
    updated: [],
  }

  for (const [index, value] of records.entries()) {
    const validation = validateNewsImportRecord(value, index)

    if (!validation.valid) {
      result.rejected.push({
        legacyId: validation.legacyId,
        reason: validation.reason,
      })
      continue
    }

    const { record } = validation

    try {
      const existingDocumentID = await findExistingDocumentID(
        payload,
        record.legacyId,
      )

      if (existingDocumentID !== null && !overwrite) {
        result.skipped.push({
          documentId: existingDocumentID,
          legacyId: record.legacyId,
        })
        continue
      }

      const data = {
        _status: record.status,
        body: lexicalBody(record.body),
        category: record.category,
        excerpt: record.excerpt,
        featured: record.featured,
        publishedAt: record.publishedAt,
        title: record.title,
      }

      if (existingDocumentID !== null) {
        const updated = await payload.update({
          collection: 'news-articles',
          data,
          draft: false,
          id: existingDocumentID,
          overrideAccess: true,
        })
        result.updated.push({
          documentId: updated.id,
          legacyId: record.legacyId,
        })
        continue
      }

      const created = await payload.create({
        collection: 'news-articles',
        data: {
          ...data,
          generateSlug: false,
          slug: record.legacyId,
        },
        draft: record.status === 'draft',
        overrideAccess: true,
      })
      result.created.push({
        documentId: created.id,
        legacyId: record.legacyId,
      })
    } catch (error) {
      result.rejected.push({
        legacyId: record.legacyId,
        reason: errorMessage(error),
      })
    }
  }

  return result
}
