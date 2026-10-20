/**
 * Вес компонентов при точечной установке: для каждого публичного компонента (`src/components/index.ts`) — сколько JS и CSS (gzip)
 * получает приложение, которое импортирует только его с подпути (`@ramzes1385/rise-ui-kit/BaseX`). Нужна сборка: `npm run build`.
 *
 * Способ — мини-приложение Vite на компонент (пакет — ссылкой на корень репозитория, `vue` — из его node_modules, вывод в памяти):
 * сборщик приложения сам отсекает неиспользуемое из общих чанков `dist` (разделы словаря, утилиты), чего анализ графа чанков не видит.
 * JS — стартовый: вход и всё, что он импортирует статически, минус приложение с одним Vue (`createApp`); чанки по `import()` — отдельно.
 * CSS — стартовый: стили компонента и тех, что он использует внутри, без `tokens.css` (он подключается один раз, его вес — в шапке таблицы).
 * gzip — уровень 9, по каждому файлу; при сложении файлов сжатие не пересчитывается.
 *
 *   node scripts/report-sizes.mjs          — пишет таблицу в docs/reference/SIZES.md (`npm run report:sizes`);
 *   node scripts/report-sizes.mjs --check  — сверяет таблицу с текущей сборкой (`npm run test:sizes`): код 1, если состав
 *                                            компонентов другой или вес разошёлся больше допуска (TOLERANCE).
 *   --only=BaseButton,BaseSelect           — только эти компоненты, вывод в консоль (файл не пишется и не сверяется).
 */

import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { gzipSync } from 'node:zlib'
import { build } from 'vite'
import { readPublicComponents } from '../build/config/subpaths.ts'

const ROOT = resolve(join(import.meta.dirname, '..'))
const PACKAGE = '@ramzes1385/rise-ui-kit'
const OUTPUT = 'docs/reference/SIZES.md'
/** Допуск сверки: вес может уйти от таблицы на 3 % или 0,3 КБ (что больше) — разные версии zlib и Node сжимают чуть по-разному */
const TOLERANCE = { ratio: 0.03, bytes: 0.3 * 1024 }

const args = process.argv.slice(2)
const CHECK = args.includes('--check')
const ONLY = args
	.find(arg => arg.startsWith('--only='))
	?.slice('--only='.length)
	.split(',')

const gzip = text => gzipSync(text, { level: 9 }).length
const kb = bytes => (bytes / 1024).toFixed(1).replace('.', ',')

const VUE_APP = `import { createApp, h } from 'vue'
createApp({ render: () => h('main') }).mount('#app')
`

const COMPONENT_APP = name => `import { createApp, h } from 'vue'
import { ${name} } from '${PACKAGE}/${name}'
createApp({ render: () => h(${name}) }).mount('#app')
`

function prepareApp() {
	if (!existsSync(join(ROOT, 'dist/components/BaseButton/index.js'))) throw new Error('нет dist/ с подпутями — сначала `npm run build`')
	const app = mkdtempSync(join(tmpdir(), 'rise-sizes-'))
	mkdirSync(join(app, 'node_modules/@ramzes1385'), { recursive: true })
	symlinkSync(ROOT, join(app, 'node_modules', PACKAGE), 'dir')
	symlinkSync(join(ROOT, 'node_modules/vue'), join(app, 'node_modules/vue'), 'dir')
	writeFileSync(
		join(app, 'index.html'),
		'<!doctype html><html><body><div id="app"></div><script type="module" src="./main.js"></script></body></html>\n',
	)
	return app
}

/** Стартовые чанки: вход и всё, что он импортирует статически */
function initialChunks(chunks) {
	const byName = new Map(chunks.map(chunk => [chunk.fileName, chunk]))
	const seen = new Set()
	const visit = name => {
		if (seen.has(name) || !byName.has(name)) return
		seen.add(name)
		byName.get(name).imports.forEach(visit)
	}
	chunks.filter(chunk => chunk.isEntry).forEach(chunk => visit(chunk.fileName))
	return seen
}

async function measure(app, code) {
	writeFileSync(join(app, 'main.js'), code)
	const [output] = [await build({ root: app, configFile: false, logLevel: 'error', build: { write: false } })].flat()
	const chunks = output.output.filter(item => item.type === 'chunk')
	const initial = initialChunks(chunks)
	const sum = items => items.reduce((total, item) => total + gzip(item.code ?? item.source), 0)
	const assets = new Map(output.output.filter(item => item.type === 'asset').map(item => [item.fileName, item]))
	// CSS стартовых чанков — то, что приложение грузит блокирующе; CSS ленивых чанков приходит вместе с ними и считается в «по import()»
	const initialCss = new Set(
		chunks.filter(chunk => initial.has(chunk.fileName)).flatMap(chunk => [...(chunk.viteMetadata?.importedCss ?? [])]),
	)
	const cssItems = [...assets.values()].filter(item => item.fileName.endsWith('.css'))
	return {
		js: sum(chunks.filter(chunk => initial.has(chunk.fileName))),
		lazy: sum(chunks.filter(chunk => !initial.has(chunk.fileName))) + sum(cssItems.filter(item => !initialCss.has(item.fileName))),
		css: sum(cssItems.filter(item => initialCss.has(item.fileName))),
	}
}

