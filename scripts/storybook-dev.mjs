// Запуск Storybook dev-сервера с конфигом из build/storybook, портом 6006 по умолчанию и увеличенным лимитом памяти.
import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const dirnamePath = dirname(fileURLToPath(import.meta.url))
const memoryFlag = '--max-old-space-size=16384'
const dispatcherPath = resolve(dirnamePath, '../node_modules/storybook/dist/bin/dispatcher.js')
const cliArgs = process.argv.slice(2)

normalizeWorkingDirectory()

/** Windows: приводит букву диска к верхнему регистру, иначе Vite видит два разных пути к одним файлам. */
function normalizeWorkingDirectory() {
	const normalizedPath = process.cwd().replace(/^[a-z]:/, drive => drive.toUpperCase())

	process.chdir(normalizedPath)
}

function isPortArg(arg) {
	return arg === '-p' || arg === '--port' || arg.startsWith('--port=')
}

function buildArgs(args) {
	const portArgs = args.some(isPortArg) ? [] : ['--port', '6006']

	return [memoryFlag, dispatcherPath, 'dev', '--config-dir', 'build/storybook', ...portArgs, ...args]
}

function handleExit(code, signal) {
	if (typeof code === 'number') process.exit(code)
	if (signal) process.kill(process.pid, signal)
	process.exit(1)
}

process.env.NODE_OPTIONS = [process.env.NODE_OPTIONS, memoryFlag].filter(Boolean).join(' ')

const child = spawn(process.execPath, buildArgs(cliArgs), { stdio: 'inherit', env: process.env })

child.on('error', error => {
	console.error(error.message)
	process.exit(1)
})
child.on('exit', handleExit)
