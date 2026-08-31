import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import test from 'node:test'

const backendDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const repositoryDirectory = path.resolve(backendDirectory, '..')

function dockerConfigDirectory(environmentFile) {
  const directory = path.join(path.dirname(environmentFile), 'docker-config')
  mkdirSync(directory, { recursive: true })
  return directory
}

function runCompose(environmentFile, projectName, args, options = {}) {
  const dockerConfig = dockerConfigDirectory(environmentFile)
  const composeFiles = [
    'compose.yml',
    'compose.prod.yml',
    ...(options.composeFiles ?? []),
  ]
  const composeFileArgs = composeFiles.flatMap((composeFile) => ['-f', composeFile])

  const result = spawnSync(
    'docker',
    [
      'compose',
      '--env-file',
      environmentFile,
      '--project-name',
      projectName,
      ...composeFileArgs,
      ...args,
    ],
    {
      cwd: backendDirectory,
      encoding: 'utf8',
      env: {
        ...process.env,
        DOCKER_CONFIG: dockerConfig,
      },
      timeout: options.timeout ?? 600_000,
    },
  )

  if (!options.allowFailure && result.status !== 0) {
    throw new Error(
      `docker compose ${args.join(' ')} failed\n${result.stdout}\n${result.stderr}`,
    )
  }

  return result
}

function runProductionMake(environmentFile, projectName, target) {
  const result = spawnSync(
    'make',
    [
      '-C',
      'backend-cms',
      target,
      'ENV=prod',
      `ENV_FILE=${environmentFile}`,
    ],
    {
      cwd: repositoryDirectory,
      encoding: 'utf8',
      env: {
        ...process.env,
        COMPOSE_PROJECT_NAME: projectName,
        DOCKER_CONFIG: dockerConfigDirectory(environmentFile),
      },
      timeout: 600_000,
    },
  )

  if (result.status !== 0) {
    throw new Error(
      `make -C backend-cms ${target} ENV=prod failed\n${result.stdout}\n${result.stderr}`,
    )
  }

  return result
}

function inspectContainer(environmentFile, containerID) {
  const result = spawnSync(
    'docker',
    ['inspect', '--format', '{{json .State}}', containerID],
    {
      encoding: 'utf8',
      env: {
        ...process.env,
        DOCKER_CONFIG: dockerConfigDirectory(environmentFile),
      },
    },
  )

  assert.equal(result.status, 0, result.stderr)
  return JSON.parse(result.stdout)
}

