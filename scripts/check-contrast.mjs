/**
 * Проверка контраста дизайн-токенов (WCAG 2.2, уровень AA).
 *
 * Компилирует src/styles/_tokens.scss, вычисляет значения семантических токенов в светлой и тёмной теме
 * (включая color-mix) и сверяет пары «текст/фон» и «графика/фон» с порогами:
 * - текст — 4.5:1 (1.4.3 Contrast Minimum);
 * - графика, границы активных элементов, кольцо фокуса — 3:1 (1.4.11 Non-text Contrast).
 * Пары с пометкой «справочно» выводятся, но не валят проверку (плейсхолдеры, декоративные рамки).
 *
 * Запуск: node scripts/check-contrast.mjs [--markdown docs/design/contrast.md]
 */

import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as sass from 'sass'

const ROOT = resolve(process.cwd())
const ROLES = ['primary', 'success', 'info', 'warning', 'error']
const TEXT = 4.5
const GRAPHIC = 3

// ─── 1. Значения токенов ────────────────────────────────────────────────────────

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

// ─── 2. Вычисление цветов ───────────────────────────────────────────────────────

function parseHex(hex) {
	const value = hex.replace('#', '')
	const full = value.length === 3 ? [...value].map(c => c + c).join('') : value
	return [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16))
}

/** Разрешает значение токена в [r, g, b, a]. Поддерживает #hex, white/black/transparent, var(), color-mix(in srgb …). */
function resolveColor(value, vars, depth = 0) {
	if (depth > 20) throw new Error(`Слишком глубокая ссылка: ${value}`)
	const v = value.trim()
	if (v.startsWith('#')) return [...parseHex(v), 1]
	if (v === 'white') return [255, 255, 255, 1]
	if (v === 'black') return [0, 0, 0, 1]
	if (v === 'transparent') return [0, 0, 0, 0]
	const varMatch = /^var\((--[\w-]+)\)$/.exec(v)
	if (varMatch) {
		const next = vars[varMatch[1]]
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

// ─── 3. Пары ────────────────────────────────────────────────────────────────────

/** [передний план, фон, порог, описание, справочно?] */
function pairs() {
	const list = []
	const surfaces = ['--rise-bg', '--rise-bg-muted', '--rise-bg-elevated']
	for (const text of ['--rise-text-highlighted', '--rise-text', '--rise-text-toned']) {
		for (const bg of surfaces) list.push([text, bg, TEXT, 'Текст на поверхности'])
	}
	list.push(['--rise-text-muted', '--rise-bg', TEXT, 'Вторичный текст'])
	list.push(['--rise-text-muted', '--rise-bg-muted', TEXT, 'Вторичный текст'])
	list.push(['--rise-text-muted', '--rise-bg-elevated', TEXT, 'Вторичный текст на bg-elevated', true])
	list.push(['--rise-text-dimmed', '--rise-bg', TEXT, 'Плейсхолдер, неактивный текст', true])
	list.push(['--rise-text-inverted', '--rise-bg-inverted', TEXT, 'Текст на инвертированном фоне'])
	list.push(['--rise-border-accented', '--rise-bg', GRAPHIC, 'Рамка поля ввода', true])
	list.push(['--rise-focus-ring', '--rise-bg', GRAPHIC, 'Кольцо фокуса'])
	for (const role of ROLES) {
		list.push([`--rise-on-${role}`, `--rise-${role}`, TEXT, `Текст на заливке ${role}`])
		list.push([`--rise-on-${role}`, `--rise-${role}-hover`, TEXT, `Текст на заливке ${role} (hover)`])
		list.push([`--rise-${role}`, '--rise-bg', TEXT, `Цвет ${role} как текст на фоне`])
		list.push([`--rise-${role}-text`, `--rise-${role}-soft`, TEXT, `Текст на мягком фоне ${role}`])
		list.push([`--rise-${role}-text`, `--rise-${role}-soft-hover`, TEXT, `Текст на мягком фоне ${role} (hover)`])
		list.push([`--rise-${role}`, `--rise-${role}-soft`, TEXT, `Цвет ${role} на мягком фоне`, true])
		list.push([`--rise-${role}`, '--rise-bg-elevated', GRAPHIC, `Графика ${role} на bg-elevated`])
	}
	return list
}

const rows = []
let failures = 0
for (const theme of ['light', 'dark']) {
	const vars = themeVariables(theme)
	const page = resolveColor('var(--rise-bg)', vars)
	for (const [fgName, bgName, min, label, informational = false] of pairs()) {
		const bg = over(resolveColor(`var(${bgName})`, vars), page)
		const fg = over(resolveColor(`var(${fgName})`, vars), bg)
		const ratio = contrast(fg, bg)
		const ok = ratio >= min
		if (!ok && !informational) failures++
		rows.push({ theme, fgName, bgName, fg: toHex(fg), bg: toHex(bg), ratio, min, ok, informational, label })
	}
}

for (const r of rows) {
	const mark = r.ok ? 'OK ' : r.informational ? 'inf' : 'ERR'
	console.log(`${mark} ${r.theme.padEnd(5)} ${r.ratio.toFixed(2).padStart(5)} (≥${r.min}) ${r.fgName} ${r.fg} на ${r.bgName} ${r.bg}`)
}

const markdownIndex = process.argv.indexOf('--markdown')
if (markdownIndex !== -1) {
	const target = resolve(ROOT, process.argv[markdownIndex + 1])
	const lines = [
		'# Контраст дизайн-токенов',
		'',
		'Сгенерировано `node scripts/check-contrast.mjs --markdown docs/design/contrast.md` из `src/styles/_tokens.scss`.',
		'Пороги WCAG 2.2 AA: текст — 4.5:1, графика и кольцо фокуса — 3:1. «Справочно» — пары, которые не обязаны проходить порог',
		'(плейсхолдеры и неактивный текст исключены из требования 1.4.3; рамка поля — декоративная, поле обозначено подписью и фоном).',
		'',
	]
	for (const theme of ['light', 'dark']) {
		lines.push(`## ${theme === 'light' ? 'Светлая тема' : 'Тёмная тема'}`, '')
		lines.push('| Пара | Передний план | Фон | Контраст | Порог | Итог |', '|---|---|---|---|---|---|')
		for (const r of rows.filter(x => x.theme === theme)) {
			const verdict = r.ok ? 'проходит' : r.informational ? 'справочно' : '**не проходит**'
			lines.push(`| ${r.label} | \`${r.fgName}\` ${r.fg} | \`${r.bgName}\` ${r.bg} | ${r.ratio.toFixed(2)} | ${r.min} | ${verdict} |`)
		}
		lines.push('')
	}
	writeFileSync(target, lines.join('\n'))
	console.log(`\nЗаписано: ${target}`)
}

if (failures) {
	console.error(`\n✗ Пар ниже порога: ${failures}`)
	process.exit(1)
}
console.log('\n✓ Все обязательные пары проходят WCAG AA')
