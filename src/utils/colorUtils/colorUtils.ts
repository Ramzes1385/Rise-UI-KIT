import type { HsvColor, RgbColor } from './colorUtils.types'

const HEX_SHORT_LENGTH = 3
const HEX_FULL_LENGTH = 6
const MAX_CHANNEL = 255
const MAX_HUE = 360
const MAX_PERCENT = 100

/** Ограничить число диапазоном [min, max] */
function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max)
}

/** Привести строку к нормализованному 6-значному HEX в нижнем регистре или null */
function normalizeHex(input: string): string | null {
	const raw = input.trim().replace(/^#/, '').toLowerCase()
	if (!/^[0-9a-f]+$/.test(raw)) return null
	if (raw.length === HEX_SHORT_LENGTH) {
		const [r, g, b] = raw
		return `#${r}${r}${g}${g}${b}${b}`
	}
	if (raw.length === HEX_FULL_LENGTH) return `#${raw}`
	return null
}

/** Проверить, является ли строка валидным HEX-цветом (3 или 6 знаков) */
function isValidHex(input: string): boolean {
	return normalizeHex(input) !== null
}

/** Перевести один канал (0–255) в двухзначный HEX */
function channelToHex(channel: number): string {
	return clamp(Math.round(channel), 0, MAX_CHANNEL).toString(16).padStart(2, '0')
}

/** Преобразовать RGB в нормализованный HEX */
function rgbToHex(rgb: RgbColor): string {
	return `#${channelToHex(rgb.r)}${channelToHex(rgb.g)}${channelToHex(rgb.b)}`
}

/** Преобразовать HEX в RGB; для невалидного входа возвращает чёрный */
function hexToRgb(input: string): RgbColor {
	const normalized = normalizeHex(input)
	if (!normalized) return { r: 0, g: 0, b: 0 }
	const value = normalized.slice(1)
	return {
		r: Number.parseInt(value.slice(0, 2), 16),
		g: Number.parseInt(value.slice(2, 4), 16),
		b: Number.parseInt(value.slice(4, 6), 16),
	}
}

/** Вычислить hue по нормализованным каналам и дельте */
function calcHue(max: number, delta: number, channels: RgbColor): number {
	if (delta === 0) return 0
	const { r, g, b } = channels
	let hue: number
	if (max === r) hue = ((g - b) / delta) % 6
	else if (max === g) hue = (b - r) / delta + 2
	else hue = (r - g) / delta + 4
	const degrees = hue * 60
	return degrees < 0 ? degrees + MAX_HUE : degrees
}

/** Преобразовать RGB в HSV */
function rgbToHsv(rgb: RgbColor): HsvColor {
	const r = rgb.r / MAX_CHANNEL
	const g = rgb.g / MAX_CHANNEL
	const b = rgb.b / MAX_CHANNEL
	const max = Math.max(r, g, b)
	const min = Math.min(r, g, b)
	const delta = max - min
	return {
		h: Math.round(calcHue(max, delta, { r, g, b })),
		s: Math.round((max === 0 ? 0 : delta / max) * MAX_PERCENT),
		v: Math.round(max * MAX_PERCENT),
	}
}

/** Преобразовать HSV в RGB */
function hsvToRgb(hsv: HsvColor): RgbColor {
	const h = hsv.h / MAX_HUE
	const s = hsv.s / MAX_PERCENT
	const v = hsv.v / MAX_PERCENT
	const i = Math.floor(h * 6)
	const f = h * 6 - i
	const p = v * (1 - s)
	const q = v * (1 - f * s)
	const t = v * (1 - (1 - f) * s)
	const sequence: RgbColor[] = [
		{ r: v, g: t, b: p },
		{ r: q, g: v, b: p },
		{ r: p, g: v, b: t },
		{ r: p, g: q, b: v },
		{ r: t, g: p, b: v },
		{ r: v, g: p, b: q },
	]
	const picked = sequence[i % 6]
	return {
		r: Math.round(picked.r * MAX_CHANNEL),
		g: Math.round(picked.g * MAX_CHANNEL),
		b: Math.round(picked.b * MAX_CHANNEL),
	}
}

/** Преобразовать HEX в HSV */
function hexToHsv(input: string): HsvColor {
	return rgbToHsv(hexToRgb(input))
}

/** Преобразовать HSV в нормализованный HEX */
function hsvToHex(hsv: HsvColor): string {
	return rgbToHex(hsvToRgb(hsv))
}

export {
	channelToHex,
	hexToHsv,
	hexToRgb,
	hsvToHex,
	hsvToRgb,
	isValidHex,
	normalizeHex,
	rgbToHex,
	rgbToHsv,
}
