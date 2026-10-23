/**
 * Автоимпорт на деле: приложения из tarball пакета (`npm pack`) с пакетами из реестра npm. Нужны сборка (`npm run build`) и сеть,
 * поэтому в `ci:validate` скрипт не входит (DECISIONS w16-autoimport). Всё — во временной папке; в репозиторий ничего не ставится.
 *
 * - Vite + `unplugin-vue-components` с `RiseUiResolver`: в шаблоне `<BaseButton>` и `<BaseSelect>` без импортов; в JS и CSS только они
 *   и то, что они используют (нет BaseTable и BaseEditor); с `tokens: true` токены приходят сами; в браузере компоненты отрисованы,
 *   список открывается, ошибок в консоли нет;
 * - `vue-tsc` со `strictTemplates`: верный шаблон проходит (и вместе с `components.d.ts` плагина), опечатка в пропе
 *   (`variantt`) и неверное значение (`variant="nope"`) — ошибки; типы подключены строкой `/// <reference types=".../global" />`
 *   и (отдельным проходом) полем `types` в tsconfig;
 * - Nuxt (`nuxt build`): модуль `@ramzes1385/rise-ui-kit/nuxt`, `<BaseButton>` и `<UiBaseButton>` (с `prefix`) на странице SSR,
 *   токены в CSS, плагин настроек ставит тему, в браузере нет ошибок.
 *
 * Флаги: `--no-nuxt` — без Nuxt (≈550 пакетов); `--no-screenshot` — без Playwright (нет Chromium); `--keep` — не удалять папку.
 * Версии пакетов реестра — в `REGISTRY_PACKAGES`; Playwright берётся из node_modules репозитория.
 */

import { execFileSync, spawn } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { gzipSync } from 'node:zlib'
import { build, preview } from 'vite'

const ROOT = resolve(join(import.meta.dirname, '..'))
const PACKAGE = '@ramzes1385/rise-ui-kit'
const args = process.argv.slice(2)
const NUXT = !args.includes('--no-nuxt')
const BROWSER = !args.includes('--no-screenshot')

const REGISTRY_PACKAGES = {
	vite: '^8.0.15',
	vue: '^3.5.0',
	'@vitejs/plugin-vue': '^6.0.0',
	'unplugin-vue-components': '^32.1.0',
	'vue-tsc': '^3.3.0',
	typescript: '~6.0.3',
}
const NUXT_PACKAGES = { nuxt: '^4.6.0', vue: '^3.5.0', 'vue-router': '^4.5.0' }

const kb = bytes => `${(bytes / 1024).toFixed(1)} КБ`
const expect = (problems, condition, message) => {
	if (!condition) problems.push(message)
}

const APP_VUE = `<script setup lang="ts">
import { ref } from 'vue'
const city = ref<string | number | (string | number)[]>('spb')
const options = [
	{ value: 'msk', label: 'Москва' },
	{ value: 'spb', label: 'Санкт-Петербург' },
	{ value: 'vlg', label: 'Волгоград' },
]
</script>

<template>
	<main style="padding: 24px; width: 320px; height: 320px">
		<BaseButton variant="soft">Сохранить</BaseButton>
		<BaseSelect v-model="city" label="Город" :options="options" />
	</main>
</template>
`

const TYPO_VUE = `<template>
	<BaseButton variantt="soft">Сохранить</BaseButton>
	<BaseButton variant="nope">Сохранить</BaseButton>
</template>
`

const MAIN_TS = tokens => `${tokens ? `import '${PACKAGE}/tokens.css'\n` : ''}import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
`

const VITE_CONFIG = options => `import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import { RiseUiResolver } from '${PACKAGE}/resolver'

export default defineConfig({
	plugins: [vue(), Components({ resolvers: [RiseUiResolver(${options})], dts: ${options.includes('tokens') ? 'false' : "'components.d.ts'"} })],
})
`

