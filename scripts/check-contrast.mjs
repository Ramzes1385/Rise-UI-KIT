/**
 * WCAG 2.2 AA: текст — 4.5:1 (1.4.3), графика/границы/кольцо фокуса — 3:1 (1.4.11); пары «справочно» не валят проверку.
 * Пары — `THEME_CONTRAST_PAIRS` из `src/utils/theme/themeUtils` (одни с `createTheme`). `--theme=<пресет>` проверяет тему
 * `THEME_PRESETS`: её сиды поверх `_tokens.scss`, как их применяет `[data-rise-theme]`; `--theme=all` — кит и все пресеты.
 * Для пресетов отчёт генератора (`createTheme().contrast`) сверяется с расчётом по `_tokens.scss`: расхождение — предупреждение
 * (генератор отстал от токенов кита — поправьте `resolveThemeColors`), провал порога — ошибка.
 */

import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as sass from 'sass-embedded'
import { runnerImport } from 'vite'

const ROOT = resolve(process.cwd())
const KIT = 'kit'
const MODES = ['light', 'dark']
/** Смесь цветов генератор округляет до HEX на каждом шаге (тёмные уровни — смесь смеси) — расхождение до 0.05 или 1 % ожидаемо */
const RATIO_TOLERANCE = 0.05
const RATIO_TOLERANCE_SHARE = 0.01

const { css } = sass.compileString('@use "tokens";', { loadPaths: [resolve(ROOT, 'src/styles')], style: 'expanded' })

/** Разбирает CSS на блоки { selector, declarations } (без вложенных @media). */
function parseBlocks(source) {
	const blocks = []
	const re = /([^{}]+)\{([^{}]*)\}/g
	let match
	while ((match = re.exec(source))) {
		const selector = match[1].trim().replace(/\s+/g, ' ')
		const declarations = {}
		for (const part of match[2].split(';')) {
			const index = part.indexOf(':')
			if (index === -1) continue
			const name = part.slice(0, index).trim()
			if (name.startsWith('--')) declarations[name] = part.slice(index + 1).trim()
		}
		blocks.push({ selector, declarations })
	}
	return blocks
}

const blocks = parseBlocks(css.replace(/@media[^{]+\{([\s\S]*?\})\s*\}/g, ''))

function themeVariables(theme) {
	const vars = {}
	for (const { selector, declarations } of blocks) {
		const parts = selector.split(',').map(s => s.trim())
		const applies = parts.includes(':root') || parts.includes(`[data-theme=${theme}]`)
		if (applies) Object.assign(vars, declarations)
	}
	return vars
}

function parseHex(hex) {
	const value = hex.replace('#', '')
	const full = value.length === 3 ? [...value].map(c => c + c).join('') : value
	return [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16))
}

/**
 * Разрешает значение токена в [r, g, b, a]. Поддерживает #hex, white/black/transparent, var() с запасным значением
 * (сиды темы `--rise-color-<роль>-on`/`-hover` кит читает с запасным), color-mix(in srgb …).
 */
function resolveColor(value, vars, depth = 0) {
	if (depth > 20) throw new Error(`Слишком глубокая ссылка: ${value}`)
	const v = value.trim()
	if (v.startsWith('#')) return [...parseHex(v), 1]
	if (v === 'white') return [255, 255, 255, 1]
	if (v === 'black') return [0, 0, 0, 1]
	if (v === 'transparent') return [0, 0, 0, 0]
	const varMatch = /^var\((--[\w-]+)(?:,\s*(.+))?\)$/.exec(v)
	if (varMatch) {
		const next = vars[varMatch[1]] ?? varMatch[2]
		if (next === undefined) throw new Error(`Нет токена ${varMatch[1]}`)
		return resolveColor(next, vars, depth + 1)
	}
	const mixMatch = /^color-mix\(in srgb,\s*(.+?)\s+(\d+(?:\.\d+)?)%,\s*(.+)\)$/.exec(v)
	if (mixMatch) {
		const a = resolveColor(mixMatch[1], vars, depth + 1)
		const p = Number(mixMatch[2]) / 100
		const b = resolveColor(mixMatch[3], vars, depth + 1)
		// color-mix в srgb смешивает премультиплицированные по альфе компоненты
		const alpha = a[3] * p + b[3] * (1 - p)
		if (alpha === 0) return [0, 0, 0, 0]
		const channel = i => (a[i] * a[3] * p + b[i] * b[3] * (1 - p)) / alpha
		return [channel(0), channel(1), channel(2), alpha]
	}
	throw new Error(`Не удалось разобрать цвет: ${value}`)
}