async function waitForLogMessage(environmentFile, projectName, message, options = {}) {
  const deadline = Date.now() + 60_000
  const expectedOccurrences = options.occurrences ?? 1

  while (Date.now() < deadline) {
    const logs = runCompose(environmentFile, projectName, ['logs', '--no-color'], {
      allowFailure: true,
      composeFiles: options.composeFiles,
    })
    const output = `${logs.stdout}\n${logs.stderr}`

    if (output.split(message).length - 1 >= expectedOccurrences) {
      return output
    }

    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  throw new Error(`Production logs did not contain: ${message}`)
}

function createProductionEnvironment(directory) {
  const environmentFile = path.join(directory, '.env.prod')

  writeFileSync(
    environmentFile,
    [
      'POSTGRES_DB=atf_cms',
      'POSTGRES_USER=payload',
      'POSTGRES_PASSWORD=production-smoke-password',
      'DATABASE_URI=postgresql://payload:production-smoke-password@postgres:5432/atf_cms',
      'PAYLOAD_SECRET=production-smoke-secret-with-more-than-thirty-two-characters',
      'PAYLOAD_PUBLIC_SERVER_URL=https://cms.example.test',
      'PAYLOAD_PUBLIC_SITE_ORIGIN=https://www.example.test',
      'PAYLOAD_ALLOWED_ORIGINS=https://cms.example.test,https://www.example.test',
      'PAYLOAD_BIND_ADDRESS=127.0.0.1',
      'PAYLOAD_PORT=0',
      '',
    ].join('\n'),
  )

  return environmentFile
}

test(
  'production starts after committed migrations and reports database readiness',
  { timeout: 600_000 },
  async () => {
    const temporaryDirectory = mkdtempSync(path.join(tmpdir(), 'atf-cms-prod-smoke-'))
    const projectName = `atf-cms-prod-smoke-${process.pid}-${Date.now()}`
      .toLowerCase()
      .replaceAll(/[^a-z0-9_-]/g, '')
    const environmentFile = createProductionEnvironment(temporaryDirectory)

    try {
      runProductionMake(environmentFile, projectName, 'build')
      runCompose(environmentFile, projectName, [
        'up',
        '-d',
        '--wait',
        '--wait-timeout',
        '180',
      ])

      const healthResponse = runCompose(environmentFile, projectName, [
        'exec',
        '-T',
        'payload',
        'node',
        '-e',
        "fetch('http://127.0.0.1:3001/api/health').then(async (response) => { console.log(JSON.stringify({ body: await response.json(), status: response.status })) })",
      ])

      assert.deepEqual(JSON.parse(healthResponse.stdout.trim()), {
        body: { status: 'ok' },
        status: 200,
      })

      const registrationResponse = runCompose(environmentFile, projectName, [
        'exec',
        '-T',
        'payload',
        'node',
        '-e',
        `fetch('http://127.0.0.1:3001/api/users/first-register', {
          body: JSON.stringify({
            email: 'production-smoke-admin@example.test',
            password: 'production-smoke-admin-password',
          }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        }).then(async (response) => {
          console.log(JSON.stringify({
            body: await response.json(),
            setCookie: response.headers.get('set-cookie'),
            status: response.status,
          }))
        })`,
      ])
      const registration = JSON.parse(registrationResponse.stdout.trim())

      assert.equal(registration.status, 200)
      assert.match(registration.setCookie, /; Secure=true(?:;|$)/)

      const migrationCount = runCompose(environmentFile, projectName, [
        'exec',
        '-T',
        'postgres',
        'psql',
        '-U',
        'payload',
        '-d',
        'atf_cms',
        '-Atc',
        'select count(*) from payload_migrations;',
      ])

      assert.ok(Number.parseInt(migrationCount.stdout.trim(), 10) > 0)

      runCompose(environmentFile, projectName, [
        'exec',
        '-T',
        'postgres',
        'psql',
        '-U',
        'payload',
        '-d',
        'atf_cms',
        '-c',
        "create table production_smoke_marker (value text not null); insert into production_smoke_marker values ('preserved');",
      ])
      runCompose(environmentFile, projectName, [
        'exec',
        '-T',
        'payload',
        'sh',
        '-c',
        "printf 'preserved' > /app/media/production-smoke-marker.txt",
      ])

      for (const lifecycleTarget of ['stop', 'down']) {
        runProductionMake(environmentFile, projectName, lifecycleTarget)
        runProductionMake(environmentFile, projectName, 'start')
        runCompose(environmentFile, projectName, [
          'up',
          '-d',
          '--wait',
          '--wait-timeout',
          '180',
        ])

        const databaseMarker = runCompose(environmentFile, projectName, [
          'exec',
          '-T',
          'postgres',
          'psql',
          '-U',
          'payload',
          '-d',
          'atf_cms',
          '-Atc',
          'select value from production_smoke_marker;',
        ])
        const mediaMarker = runCompose(environmentFile, projectName, [
          'exec',
          '-T',
          'payload',
          'cat',
          '/app/media/production-smoke-marker.txt',
        ])

        assert.equal(databaseMarker.stdout.trim(), 'preserved')
        assert.equal(mediaMarker.stdout.trim(), 'preserved')
      }
    } catch (error) {
      const logs = runCompose(environmentFile, projectName, ['logs', '--no-color'], {
        allowFailure: true,
      })
      throw new Error(`${error.message}\nProduction logs:\n${logs.stdout}\n${logs.stderr}`)
    } finally {
      runCompose(
        environmentFile,
        projectName,
        ['down', '--volumes', '--rmi', 'local', '--remove-orphans'],
        { allowFailure: true },
      )
      rmSync(temporaryDirectory, { force: true, recursive: true })
    }
  },
)

test(
  'a failed production migration keeps Payload unready and refuses requests',
  { timeout: 600_000 },
  async () => {
    const temporaryDirectory = mkdtempSync(path.join(tmpdir(), 'atf-cms-prod-failure-'))
    const projectName = `atf-cms-prod-failure-${process.pid}-${Date.now()}`
      .toLowerCase()
      .replaceAll(/[^a-z0-9_-]/g, '')
    const environmentFile = createProductionEnvironment(temporaryDirectory)
    const composeFiles = ['tests/fixtures/compose.failed-migration.yml']

    try {
      runCompose(environmentFile, projectName, ['build'], { composeFiles })
      runCompose(environmentFile, projectName, ['up', '-d'], { composeFiles })

      const logs = await waitForLogMessage(
        environmentFile,
        projectName,
        'Intentional production smoke migration failure.',
        { composeFiles, occurrences: 2 },
      )

      assert.doesNotMatch(logs, /Ready in/)

      const containerID = runCompose(environmentFile, projectName, ['ps', '-q', 'payload'], {
        composeFiles,
      }).stdout.trim()
      assert.notEqual(containerID, '')

      const state = inspectContainer(environmentFile, containerID)
      assert.notEqual(state.Health?.Status, 'healthy')

      const wgetAvailable = runCompose(
        environmentFile,
        projectName,
        ['exec', '-T', 'postgres', 'sh', '-c', 'command -v wget'],
        { composeFiles },
      )
      assert.notEqual(wgetAvailable.stdout.trim(), '')

      const request = runCompose(
        environmentFile,
        projectName,
        [
          'exec',
          '-T',
          'postgres',
          'wget',
          '-q',
          '-T',
          '2',
          '-O',
          '-',
          'http://payload:3001/api/health',
        ],
        { allowFailure: true, composeFiles },
      )
      assert.notEqual(request.status, 0)
    } catch (error) {
      const logs = runCompose(environmentFile, projectName, ['logs', '--no-color'], {
        allowFailure: true,
        composeFiles,
      })
      throw new Error(`${error.message}\nProduction logs:\n${logs.stdout}\n${logs.stderr}`)
    } finally {
      runCompose(
        environmentFile,
        projectName,
        ['down', '--volumes', '--rmi', 'local', '--remove-orphans'],
        { allowFailure: true, composeFiles },
      )
      rmSync(temporaryDirectory, { force: true, recursive: true })
    }
  },
)