const TSCONFIG = (include, types = []) =>
	JSON.stringify(
		{
			compilerOptions: {
				target: 'ES2022',
				module: 'ESNext',
				moduleResolution: 'Bundler',
				strict: true,
				skipLibCheck: true,
				noEmit: true,
				jsx: 'preserve',
				lib: ['ES2022', 'DOM'],
				types,
			},
			include,
			vueCompilerOptions: { strictTemplates: true },
		},
		null,
		'\t',
	)

function packTarball(dir) {
	if (!existsSync(join(ROOT, 'dist/resolver.js'))) throw new Error('нет dist/ с автоимпортом — сначала `npm run build`')
	const output = execFileSync('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', dir], { cwd: ROOT, encoding: 'utf8' })
	return join(dir, JSON.parse(output)[0].filename)
}

function install(dir, packages, tarball) {
	const dependencies = { ...packages, [PACKAGE]: `file:${tarball}` }
	writeFileSync(
		join(dir, 'package.json'),
		`${JSON.stringify({ name: 'rise-autoimport-app', private: true, type: 'module', dependencies })}\n`,
	)
	execFileSync('npm', ['install', '--no-audit', '--no-fund', '--legacy-peer-deps', '--ignore-scripts'], { cwd: dir, stdio: 'inherit' })
}

function write(dir, files) {
	for (const [name, content] of Object.entries(files)) {
		mkdirSync(join(dir, name, '..'), { recursive: true })
		writeFileSync(join(dir, name), content)
	}
}

async function openPage(url, work) {
	const { createRequire } = await import('node:module')
	const { chromium } = createRequire(join(ROOT, 'package.json'))('playwright')
	const browser = await chromium.launch()
	const page = await browser.newPage({ viewport: { width: 400, height: 400 }, reducedMotion: 'reduce' })
	const errors = []
	page.on('pageerror', error => errors.push(error.message))
	page.on('console', message => ['error', 'warning'].includes(message.type()) && errors.push(`${message.type()}: ${message.text()}`))
	try {
		await page.goto(url)
		await work(page)
		return errors
	} finally {
		await browser.close()
	}
}

async function viteScenario(app, name, config, tokensInMain, problems) {
	const dir = join(app, 'vite')
	write(dir, {
		'index.html':
			'<!doctype html><html lang="ru"><body><div id="app"></div><script type="module" src="/src/main.ts"></script></body></html>\n',
		'src/main.ts': MAIN_TS(tokensInMain),
		'src/App.vue': APP_VUE,
		[`vite.${name}.config.ts`]: config,
	})
	const outDir = join(dir, `dist-${name}`)
	await build({ root: dir, configFile: join(dir, `vite.${name}.config.ts`), logLevel: 'error', build: { outDir, emptyOutDir: true } })
	const read = extension => {
		const assets = join(outDir, 'assets')
		const files = readdirSync(assets).filter(file => file.endsWith(extension))
		return {
			text: files.map(file => readFileSync(join(assets, file), 'utf8')).join('\n'),
			gzip: files.reduce((sum, file) => sum + gzipSync(readFileSync(join(assets, file)), { level: 9 }).length, 0),
		}
	}
	const js = read('.js')
	const css = read('.css')
	console.log(`  vite-${name}: JS ${kb(js.gzip)}, CSS ${kb(css.gzip)}`)
	for (const marker of ['base-button', 'base-select']) {
		expect(problems, js.text.includes(marker), `vite-${name}: в JS нет ${marker} — компонент не подключился без импорта`)
		expect(problems, css.text.includes(`.${marker}`), `vite-${name}: в CSS нет .${marker}`)
	}
	expect(problems, !/base-table|base-editor/.test(js.text), `vite-${name}: в JS есть BaseTable или BaseEditor`)
	expect(problems, !css.text.includes('.base-table'), `vite-${name}: в CSS есть .base-table`)
	expect(problems, css.text.includes('--rise-color-primary-500'), `vite-${name}: в CSS нет токенов`)
	if (!BROWSER) return
	const server = await preview({ root: dir, configFile: false, logLevel: 'error', build: { outDir }, preview: { port: 0 } })
	try {
		const errors = await openPage(server.resolvedUrls.local[0], async page => {
			await page.locator('.base-button').first().waitFor({ timeout: 5000 })
			await page.getByRole('combobox').first().click()
			await page.getByRole('option', { name: 'Волгоград' }).waitFor({ timeout: 5000 })
		})
		expect(problems, errors.length === 0, `vite-${name}: ошибки в консоли браузера: ${errors.join('; ')}`)
	} catch (error) {
		problems.push(`vite-${name}: компоненты не отрисовались в браузере: ${error.message.split('\n')[0]}`)
	} finally {
		await server.close()
	}
}