/** Накладывает полупрозрачный цвет на непрозрачный фон. */
function over(top, bottom) {
	const a = top[3]
	return [0, 1, 2].map(i => top[i] * a + bottom[i] * (1 - a)).concat(1)
}

function luminance([r, g, b]) {
	const lin = c => {
		const s = c / 255
		return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
	}
	return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function contrast(fg, bg) {
	const [l1, l2] = [luminance(fg), luminance(bg)].sort((x, y) => y - x)
	return (l1 + 0.05) / (l2 + 0.05)
}

const toHex = c =>
	'#' +
	c
		.slice(0, 3)
		.map(x => Math.round(x).toString(16).padStart(2, '0'))
		.join('')

const { module: themeUtils } = await runnerImport('/src/utils/theme/themeUtils/index.ts', {
	configFile: false,
	root: ROOT,
	logLevel: 'error',
	resolve: { alias: { '@utils': resolve(ROOT, 'src/utils') } },
})

const ROLE_IN_TOKEN = /--rise-(?:on-)?(primary|success|info|warning|error)/
const LABELS = {
	'surface-text': () => 'Текст на поверхности',
	'muted-text': () => 'Вторичный текст',
	'muted-text-elevated': () => 'Вторичный текст на bg-elevated',
	'dimmed-text': () => 'Плейсхолдер, неактивный текст',
	'inverted-text': () => 'Текст на инвертированном фоне',
	'field-border': () => 'Рамка варианта outline',
	'control-border': () => 'Граница флажка и радио',
	'focus-ring': () => 'Кольцо фокуса',
	code: pair => `Подсветка кода: ${pair.fg.replace('--rise-code-', '')}`,
	'on-role': role => `Текст на заливке ${role}`,
	'on-role-hover': role => `Текст на заливке ${role} (hover)`,
	'role-graphic-bg': role => `Заливка ${role} как графика на фоне`,
	'role-text-bg': role => `Текст ${role} на фоне`,
	'role-soft-text': role => `Текст на мягком фоне ${role}`,
	'role-soft-hover-text': role => `Текст на мягком фоне ${role} (hover)`,
	'role-on-soft': role => `Цвет ${role} на мягком фоне`,
	'role-graphic': role => `Графика ${role} на bg-elevated`,
}

function label(pair) {
	const format = LABELS[pair.kind]
	if (!format) throw new Error(`Нет подписи для вида пары ${pair.kind}`)
	return pair.kind === 'code' ? format(pair) : format(ROLE_IN_TOKEN.exec(pair.fg)?.[1])
}

function themeArgument() {
	const arg = process.argv.find(item => item.startsWith('--theme='))
	if (!arg) return [KIT]
	const value = arg.slice('--theme='.length)
	if (value === 'all') return [KIT, ...themeUtils.THEME_PRESET_NAMES]
	if (!themeUtils.THEME_PRESET_NAMES.includes(value)) {
		console.error(`Нет пресета «${value}»: ${themeUtils.THEME_PRESET_NAMES.join(', ')} или all`)
		process.exit(1)
	}
	return [value]
}

const themes = themeArgument()
const rows = []
let failures = 0
let mismatches = 0

/** Переменные режима: токены кита, поверх — сиды темы, как их применяет `[data-rise-theme]` на той же области. */
function variables(theme, mode) {
	const vars = themeVariables(mode)
	if (theme === KIT) return { vars, generated: null }
	const created = themeUtils.createTheme(themeUtils.THEME_PRESETS[theme])
	Object.assign(vars, created.vars, mode === 'dark' ? created.darkVars : {})
	return { vars, generated: created.contrast.filter(row => row.mode === mode) }
}

for (const theme of themes) {
	for (const mode of MODES) {
		const { vars, generated } = variables(theme, mode)
		const page = resolveColor('var(--rise-bg)', vars)
		themeUtils.THEME_CONTRAST_PAIRS.forEach((pair, index) => {
			const bg = over(resolveColor(`var(${pair.bg})`, vars), page)
			const fg = over(resolveColor(`var(${pair.fg})`, vars), bg)
			const ratio = contrast(fg, bg)
			const ok = ratio >= pair.min
			const informational = Boolean(pair.informational)
			if (!ok && !informational) failures++
			if (generated && Math.abs(generated[index].ratio - ratio) > Math.max(RATIO_TOLERANCE, ratio * RATIO_TOLERANCE_SHARE)) {
				mismatches++
				console.error(
					`≠ ${theme} ${mode} ${pair.fg} на ${pair.bg}: генератор ${generated[index].ratio}, _tokens.scss ${ratio.toFixed(2)}`,
				)
			}
			rows.push({
				theme,
				mode,
				fgName: pair.fg,
				bgName: pair.bg,
				fg: toHex(fg),
				bg: toHex(bg),
				ratio,
				min: pair.min,
				ok,
				informational,
				label: label(pair),
			})
		})
	}
}

for (const r of rows) {
	const mark = r.ok ? 'OK ' : r.informational ? 'inf' : 'ERR'
	console.log(
		`${mark} ${r.theme.padEnd(9)} ${r.mode.padEnd(5)} ${r.ratio.toFixed(2).padStart(5)} (≥${r.min}) ${r.fgName} ${r.fg} на ${r.bgName} ${r.bg}`,
	)
}

const markdownIndex = process.argv.indexOf('--markdown')
if (markdownIndex !== -1) {
	const target = resolve(ROOT, process.argv[markdownIndex + 1])
	const lines = [
		'# Контраст дизайн-токенов',
		'',
		`Сгенерировано \`node scripts/check-contrast.mjs${themes.length > 1 ? ' --theme=all' : ''} --markdown docs/design/contrast.md\` из \`src/styles/_tokens.scss\`` +
			(themes.length > 1 ? ' и пресетов `THEME_PRESETS` (сиды темы поверх токенов кита).' : '.'),
		'Пороги WCAG 2.2 AA: текст — 4.5:1, графика и кольцо фокуса — 3:1. «Справочно» — пары, которые не обязаны проходить порог',
		'(плейсхолдеры и неактивный текст исключены из требования 1.4.3; рамка варианта outline — декоративная, поле обозначено подписью и фоном).',
		'',
	]
	for (const theme of themes) {
		for (const mode of MODES) {
			const title = mode === 'light' ? 'Светлая тема' : 'Тёмная тема'
			lines.push(`## ${theme === KIT ? title : `Пресет ${theme} — ${title.toLowerCase()}`}`, '')
			lines.push('| Пара | Передний план | Фон | Контраст | Порог | Итог |', '|---|---|---|---|---|---|')
			for (const r of rows.filter(x => x.theme === theme && x.mode === mode)) {
				const verdict = r.ok ? 'проходит' : r.informational ? 'справочно' : '**не проходит**'
				lines.push(
					`| ${r.label} | \`${r.fgName}\` ${r.fg} | \`${r.bgName}\` ${r.bg} | ${r.ratio.toFixed(2)} | ${r.min} | ${verdict} |`,
				)
			}
			lines.push('')
		}
	}
	writeFileSync(target, lines.join('\n'))
	console.log(`\nЗаписано: ${target}`)
}

if (mismatches) console.warn(`\n⚠ Отчёт генератора тем расходится с _tokens.scss: ${mismatches} пар — поправьте resolveThemeColors`)
if (failures) {
	console.error(`\n✗ Пар ниже порога: ${failures}`)
	process.exit(1)
}
console.log(`\n✓ Все обязательные пары проходят WCAG AA: ${themes.join(', ')}`)
