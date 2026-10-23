/**
 * Вычисление значений токенов кита так, как их считает браузер на одном элементе: `var()`, `calc()` и `color-mix(in srgb)`
 * без внешних библиотек. Поддержан тот набор записи, который встречается в `src/styles/_tokens.scss` и в выводе `createTheme`;
 * незнакомая запись — исключение, а не молчаливо неверное значение.
 */

import type { Rgba } from './types.ts'

export type CssEnv = ReadonlyMap<string, string>

interface Quantity {
	n: number
	unit: string
}

const MAX_VAR_DEPTH = 32
const NUMBER = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/i
const UNIT = /^(?:%|[a-z]+)/i
const NAMED_COLORS: Record<string, Rgba> = {
	transparent: { r: 0, g: 0, b: 0, a: 0 },
	black: { r: 0, g: 0, b: 0, a: 1 },
	white: { r: 255, g: 255, b: 255, a: 1 },
}

/** Индекс закрывающей скобки для открывающей в позиции `open` */
function closingIndex(text: string, open: number): number {
	let depth = 0
	for (let index = open; index < text.length; index += 1) {
		if (text[index] === '(') depth += 1
		else if (text[index] === ')') depth -= 1
		if (depth === 0) return index
	}
	throw new Error(`Нет закрывающей скобки: ${text}`)
}

/** Делит строку по разделителю вне скобок и кавычек */
export function splitTopLevel(text: string, separator: string): string[] {
	const parts: string[] = []
	let depth = 0
	let quote = ''
	let start = 0
	for (let index = 0; index < text.length; index += 1) {
		const char = text[index]
		if (quote) quote = char === quote ? '' : quote
		else if (char === '"' || char === "'") quote = char
		else if (char === '(') depth += 1
		else if (char === ')') depth -= 1
		else if (depth === 0 && (separator === ' ' ? /\s/.test(char) : char === separator)) {
			parts.push(text.slice(start, index))
			start = index + 1
		}
	}
	parts.push(text.slice(start))
	return parts.map(part => part.trim()).filter(part => part !== '')
}

/** Заменяет каждый вызов `name(...)` результатом `replace(аргументы)`; вложенные вызовы разворачивает `replace` сам */
function replaceCalls(value: string, name: string, replace: (args: string) => string): string {
	const needle = `${name}(`
	let result = ''
	let cursor = 0
	for (;;) {
		const at = value.indexOf(needle, cursor)
		if (at === -1) return result + value.slice(cursor)
		const isWord = at > 0 && /[\w-]/.test(value[at - 1])
		if (isWord) {
			result += value.slice(cursor, at + needle.length)
			cursor = at + needle.length
			continue
		}
		const open = at + name.length
		const close = closingIndex(value, open)
		result += value.slice(cursor, at) + replace(value.slice(open + 1, close))
		cursor = close + 1
	}
}

/** Подставляет `var(--имя)` значением из окружения, рекурсивно; значение запасного варианта — после запятой */
export function substituteVars(value: string, env: CssEnv, depth = 0): string {
	if (depth > MAX_VAR_DEPTH) throw new Error(`Цикл переменных: ${value}`)
	return replaceCalls(value, 'var', args => {
		const [name, ...fallback] = splitTopLevel(args, ',')
		const found = env.get(name)
		if (found !== undefined) return substituteVars(found, env, depth + 1)
		if (fallback.length) return substituteVars(fallback.join(','), env, depth + 1)
		throw new Error(`Нет значения переменной ${name}`)
	})
}

function readQuantity(text: string, at: number): { quantity: Quantity; end: number } {
	const match = NUMBER.exec(text.slice(at))
	if (!match) throw new Error(`Ждали число: ${text.slice(at)}`)
	const rest = text.slice(at + match[0].length)
	const unit = UNIT.exec(rest)?.[0] ?? ''
	return { quantity: { n: Number(match[0]), unit }, end: at + match[0].length + unit.length }
}

function combine(left: Quantity, operator: string, right: Quantity): Quantity {
	if (operator === '*') {
		if (left.unit && right.unit) throw new Error('Произведение двух величин с единицами')
		return { n: left.n * right.n, unit: left.unit || right.unit }
	}
	if (operator === '/') {
		if (right.unit) throw new Error('Деление на величину с единицей')
		return { n: left.n / right.n, unit: left.unit }
	}
	if (left.unit !== right.unit) throw new Error(`Разные единицы: ${left.unit} и ${right.unit}`)
	return { n: operator === '+' ? left.n + right.n : left.n - right.n, unit: left.unit }
}

/** Разбор выражения `calc()` рекурсивным спуском: `+ - * /`, скобки, числа с единицами */
function parseCalc(text: string): Quantity {
	let position = 0
	const skip = (): void => {
		while (/\s/.test(text[position] ?? '')) position += 1
	}
	const peek = (): string => {
		skip()
		return text[position] ?? ''
	}
	const factor = (): Quantity => {
		if (peek() === '(') {
			position += 1
			const inner = sum()
			if (peek() !== ')') throw new Error(`Нет закрывающей скобки в calc(): ${text}`)
			position += 1
			return inner
		}
		skip()
		const { quantity, end } = readQuantity(text, position)
		position = end
		return quantity
	}
	const chain = (next: () => Quantity, operators: string): Quantity => {
		let left = next()
		while (operators.includes(peek()) && peek() !== '') {
			const operator = text[position]
			position += 1
			left = combine(left, operator, next())
		}
		return left
	}
	const product = (): Quantity => chain(factor, '*/')
	const sum = (): Quantity => chain(product, '+-')
	const result = sum()
	skip()
	if (position !== text.length) throw new Error(`Лишнее в calc(): ${text}`)
	return result
}

