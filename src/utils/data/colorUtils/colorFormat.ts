/** Утилиты: разбор и запись цвета в форматах HEX, RGB и HSL с прозрачностью */

import { clamp, hexToRgb, rgbToHex } from './colorUtils'
import type { ColorFormat, HslColor, RgbaColor, RgbColor } from './types/colorUtils.types'

const MAX_CHANNEL = 255
const MAX_HUE = 360
const MAX_PERCENT = 100
const ALPHA_DECIMALS = 100
const HEX_WITH_ALPHA = /^#?([0-9a-f]{4}|[0-9a-f]{8})$/i
const FUNCTION_COLOR = /^(rgba?|hsla?)\(([^)]*)\)$/i

function roundAlpha(alpha: number): number {
	return Math.round(clamp(alpha, 0, 1) * ALPHA_DECIMALS) / ALPHA_DECIMALS
}

function hueToChannel(p: number, q: number, t: number): number {
	let k = t
	if (k < 0) k += 1
	if (k > 1) k -= 1
	if (k < 1 / 6) return p + (q - p) * 6 * k
	if (k < 1 / 2) return q
	if (k < 2 / 3) return p + (q - p) * (2 / 3 - k) * 6
	return p
}

/** Перевести HSL (тон 0–360, насыщенность и светлота 0–100) в RGB */
function hslToRgb(hsl: HslColor): RgbColor {
	const h = (((hsl.h % MAX_HUE) + MAX_HUE) % MAX_HUE) / MAX_HUE
	const s = clamp(hsl.s, 0, MAX_PERCENT) / MAX_PERCENT
	const l = clamp(hsl.l, 0, MAX_PERCENT) / MAX_PERCENT
	const q = l < 0.5 ? l * (1 + s) : l + s - l * s
	const p = 2 * l - q
	const toChannel = (t: number): number => Math.round((s === 0 ? l : hueToChannel(p, q, t)) * MAX_CHANNEL)
	return { r: toChannel(h + 1 / 3), g: toChannel(h), b: toChannel(h - 1 / 3) }
}

function hslHue(channels: RgbColor, max: number, delta: number): number {
	const { r, g, b } = channels
	if (max === r) return ((g - b) / delta + (g < b ? 6 : 0)) * 60
	if (max === g) return ((b - r) / delta + 2) * 60
	return ((r - g) / delta + 4) * 60
}

/** Перевести RGB в HSL (целые градусы и проценты) */
function rgbToHsl(rgb: RgbColor): HslColor {
	const channels = { r: rgb.r / MAX_CHANNEL, g: rgb.g / MAX_CHANNEL, b: rgb.b / MAX_CHANNEL }
	const max = Math.max(channels.r, channels.g, channels.b)
	const min = Math.min(channels.r, channels.g, channels.b)
	const l = (max + min) / 2
	const delta = max - min
	if (delta === 0) return { h: 0, s: 0, l: Math.round(l * MAX_PERCENT) }
	const s = delta / (1 - Math.abs(2 * l - 1))
	return { h: Math.round(hslHue(channels, max, delta)) % MAX_HUE, s: Math.round(s * MAX_PERCENT), l: Math.round(l * MAX_PERCENT) }
}

function parseHexWithAlpha(input: string): RgbaColor | null {
	const match = HEX_WITH_ALPHA.exec(input)
	if (!match) return null
	const raw = match[1].length === 4 ? [...match[1]].map(char => char + char).join('') : match[1]
	return { ...hexToRgb(raw.slice(0, 6)), a: roundAlpha(Number.parseInt(raw.slice(6), 16) / MAX_CHANNEL) }
}

function parseNumber(token: string, scale: number): number | null {
	const isPercent = token.endsWith('%')
	const value = Number.parseFloat(isPercent ? token.slice(0, -1) : token)
	if (!Number.isFinite(value)) return null
	return isPercent ? (value / MAX_PERCENT) * scale : value
}

function splitArguments(body: string): string[] {
	return body
		.replace(/deg/gi, '')
		.split(/[\s,/]+/)
		.filter(Boolean)
}

function parseFunctionColor(input: string): RgbaColor | null {
	const match = FUNCTION_COLOR.exec(input)
	if (!match) return null
	const parts = splitArguments(match[2])
	if (parts.length < 3 || parts.length > 4) return null
	const isRgb = match[1].toLowerCase().startsWith('rgb')
	const channels = parts.slice(0, 3).map(part => parseNumber(part, isRgb ? MAX_CHANNEL : MAX_PERCENT))
	const alpha = parts[3] === undefined ? 1 : parseNumber(parts[3], 1)
	if (channels.includes(null) || alpha === null) return null
	const [first, second, third] = channels as number[]
	const rgb = isRgb ? { r: first, g: second, b: third } : hslToRgb({ h: first, s: second, l: third })
	return { ...hexToRgb(rgbToHex(rgb)), a: roundAlpha(alpha) }
}

/**
 * Разобрать цвет: HEX (`#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`), `rgb()` / `rgba()` и `hsl()` / `hsla()`
 * с запятыми или пробелами и прозрачностью через `/`. Невалидная строка — `null`
 */
function parseColor(input: string): RgbaColor | null {
	const value = input.trim()
	if (/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) return { ...hexToRgb(value), a: 1 }
	return parseHexWithAlpha(value) ?? parseFunctionColor(value)
}

function formatAlpha(alpha: number): string {
	return String(roundAlpha(alpha))
}

/** Записать цвет в формате: непрозрачный — `#rrggbb`, `rgb(r, g, b)`, `hsl(h, s%, l%)`; с прозрачностью — `#rrggbbaa`, `rgba()`, `hsla()` */
function formatColor(color: RgbaColor, format: ColorFormat): string {
	const isOpaque = roundAlpha(color.a) === 1
	if (format === 'hex') {
		const hex = rgbToHex(color)
		return isOpaque
			? hex
			: `${hex}${Math.round(roundAlpha(color.a) * MAX_CHANNEL)
					.toString(16)
					.padStart(2, '0')}`
	}
	if (format === 'rgb') {
		const channels = `${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}`
		return isOpaque ? `rgb(${channels})` : `rgba(${channels}, ${formatAlpha(color.a)})`
	}
	const { h, s, l } = rgbToHsl(color)
	return isOpaque ? `hsl(${h}, ${s}%, ${l}%)` : `hsla(${h}, ${s}%, ${l}%, ${formatAlpha(color.a)})`
}

export { formatColor, hslToRgb, parseColor, rgbToHsl }
