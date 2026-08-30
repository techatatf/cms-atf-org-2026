import assert from 'node:assert/strict'
import test from 'node:test'

import { localNewsSeed } from '../src/news-import/localNewsSeed'

test('Local News Seed preserves the six public identifiers as published fixtures', () => {
  assert.deepEqual(
    localNewsSeed.map(({ legacyId }) => legacyId),
    [
      'inside-atf-challenge-2026',
      'lagos-hardware-lab',
      'digital-skills-roi-report',
      'undp-partnership-renewal',
      'nairobi-largest-chapter',
      'au-digital-advisory-council',
    ],
  )
  assert.equal(localNewsSeed.length, 6)
  assert.equal(localNewsSeed.every(({ status }) => status === 'published'), true)
})
