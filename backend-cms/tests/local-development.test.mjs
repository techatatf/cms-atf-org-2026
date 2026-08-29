import assert from 'node:assert/strict'
import {
  chmodSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { spawnSync } from 'node:child_process'
import test from 'node:test'

const backendDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const repositoryRoot = path.resolve(backendDirectory, '..')

function createDockerRecorder() {
  const directory = mkdtempSync(path.join(tmpdir(), 'atf-cms-docker-'))
  const executable = path.join(directory, 'docker')
  const log = path.join(directory, 'docker.log')

  writeFileSync(executable, '#!/bin/sh\nprintf "%s\\n" "$*" >> "$DOCKER_LOG"\n')
  chmodSync(executable, 0o755)

  return {
    cleanup: () => rmSync(directory, { force: true, recursive: true }),
    directory,
    log,
  }
}

function runMake(cwd, target, recorder, extraEnvironment = {}) {
  return spawnSync('make', [target], {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      ...extraEnvironment,
      DOCKER_LOG: recorder.log,
      PATH: `${recorder.directory}:${process.env.PATH}`,
    },
  })
}

test('root and Backend CMS commands use the development Compose configuration by default', () => {
  const expectedCalls = {
    build: 'compose -f compose.yml -f compose.dev.yml build',
    down: 'compose -f compose.yml -f compose.dev.yml down --remove-orphans',
    logs: 'compose -f compose.yml -f compose.dev.yml logs --follow',
    start: 'compose -f compose.yml -f compose.dev.yml up -d --remove-orphans',
    stop: 'compose -f compose.yml -f compose.dev.yml stop',
  }

  for (const cwd of [repositoryRoot, backendDirectory]) {
    for (const [target, expectedCall] of Object.entries(expectedCalls)) {
      const recorder = createDockerRecorder()

      try {
        const result = runMake(cwd, target, recorder)

        assert.equal(result.status, 0, `${cwd}: make ${target}\n${result.stderr}`)
        const actualCall = existsSync(recorder.log)
          ? readFileSync(recorder.log, 'utf8').trim()
          : ''
        assert.equal(actualCall, expectedCall)
      } finally {
        recorder.cleanup()
      }
    }
  }
})