/** Число без хвоста погрешности: не больше шести знаков после запятой */
export function formatNumber(value: number): string {
	return String(Number(value.toFixed(6)))
}

/** Вычисляет каждый `calc(...)` в значении и подставляет результат с единицей */
export function evaluateCalc(value: string): string {
	return replaceCalls(value, 'calc', args => {
		const { n, unit } = parseCalc(evaluateCalc(args))
		return `${formatNumber(n)}${unit}`
	})
}

function parseChannel(text: string, scale: number): number {
	return text.endsWith('%') ? (Number.parseFloat(text) / 100) * scale : Number(text)
}

function parseHex(hex: string): Rgba {
	const digits = hex.length <= 5 ? [...hex].map(char => char + char).join('') : hex
	if (!/^(?:[\da-f]{6}|[\da-f]{8})$/i.test(digits)) throw new Error(`Неверный HEX: #${hex}`)
	const channel = (at: number): number => Number.parseInt(digits.slice(at, at + 2), 16)
	return { r: channel(0), g: channel(2), b: channel(4), a: digits.length === 8 ? channel(6) / 255 : 1 }
}

function parseRgbFunction(args: string): Rgba {
	const [main, alpha] = args.split('/')
	const channels = main.trim().split(/[\s,]+/)
	const rawAlpha = alpha === undefined ? channels[3] : alpha.trim()
	if (channels.length < 3) throw new Error(`Неверный rgb(): ${args}`)
	return {
		r: parseChannel(channels[0], 255),
		g: parseChannel(channels[1], 255),
		b: parseChannel(channels[2], 255),
		a: rawAlpha === undefined ? 1 : parseChannel(rawAlpha, 1),
	}
}

interface MixPart {
	color: Rgba
	share: number | null
}

function parseMixPart(text: string): MixPart {
	const match = /^(.*?)(?:\s+(\d+(?:\.\d+)?)%)?$/s.exec(text.trim())
	const color = parseColor(match?.[1] ?? text)
	return { color, share: match?.[2] === undefined ? null : Number(match[2]) / 100 }
}

function mixColors(args: string): Rgba {
	const [space, ...rest] = splitTopLevel(args, ',')
	if (space !== 'in srgb' || rest.length !== 2) throw new Error(`Поддержан только color-mix(in srgb, A, B): ${args}`)
	const [first, second] = rest.map(parseMixPart)
	const left = first.share ?? (second.share === null ? 0.5 : 1 - second.share)
	const right = second.share ?? 1 - left
	const total = left + right
	const [pl, pr] = [left / total, right / total]
	const alpha = first.color.a * pl + second.color.a * pr
	const premultiplied = (key: 'r' | 'g' | 'b'): number =>
		alpha === 0 ? 0 : (first.color[key] * first.color.a * pl + second.color[key] * second.color.a * pr) / alpha
	return { r: premultiplied('r'), g: premultiplied('g'), b: premultiplied('b'), a: alpha * Math.min(1, total) }
}

/** Цвет из записи CSS: HEX, `rgb()`/`rgba()`, `transparent`, `black`, `white`, `color-mix(in srgb, …)` */
export function parseColor(text: string): Rgba {
	const value = text.trim()
	const lower = value.toLowerCase()
	if (lower in NAMED_COLORS) return NAMED_COLORS[lower]
	if (value.startsWith('#')) return parseHex(value.slice(1))
	const call = /^([a-z-]+)\(/i.exec(value)
	if (call && value.endsWith(')') && closingIndex(value, call[0].length - 1) === value.length - 1) {
		const args = value.slice(call[0].length, -1)
		if (call[1] === 'rgb' || call[1] === 'rgba') return parseRgbFunction(args)
		if (call[1] === 'color-mix') return mixColors(args)
	}
	throw new Error(`Неподдерживаемый цвет: ${value}`)
}

function toByte(channel: number): string {
	return Math.max(0, Math.min(255, Math.round(channel)))
		.toString(16)
		.padStart(2, '0')
}

/** HEX `#rrggbb`, а с прозрачностью — `#rrggbbaa` (прозрачность округляется до 1/255) */
export function toHex(color: Rgba): string {
	const alpha = color.a < 1 ? toByte(color.a * 255) : ''
	return `#${toByte(color.r)}${toByte(color.g)}${toByte(color.b)}${alpha}`
}

/** Значение со всеми `var()` и `calc()` вычисленными; `color-mix()` и прочее остаются записью CSS */
export function resolveValue(value: string, env: CssEnv): string {
	return evaluateCalc(substituteVars(value, env))
}
