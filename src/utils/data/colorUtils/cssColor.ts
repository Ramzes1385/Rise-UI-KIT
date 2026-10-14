/** Утилиты: приведение любого CSS-цвета (oklch, color(), color-mix…) к hex или rgba через canvas */

import { rgbToHex } from './colorUtils'

const MODERN_COLOR = /(?:oklch|oklab|lch|lab|hwb|color|color-mix)\(/i
const MAX_CHANNEL = 255

function getContext(): CanvasRenderingContext2D | null {
	if (typeof document === 'undefined') return null
	return document.createElement('canvas').getContext('2d', { willReadFrequently: true })
}

/** Нужно ли приводить цвет: современные записи, которые не понимает часть сторонних библиотек (Google Maps, canvas-графики) */
export function isModernCssColor(color: string): boolean {
	return MODERN_COLOR.test(color)
}

/**
 * Привести CSS-цвет к `#rrggbb` (непрозрачный) или `rgba(r, g, b, a)`. Цвет за пределами sRGB обрезается по гамме.
 * Нужен `document` с поддержкой canvas; без него или для неразобранной строки — `null`.
 */
export function normalizeCssColor(color: string): string | null {
	const ctx = getContext()
	if (!ctx) return null
	ctx.clearRect(0, 0, 1, 1)
	ctx.fillStyle = '#000000'
	ctx.fillStyle = color
	ctx.fillRect(0, 0, 1, 1)
	const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data
	if (a === MAX_CHANNEL) return rgbToHex({ r, g, b })
	return `rgba(${r}, ${g}, ${b}, ${Math.round((a / MAX_CHANNEL) * 100) / 100})`
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