function renderTable(rows, { vue, tokens }) {
	const lines = rows.map(
		row => `| ${row.name} | ${kb(row.js)} | ${kb(row.css)} | ${kb(row.js + row.css)} | ${row.lazy ? kb(row.lazy) : '—'} |`,
	)
	return `# Вес компонентов

Сколько JS и CSS получает приложение, которое импортирует один компонент с подпути (\`import { BaseSelect } from '@ramzes1385/rise-ui-kit/BaseSelect'\`, раздел README «Точечная установка»). Таблицу пишет \`npm run report:sizes\` после \`npm run build\`; \`npm run test:sizes\` сверяет её со сборкой (допуск — 3 % или 0,3 КБ). Руками не правится.

Как считается: на каждый компонент собирается мини-приложение Vite (\`createApp\` + компонент), сборщик приложения сам отсекает из общих чанков пакета всё, что компонент не читает (разделы словаря, утилиты). Вес — gzip (уровень 9), в КБ:

- **JS** — стартовый JS приложения минус приложение с одним Vue (${kb(vue)} КБ): код компонента, всего, что он использует внутри (BaseSelect — BaseDropdown, BaseInput, BaseIcon…), composables и русских строк тех разделов словаря, которые он читает;
- **CSS** — стили компонента и внутренних компонентов, без \`tokens.css\` (токены и тема, ${kb(tokens)} КБ — подключаются один раз на приложение);
- **по import()** — чанки (JS и их CSS), которые компонент подгружает по требованию (тяжёлые части, данные); в стартовый вес не входят.

Общий код (Vue-обвязка кита, composables, разделы словаря) у нескольких компонентов приложение получает один раз: вес двух компонентов вместе меньше суммы строк. Языки, кроме встроенного \`ru\`, не входят — словарь, подключённый \`registerLocale(en)\`, добавляет ≈20 КБ (README, «Языки»).

| Компонент | JS | CSS | Всего | По import() |
|---|--:|--:|--:|--:|
${lines.join('\n')}
`
}

const ROW = /^\| (Base\w+) \| ([\d,]+) \| ([\d,]+) \| [\d,]+ \| (?:[\d,]+|—) \|$/gm
const parseKb = text => Number(text.replace(',', '.')) * 1024

function compare(rows) {
	const file = join(ROOT, OUTPUT)
	if (!existsSync(file)) return [`нет ${OUTPUT} — \`npm run report:sizes\``]
	const table = new Map(
		[...readFileSync(file, 'utf8').matchAll(ROW)].map(([, name, js, css]) => [name, { js: parseKb(js), css: parseKb(css) }]),
	)
	const problems = []
	const names = new Set(rows.map(row => row.name))
	for (const name of table.keys()) if (!names.has(name)) problems.push(`${name}: в таблице есть, а публичного компонента нет`)
	for (const row of rows) {
		const saved = table.get(row.name)
		if (!saved) {
			problems.push(`${row.name}: нет в таблице`)
			continue
		}
		for (const kind of ['js', 'css']) {
			const limit = Math.max(row[kind] * TOLERANCE.ratio, TOLERANCE.bytes)
			if (Math.abs(row[kind] - saved[kind]) > limit)
				problems.push(`${row.name}: ${kind.toUpperCase()} ${kb(row[kind])} КБ, в таблице ${kb(saved[kind])} КБ`)
		}
	}
	return problems
}

async function main() {
	const started = Date.now()
	const app = prepareApp()
	try {
		const components = readPublicComponents(ROOT).filter(name => !ONLY || ONLY.includes(name))
		const base = await measure(app, VUE_APP)
		const rows = []
		for (const name of components) {
			const size = await measure(app, COMPONENT_APP(name))
			rows.push({ name, js: size.js - base.js, css: size.css, lazy: size.lazy })
		}
		const seconds = Math.round((Date.now() - started) / 1000)
		if (ONLY) {
			rows.forEach(row =>
				console.log(`${row.name}: JS ${kb(row.js)} КБ, CSS ${kb(row.css)} КБ${row.lazy ? `, по import() ${kb(row.lazy)} КБ` : ''}`),
			)
			return
		}
		if (CHECK) {
			const problems = compare(rows)
			if (problems.length > 0) {
				console.error(
					`${OUTPUT} устарел (${seconds} с) — \`npm run build && npm run report:sizes\`:\n${problems.map(line => `  ✗ ${line}`).join('\n')}`,
				)
				process.exit(1)
			}
			console.log(`Вес компонентов: ✓ ${OUTPUT} совпадает со сборкой (${rows.length} компонентов, ${seconds} с).`)
			return
		}
		const tokens = gzip(readFileSync(join(ROOT, 'dist/tokens.css')))
		writeFileSync(join(ROOT, OUTPUT), renderTable(rows, { vue: base.js, tokens }))
		console.log(`Вес компонентов: ${rows.length} строк записаны в ${OUTPUT} (${seconds} с).`)
	} finally {
		rmSync(app, { recursive: true, force: true })
	}
}

main().catch(error => {
	console.error(`report-sizes: ${error.message}`)
	process.exit(1)
})
