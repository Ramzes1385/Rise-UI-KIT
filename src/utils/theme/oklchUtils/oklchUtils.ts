/** Утилиты: перевод цвета sRGB ⇄ OKLCH (Björn Ottosson), приведение в гамут sRGB и контраст WCAG */

import type { RgbColor } from '@utils/data/colorUtils'
import { hexToRgb, rgbToHex } from '@utils/data/colorUtils'
import type { OklchColor, OklchVector as Vector } from './types/oklchUtils.types'

const MAX_CHANNEL = 255
const DEGREES = 180
const FULL_TURN = 360
const GAMUT_EPSILON = 0.001
const CHROMA_STEP = 0.002
const LUMINANCE_OFFSET = 0.05

function toLinear(channel: number): number {
	return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
}

function fromLinear(channel: number): number {
	return channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055
}

function multiply(matrix: Vector[], vector: Vector): Vector {
	return matrix.map(row => row[0] * vector[0] + row[1] * vector[1] + row[2] * vector[2]) as Vector
}

const RGB_TO_LMS: Vector[] = [
	[0.4122214708, 0.5363325363, 0.0514459929],
	[0.2119034982, 0.6806995451, 0.1073969566],
	[0.0883024619, 0.2817188376, 0.6299787005],
]
const LMS_TO_LAB: Vector[] = [
	[0.2104542553, 0.793617785, -0.0040720468],
	[1.9779984951, -2.428592205, 0.4505937099],
	[0.0259040371, 0.7827717662, -0.808675766],
]
const LAB_TO_LMS: Vector[] = [
	[1, 0.3963377774, 0.2158037573],
	[1, -0.1055613458, -0.0638541728],
	[1, -0.0894841775, -1.291485548],
]
const LMS_TO_RGB: Vector[] = [
	[4.0767416621, -3.3077115913, 0.2309699292],
	[-1.2684380046, 2.6097574011, -0.3413193965],
	[-0.0041960863, -0.7034186147, 1.707614701],
]

function rgbToVector(rgb: RgbColor): Vector {
	return [rgb.r / MAX_CHANNEL, rgb.g / MAX_CHANNEL, rgb.b / MAX_CHANNEL]
}

/** Перевести цвет sRGB (каналы 0–255) в OKLCH */
function rgbToOklch(rgb: RgbColor): OklchColor {
	const lms = multiply(RGB_TO_LMS, rgbToVector(rgb).map(toLinear) as Vector).map(Math.cbrt) as Vector
	const [l, a, b] = multiply(LMS_TO_LAB, lms)
	const hue = (Math.atan2(b, a) * DEGREES) / Math.PI
	return { l, c: Math.hypot(a, b), h: (hue + FULL_TURN) % FULL_TURN }
}

/** OKLCH в sRGB без ограничения: каналы 0–1, вне гамута — меньше 0 или больше 1 */
function oklchToLinearSrgb(color: OklchColor): Vector {
	const radians = (color.h * Math.PI) / DEGREES
	const lab: Vector = [color.l, color.c * Math.cos(radians), color.c * Math.sin(radians)]
	const lms = multiply(LAB_TO_LMS, lab).map(value => value ** 3) as Vector
	return multiply(LMS_TO_RGB, lms).map(fromLinear) as Vector
}

function isInGamut(channels: Vector): boolean {
	return channels.every(value => value >= -GAMUT_EPSILON && value <= 1 + GAMUT_EPSILON)
}

/** Привести цвет в гамут sRGB, уменьшая хрому при той же светлоте и тоне */
function toGamut(color: OklchColor): OklchColor {
	let chroma = color.c
	while (chroma > 0 && !isInGamut(oklchToLinearSrgb({ ...color, c: chroma }))) chroma -= CHROMA_STEP
	return { ...color, c: Math.max(chroma, 0) }
}

/** Перевести OKLCH в sRGB (каналы 0–255); цвет вне гамута сначала теряет хрому */
function oklchToRgb(color: OklchColor): RgbColor {
	const [r, g, b] = oklchToLinearSrgb(toGamut(color)).map(value => Math.min(1, Math.max(0, value)) * MAX_CHANNEL)
	return { r, g, b }
}

function hexToOklch(hex: string): OklchColor {
	return rgbToOklch(hexToRgb(hex))
}

function oklchToHex(color: OklchColor): string {
	return rgbToHex(oklchToRgb(color))
}

/** Относительная яркость WCAG 2.2 для HEX */
function relativeLuminance(hex: string): number {
	const [r, g, b] = rgbToVector(hexToRgb(hex)).map(toLinear)
	return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Контраст двух цветов по WCAG 2.2: от 1 до 21, порядок аргументов не важен */
function contrastRatio(first: string, second: string): number {
	const [light, dark] = [relativeLuminance(first), relativeLuminance(second)].sort((x, y) => y - x)
	return (light + LUMINANCE_OFFSET) / (dark + LUMINANCE_OFFSET)
}

export { contrastRatio, hexToOklch, oklchToHex, oklchToRgb, relativeLuminance, rgbToOklch, toGamut }
