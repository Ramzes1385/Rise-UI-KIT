#!/usr/bin/env node
/**
 * Кодмод на деле: приложение «1.x» из build/tests/codemod-fixtures переводится на 2.0 командой из tarball пакета (`npm pack`),
 * после чего `vue-tsc` и `vite build` приложения проходят против кита 2.0.
 * Нужна сборка: `npm run build`. Приложение — во временной папке, `vue`, `vite` и остальные инструменты — из node_modules репозитория.
 *
 * Шаги:
 *   1. До кодмода `vue-tsc` падает (иначе фикстура не похожа на 1.x).
 *   2. `npx @ramzes1385/rise-ui-kit migrate src` (--dry) показывает diff и не меняет файлы.
 *   3. `migrate src --write` меняет файлы; повторный запуск правок не находит.
 *   4. `vue-tsc --noEmit` и `vite build` проходят; в сборке есть стили плеера (`media.css`).
 */

import { execFileSync } from 'node:child_process'
import {
	cpSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
	symlinkSync,
	writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const FIXTURES = join(ROOT, 'build/tests/codemod-fixtures/input')
const PACKAGE = '@ramzes1385/rise-ui-kit'

/** Файлы фикстуры, которые после кодмода должны собираться без ручных правок (остальные — с предупреждениями, их чинит человек). */
const LIVE_FILES = [
	'src/main.ts',
	'src/theme.ts',
	'src/other.ts',
	'src/Player.vue',
	'src/PlayerOnly.vue',
	'src/PlayerMerge.ts',
	'src/Anim.vue',
	'src/utils/layout.ts',
	'src/styles/app.scss',
]

const HARNESS = {
	'index.html':
		'<!doctype html>\n<html lang="ru"><body><div id="app"></div><script type="module" src="/src/main.ts"></script></body></html>\n',
	'vite.config.ts':
		"import vue from '@vitejs/plugin-vue'\nimport { defineConfig } from 'vite'\n\nexport default defineConfig({ plugins: [vue()] })\n",
	'tsconfig.json': JSON.stringify(
		{
			compilerOptions: {
				target: 'ES2022',
				module: 'ESNext',
				moduleResolution: 'bundler',
				strict: true,
				skipLibCheck: true,
				noEmit: true,
				lib: ['ES2022', 'DOM'],
				types: [],
			},
			include: ['src/**/*.ts', 'src/**/*.vue'],
		},
		null,
		'\t',
	),
	'package.json': JSON.stringify(
		{ name: 'legacy-app', private: true, type: 'module', dependencies: { [PACKAGE]: '*', vue: '^3.5.0' } },
		null,
		'\t',
	),
	'src/env.d.ts': "declare module '*.scss'\n",
	'src/OwnBadge.vue':
		'<script setup lang="ts">\ndefineProps<{ variant?: string; color?: string }>()\n</script>\n\n<template>\n\t<span class="own-badge"><slot /></span>\n</template>\n',
	'src/App.vue': `<script setup lang="ts">
import Anim from './Anim.vue'
import Player from './Player.vue'
import PlayerOnly from './PlayerOnly.vue'
import { config } from './other'
import { Player as MergedPlayer } from './PlayerMerge'
import { brand, calm } from './theme'
import { dynamicClass, enterClass, moved, place, placeGap, total, totalNew, totalNs } from './utils/layout'

const summary = [total, totalNew, totalNs, place, placeGap, moved, enterClass, dynamicClass, [brand, calm].length, config.motion].join(' ')
</script>

<template>
	<Anim />
	<Player />
	<PlayerOnly />
	<component :is="MergedPlayer" sources="/merged.mp4" title="Клип" />
	<p>{{ summary }}</p>
</template>
`,
}

/** Копирует файл фикстуры без суффикса `.fixture`. */
function copyFixture(rel, app) {
	const target = join(app, rel)
	mkdirSync(dirname(target), { recursive: true })
	cpSync(join(FIXTURES, `${rel}.fixture`), target)
}

function write(app, rel, text) {
	mkdirSync(dirname(join(app, rel)), { recursive: true })
	writeFileSync(join(app, rel), text)
}

function link(from, to) {
	mkdirSync(dirname(to), { recursive: true })
	symlinkSync(from, to, 'dir')
}

function run(app, command, args, label) {
	try {
		const output = execFileSync(command, args, {
			cwd: app,
			encoding: 'utf8',
			stdio: 'pipe',
			env: { ...process.env, npm_config_update_notifier: 'false' },
		})
		return { ok: true, output }
	} catch (error) {
		return { ok: false, output: `${error.stdout ?? ''}${error.stderr ?? ''}`, label }
	}
}

function fail(message, output = '') {
	console.error(`✗ ${message}`)
	if (output) console.error(output.split('\n').slice(0, 40).join('\n'))
	process.exitCode = 1
}

function snapshot(dir) {
	const files = {}
	const walk = folder => {
		for (const name of readdirSync(folder)) {
			const full = join(folder, name)
			if (statSync(full).isDirectory()) walk(full)
			else files[full.slice(dir.length + 1)] = readFileSync(full, 'utf8')
		}
	}
	walk(dir)
	return files
}

function main() {
	if (!existsSync(join(ROOT, 'dist/index.js'))) throw new Error('нет dist/ — сначала `npm run build`')
	const workdir = mkdtempSync(join(tmpdir(), 'rise-codemod-app-'))
	const app = join(workdir, 'app')
	try {
		mkdirSync(app, { recursive: true })
		const packed = JSON.parse(
			execFileSync('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', workdir], { cwd: ROOT, encoding: 'utf8' }),
		)
		const tarball = join(workdir, packed[0].filename)
		console.log(
			`tarball: ${packed[0].filename}, файлов в пакете: ${packed[0].files.length}, bin в пакете: ${packed[0].files.some(f => f.path === 'bin/rise-migrate.mjs')}`,
		)

		for (const [rel, text] of Object.entries(HARNESS)) write(app, rel, text)
		for (const rel of LIVE_FILES) copyFixture(rel, app)

		const kit = join(app, 'node_modules', PACKAGE)
		mkdirSync(kit, { recursive: true })
		execFileSync('tar', ['-xzf', tarball, '-C', kit, '--strip-components=1'])
		for (const name of [
			'vue',
			'vite',
			'typescript',
			'vue-tsc',
			'sass-embedded',
			'@vitejs/plugin-vue',
			'@fontsource-variable/inter',
			'@fontsource-variable/jetbrains-mono',
		]) {
			link(join(ROOT, 'node_modules', name), join(app, 'node_modules', name))
		}
		mkdirSync(join(app, 'node_modules/.bin'), { recursive: true })
		symlinkSync(`../${PACKAGE}/bin/rise-migrate.mjs`, join(app, 'node_modules/.bin/rise-ui-kit'))

		const vueTsc = [join(app, 'node_modules/vue-tsc/bin/vue-tsc.js'), '--noEmit', '-p', 'tsconfig.json']
		const before = run(app, 'node', vueTsc)
		if (before.ok) return fail('до кодмода vue-tsc прошёл: фикстура не похожа на приложение 1.x')
		const errorsBefore = (before.output.match(/error TS\d+/g) ?? []).length
		console.log(`1. до кодмода vue-tsc: ошибок ${errorsBefore} (ожидаемо)`)

		const sourceBefore = snapshot(join(app, 'src'))
		const dry = run(app, 'npx', ['--no-install', PACKAGE, 'migrate', 'src'])
		if (!dry.ok) return fail('npx migrate --dry завершился с ошибкой', dry.output)
		if (JSON.stringify(snapshot(join(app, 'src'))) !== JSON.stringify(sourceBefore)) return fail('--dry изменил файлы')
		if (!dry.output.includes('--- a/main.ts')) return fail('--dry не показал diff', dry.output)
		console.log(
			`2. npx migrate --dry: diff показан, файлы не изменены (${dry.output.split('\n').filter(l => l.startsWith('--- a/')).length} файлов в diff)`,
		)

		const written = run(app, 'npx', ['--no-install', PACKAGE, 'migrate', 'src', '--write'])
		if (!written.ok) return fail('npx migrate --write завершился с ошибкой', written.output)
		const after = snapshot(join(app, 'src'))
		const again = run(app, 'npx', ['--no-install', PACKAGE, 'migrate', 'src', '--write'])
		if (!again.ok || !again.output.includes('Механических правок нет.')) return fail('повторный запуск нашёл правки', again.output)
		if (JSON.stringify(snapshot(join(app, 'src'))) !== JSON.stringify(after)) return fail('повторный запуск изменил файлы')
		console.log(`3. migrate --write: ${written.output.split('\n').find(l => l.startsWith('Итого'))}; повторный запуск — правок нет`)

		const typed = run(app, 'node', vueTsc)
		if (!typed.ok) return fail('после кодмода vue-tsc падает', typed.output)
		console.log('4. после кодмода vue-tsc: ошибок 0')

		const built = run(app, 'node', [join(app, 'node_modules/vite/bin/vite.js'), 'build', '--logLevel', 'warn'])
		if (!built.ok) return fail('после кодмода vite build падает', built.output)
		const assets = readdirSync(join(app, 'dist/assets'))
		const css = assets.filter(f => f.endsWith('.css')).map(f => readFileSync(join(app, 'dist/assets', f), 'utf8'))
		if (!css.some(text => text.includes('.base-media-player'))) return fail('в сборке нет стилей плеера (media.css)')
		console.log(`5. после кодмода vite build: готово, файлов в dist/assets: ${assets.length}, стили плеера в сборке есть`)
		console.log('Кодмод: ✓ приложение 1.x из tarball переведено на 2.0, vue-tsc и vite build проходят.')
	} finally {
		rmSync(workdir, { recursive: true, force: true })
	}
}

main()
