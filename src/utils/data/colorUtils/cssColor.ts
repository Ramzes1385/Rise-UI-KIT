/** Утилиты: приведение любого CSS-цвета (oklch, color(), color-mix…) к hex или rgba через canvas */

import { rgbToHex } from './colorUtils'

const MODERN_COLOR = /(?:oklch|oklab|lch|lab|hwb|color|color-mix)\(/i
const MAX_CHANNEL = 255

let probeCanvas: HTMLCanvasElement | null = null

function getContext(): CanvasRenderingContext2D | null {
	if (typeof document === 'undefined') return null
	probeCanvas ??= document.createElement('canvas')
	return probeCanvas.getContext('2d', { willReadFrequently: true })
}

function isParsedByCanvas(ctx: CanvasRenderingContext2D, color: string): boolean {
	ctx.fillStyle = '#000000'
	ctx.fillStyle = color
	const onBlack = ctx.fillStyle
	ctx.fillStyle = '#ffffff'
	ctx.fillStyle = color
	return onBlack === ctx.fillStyle
}

function roundAlpha(alpha: number): number {
	const fraction = alpha / MAX_CHANNEL
	return Math.round(fraction * 100) / 100 || Math.round(fraction * 1000) / 1000
}

/** Нужно ли приводить цвет: современные записи, которые не понимает часть сторонних библиотек (Google Maps, canvas-графики) */
export function isModernCssColor(color: string): boolean {
	return MODERN_COLOR.test(color)
}

/**
 * Привести CSS-цвет к `#rrggbb` (непрозрачный) или `rgba(r, g, b, a)`. Цвет за пределами sRGB обрезается по гамме.
 * Прозрачность — до сотых; только если до сотых получился бы `0` (прозрачность меньше 0.005, один шаг канала alpha), — до тысячных.
 * Canvas хранит каналы по 8 бит с premultiplied alpha, поэтому у цвета с прозрачностью ниже ≈ 0.1 каналы r, g, b
 * приблизительны (±(1 / альфа) единиц), сама прозрачность остаётся точной.
 * Нужен `document` с поддержкой canvas; без него или для неразобранной строки — `null`.
 */
export function normalizeCssColor(color: string): string | null {
	const ctx = getContext()
	if (!ctx) return null
	if (!isParsedByCanvas(ctx, color)) return null
	ctx.clearRect(0, 0, 1, 1)
	ctx.fillStyle = color
	ctx.fillRect(0, 0, 1, 1)
	const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
	if (a === MAX_CHANNEL) return rgbToHex({ r, g, b })
	return `rgba(${r}, ${g}, ${b}, ${roundAlpha(a)})`
}

/** Это токен или другое выражение `var(--имя)`: цвет надо вычислять в браузере, его значение зависит от темы */
export function isCssVarColor(color: string): boolean {
	return /^var[(] *--/.test(color.trim())
}

function computedColor(scope: Element, value: string): string {
	const probe = document.createElement('span')
	probe.style.color = value
	scope.append(probe)
	const resolved = getComputedStyle(probe).color
	probe.remove()
	return resolved || value
}

/**
 * Значение цвета для сторонних библиотек: `var(--…)` вычисляется в `scope` (учитывает тему области),
 * `oklch()`, `color()` и другие современные записи приводятся к hex или rgba. Остальное возвращается как есть.
 */
export function resolveCssColor(value: string, scope: Element | null): string {
	const resolved = scope && value.includes('var(') ? computedColor(scope, value) : value
	return (isModernCssColor(resolved) && normalizeCssColor(resolved)) || resolved
}