test('development Compose exposes Payload on port 3001 and keeps PostgreSQL private', () => {
  const result = spawnSync(
    'docker',
    ['compose', '-f', 'compose.yml', '-f', 'compose.dev.yml', 'config', '--format', 'json'],
    {
      cwd: backendDirectory,
      encoding: 'utf8',
      env: {
        ...process.env,
        PAYLOAD_ALLOWED_ORIGINS: 'http://localhost:3001',
        PAYLOAD_PUBLIC_SERVER_URL: 'http://192.168.1.99:3001',
      },
    },
  )

  assert.equal(result.status, 0, result.stderr)

  const configuration = JSON.parse(result.stdout)
  assert.deepEqual(Object.keys(configuration.services).sort(), ['payload', 'postgres'])

  const payload = configuration.services.payload
  const postgres = configuration.services.postgres

  assert.equal(postgres.ports, undefined)
  assert.ok(
    payload.ports.some(
      (port) => String(port.published) === '3001' && Number(port.target) === 3001,
    ),
  )
  assert.equal(payload.depends_on.postgres.condition, 'service_healthy')
  assert.match(payload.environment.DATABASE_URI, /@postgres:5432\//)
  assert.equal(payload.environment.PAYLOAD_ALLOWED_ORIGINS, 'http://localhost:3001')
  assert.equal(payload.environment.PAYLOAD_PUBLIC_SERVER_URL, 'http://192.168.1.99:3001')

  const mediaVolume = payload.volumes.find((volume) => volume.target === '/app/media')
  const databaseVolume = postgres.volumes.find(
    (volume) => volume.target === '/var/lib/postgresql/data',
  )

  assert.equal(mediaVolume.source, 'payload_media')
  assert.equal(databaseVolume.source, 'postgres_data')
  assert.notEqual(mediaVolume.source, databaseVolume.source)
  assert.ok(
    payload.volumes.some(
      (volume) => volume.type === 'bind' && volume.target === '/app',
    ),
  )
  assert.deepEqual(payload.command, ['npm', 'run', 'dev'])
})

test('development Compose allows the local public site to read Payload', () => {
  const result = spawnSync(
    'docker',
    ['compose', '-f', 'compose.yml', '-f', 'compose.dev.yml', 'config', '--format', 'json'],
    {
      cwd: backendDirectory,
      encoding: 'utf8',
      env: {
        ...process.env,
        PAYLOAD_ALLOWED_ORIGINS: '',
      },
    },
  )

  assert.equal(result.status, 0, result.stderr)

  const configuration = JSON.parse(result.stdout)
  assert.equal(
    configuration.services.payload.environment.PAYLOAD_ALLOWED_ORIGINS,
    'http://localhost:3000,http://localhost:3001',
  )
})

test('destroy refuses to remove persistent volumes without explicit confirmation', () => {
  for (const cwd of [repositoryRoot, backendDirectory]) {
    const recorder = createDockerRecorder()

    try {
      const refused = runMake(cwd, 'destroy', recorder)

      assert.notEqual(refused.status, 0)
      assert.match(refused.stdout, /Refusing to delete PostgreSQL and media volumes\./)
      assert.equal(existsSync(recorder.log), false)

      const confirmed = runMake(cwd, 'destroy', recorder, { CONFIRM: 'destroy' })

      assert.equal(confirmed.status, 0, confirmed.stderr)
      assert.equal(
        readFileSync(recorder.log, 'utf8').trim(),
        'compose -f compose.yml -f compose.dev.yml down --volumes --remove-orphans',
      )
    } finally {
      recorder.cleanup()
    }
  }
})

async function loadPayloadJWTExtractor() {
  const moduleURL = pathToFileURL(
    path.join(backendDirectory, 'node_modules/payload/dist/auth/extractJWT.js'),
  )
  const { extractJWT } = await import(moduleURL.href)

  return extractJWT
}

function createPayloadAuthContext(csrf) {
  return {
    config: {
      auth: {
        jwtOrder: ['cookie'],
      },
      cookiePrefix: 'payload',
      csrf,
    },
  }
}

test('Payload accepts LAN cookie authentication from an allowed referrer without fetch metadata', async () => {
  const extractJWT = await loadPayloadJWTExtractor()
  const lanOrigin = 'http://192.168.1.99:3001'
  const token = 'synthetic-test-token'
  const headers = new Headers({
    Cookie: `payload-token=${token}`,
    Host: '192.168.1.99:3001',
    Referer: `${lanOrigin}/admin/login`,
  })

  assert.equal(
    extractJWT({
      headers,
      payload: createPayloadAuthContext([lanOrigin]),
    }),
    token,
  )
})

test('Payload rejects missing, mismatched, and cross-site LAN cookie authentication evidence', async () => {
  const extractJWT = await loadPayloadJWTExtractor()
  const lanOrigin = 'http://192.168.1.99:3001'
  const token = 'synthetic-test-token'
  const payload = createPayloadAuthContext([lanOrigin])
  const baseHeaders = {
    Cookie: `payload-token=${token}`,
    Host: '192.168.1.99:3001',
  }

  assert.equal(extractJWT({ headers: new Headers(baseHeaders), payload }), null)
  assert.equal(
    extractJWT({
      headers: new Headers({
        ...baseHeaders,
        Referer: 'http://untrusted.example/admin/login',
      }),
      payload,
    }),
    null,
  )
  assert.equal(
    extractJWT({
      headers: new Headers({
        ...baseHeaders,
        Referer: `${lanOrigin}/admin/login`,
        'Sec-Fetch-Site': 'cross-site',
      }),
      payload,
    }),
    null,
  )
})