function vueTsc(dir, project) {
	try {
		execFileSync(join(dir, 'node_modules/.bin/vue-tsc'), ['--noEmit', '-p', project], { cwd: dir, encoding: 'utf8', stdio: 'pipe' })
		return { code: 0, output: '' }
	} catch (error) {
		return { code: error.status ?? 1, output: `${error.stdout ?? ''}${error.stderr ?? ''}` }
	}
}

function typesScenario(app, problems) {
	const dir = join(app, 'vite')
	write(dir, {
		'src/env.d.ts': `/// <reference types="${PACKAGE}/global" />\n`,
		'src/Typo.vue': TYPO_VUE,
		'tsconfig.ok.json': TSCONFIG(['src/main.ts', 'src/App.vue', 'src/env.d.ts', 'components.d.ts']),
		'tsconfig.types-field.json': TSCONFIG(['src/main.ts', 'src/App.vue'], [`${PACKAGE}/global`]),
		'tsconfig.typo.json': TSCONFIG(['src/Typo.vue', 'src/env.d.ts']),
		'tsconfig.none.json': TSCONFIG(['src/App.vue']),
	})
	const ok = vueTsc(dir, 'tsconfig.ok.json')
	expect(problems, ok.code === 0, `vue-tsc: верный шаблон с global.d.ts и components.d.ts плагина не проходит:\n${ok.output}`)
	const field = vueTsc(dir, 'tsconfig.types-field.json')
	expect(problems, field.code === 0, `vue-tsc: types: ["${PACKAGE}/global"] в tsconfig не подключил типы:\n${field.output}`)
	const typo = vueTsc(dir, 'tsconfig.typo.json')
	expect(problems, typo.code !== 0 && typo.output.includes('variantt'), 'vue-tsc: опечатка в пропе <BaseButton variantt> не поймана')
	expect(problems, typo.output.includes('"nope"'), 'vue-tsc: неверное значение variant="nope" не поймано')
	const none = vueTsc(dir, 'tsconfig.none.json')
	expect(problems, none.code !== 0, 'vue-tsc: без global.d.ts шаблон не должен проходить (иначе проверка ничего не доказывает)')
	console.log(
		`  vue-tsc: верный шаблон EXIT=${ok.code}, types в tsconfig EXIT=${field.code}, опечатка EXIT=${typo.code}, без типов EXIT=${none.code}`,
	)
}

function freePort() {
	return new Promise((resolvePort, reject) => {
		const server = createServer()
		server.once('error', reject)
		server.listen(0, () => {
			const { port } = server.address()
			server.close(() => resolvePort(port))
		})
	})
}

async function startNuxt(dir) {
	const port = await freePort()
	const server = spawn(process.execPath, ['.output/server/index.mjs'], {
		cwd: dir,
		env: { ...process.env, PORT: String(port) },
		stdio: 'ignore',
	})
	const url = `http://localhost:${port}/`
	for (let attempt = 0; attempt < 50; attempt++) {
		const ready = await fetch(url).then(
			response => response.ok,
			() => false,
		)
		if (ready) return { server, url }
		await new Promise(done => setTimeout(done, 200))
	}
	server.kill()
	throw new Error('сервер Nuxt не ответил')
}

