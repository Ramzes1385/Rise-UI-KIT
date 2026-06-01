// Запуск Storybook с увеличенным лимитом памяти и нужными патчами аддонов.
import { spawn, spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const dirnamePath = dirname(fileURLToPath(import.meta.url))
const memoryFlag = '--max-old-space-size=16384'
const dispatcherPath = resolve(dirnamePath, '../node_modules/storybook/dist/bin/dispatcher.js')
const heartbeatPatchPath = resolve(dirnamePath, 'patch-storybook-heartbeat.mjs')
const coveragePercentPatchPath = resolve(dirnamePath, 'patch-storybook-coverage-percentage.mjs')
const cliArgs = process.argv.slice(2)

patchHeartbeatTimeout()
patchCoveragePercentage()
normalizeWorkingDirectory()

function patchHeartbeatTimeout() {
  const result = spawnSync(process.execPath, [heartbeatPatchPath], { stdio: 'inherit' })

  if (result.error || result.status !== 0) {
    console.warn('[storybook-dev] heartbeat-патч не применился; ошибка "Server timed out" может вернуться')
  }
}

function patchCoveragePercentage() {
  const result = spawnSync(process.execPath, [coveragePercentPatchPath], { stdio: 'inherit' })

  if (result.error || result.status !== 0) {
    console.warn('[storybook-dev] coverage-percentage-патч не применился; цифра в кнопке покрытия может быть storybook-only')
  }
}

function normalizeWorkingDirectory() {
  const normalizedPath = process.cwd().replace(/^[a-z]:/, drive => drive.toUpperCase())

  process.chdir(normalizedPath)
}

function isPortArg(arg) {
  return arg === '-p' || arg === '--port' || arg.startsWith('--port=')
}

function hasPortArg(args) {
  return args.some(isPortArg)
}

function buildArgs(args) {
  const portArgs = hasPortArg(args) ? [] : ['--port', '6006']

  return [memoryFlag, dispatcherPath, 'dev', '--config-dir', 'build/storybook', ...portArgs, ...args]
}

function buildOptions() {
  process.env.NODE_OPTIONS = [process.env.NODE_OPTIONS, memoryFlag].filter(Boolean).join(' ')

  return {
    stdio: 'inherit',
    env: process.env,
  }
}

function handleError(error) {
  console.error(error.message)
  process.exit(1)
}

function handleExit(code, signal) {
  if (typeof code === 'number') {
    process.exit(code)
  }

  if (signal) {
    process.kill(process.pid, signal)
  }

  process.exit(1)
}

const child = spawn(process.execPath, buildArgs(cliArgs), buildOptions())

child.on('error', handleError)
child.on('exit', handleExit)