async function nuxtScenario(app, tarball, problems) {
	const dir = join(app, 'nuxt')
	mkdirSync(dir)
	install(dir, NUXT_PACKAGES, tarball)
	const page = tag => `<template>\n\t<main>\n\t\t<${tag} variant="soft">Сохранить</${tag}>\n\t</main>\n</template>\n`
	const config = options => `export default defineNuxtConfig({
	compatibilityDate: '2026-01-01',
	modules: [['${PACKAGE}/nuxt', ${options}]],
	devtools: { enabled: false },
	telemetry: false,
})
`
	const cases = [
		{ name: 'default', tag: 'BaseButton', options: "{ config: { locale: 'en', theme: 'corporate' } }" },
		{ name: 'prefix', tag: 'UiBaseButton', options: "{ prefix: 'Ui', tokens: 'layer' }" },
	]
	for (const { name, tag, options } of cases) {
		write(dir, {
			'nuxt.config.ts': config(options),
			'app/app.vue': '<template>\n\t<NuxtPage />\n</template>\n',
			'app/pages/index.vue': page(tag),
		})
		const started = Date.now()
		execFileSync(join(dir, 'node_modules/.bin/nuxt'), ['build'], { cwd: dir, stdio: 'pipe', timeout: 600_000 })
		console.log(`  nuxt-${name}: сборка ${((Date.now() - started) / 1000).toFixed(0)} с`)
		const { server, url } = await startNuxt(dir)
		try {
			const html = await fetch(url).then(response => response.text())
			expect(
				problems,
				/<button class="base-button base-button--soft"/.test(html),
				`nuxt-${name}: на странице SSR нет <button class="base-button">`,
			)
			const styles = readdirSync(join(dir, '.output/public/_nuxt'))
				.filter(file => file.endsWith('.css'))
				.map(file => readFileSync(join(dir, '.output/public/_nuxt', file), 'utf8'))
				.join('\n')
			expect(problems, styles.includes('--rise-color-primary-500'), `nuxt-${name}: в CSS нет токенов`)
			expect(problems, !styles.includes('.base-table') && !html.includes('.base-table'), `nuxt-${name}: в CSS есть .base-table`)
			expect(
				problems,
				name !== 'default' || html.includes('riseUiKit:{locale:"en",theme:"corporate"}'),
				'nuxt-default: настройки модуля не дошли до runtimeConfig',
			)
			if (BROWSER) {
				let theme = null
				const errors = await openPage(url, async browserPage => {
					await browserPage.locator('.base-button').first().waitFor({ timeout: 5000 })
					await browserPage.waitForTimeout(500)
					theme = await browserPage.evaluate(() => document.documentElement.getAttribute('data-rise-theme'))
				})
				expect(problems, errors.length === 0, `nuxt-${name}: ошибки или предупреждения в консоли: ${errors.join('; ')}`)
				expect(
					problems,
					name !== 'default' || theme === 'corporate',
					`nuxt-default: плагин настроек не поставил тему (data-rise-theme=${theme})`,
				)
			}
		} finally {
			server.kill()
		}
	}
}

async function main() {
	const app = mkdtempSync(join(tmpdir(), 'rise-autoimport-'))
	const problems = []
	try {
		const tarball = packTarball(app)
		const vite = join(app, 'vite')
		mkdirSync(vite)
		install(vite, REGISTRY_PACKAGES, tarball)
		console.log('Vite + unplugin-vue-components:')
		await viteScenario(app, 'resolver', VITE_CONFIG(''), true, problems)
		await viteScenario(app, 'tokens', VITE_CONFIG('{ tokens: true }'), false, problems)
		console.log('Типы шаблонов:')
		typesScenario(app, problems)
		if (NUXT) {
			console.log('Nuxt:')
			await nuxtScenario(app, tarball, problems)
		} else console.log('Nuxt пропущен (--no-nuxt).')
		if (!BROWSER) console.log('Браузер пропущен (--no-screenshot).')
	} finally {
		if (args.includes('--keep') || problems.length > 0) console.log(`Папка приложений: ${app}`)
		else rmSync(app, { recursive: true, force: true })
	}
	if (problems.length > 0) {
		console.error(problems.map(problem => `  ✗ ${problem}`).join('\n'))
		process.exit(1)
	}
	console.log('Автоимпорт: ✓ Vite с резолвером, типы шаблонов и Nuxt работают на пакете из tarball.')
}

main().catch(error => {
	console.error(`check-autoimport-app: ${error.message}`)
	process.exit(1)
})
