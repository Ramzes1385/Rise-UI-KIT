/** Соответствие переменных `--rise-*` токенам W3C: путь в дереве, тип и перевод значения CSS в значение токена */

import { formatNumber, parseColor, splitTopLevel, toHex } from './cssValue.ts'
import type { GradientStop, ShadowValue, TokenType, TokenValue } from './types.ts'

interface PathRule {
	pattern: RegExp
	path: (match: RegExpExecArray) => string[]
	type: TokenType | null
}

const CSS_PREFIX = '--rise-'

/** Первое совпавшее правило задаёт путь; `type: null` — тип выбирается по значению (цвет или градиент) */
const RULES: readonly PathRule[] = [
	{ pattern: /^color-([a-z]+)-(\d+)$/, path: match => ['palette', match[1], match[2]], type: 'color' },
	{ pattern: /^font-(sans|heading|mono)$/, path: match => ['font', 'family', match[1]], type: 'fontFamily' },
	{ pattern: /^font-size-(.+)$/, path: match => ['font', 'size', match[1]], type: 'dimension' },
	{ pattern: /^line-height-(.+)$/, path: match => ['font', 'line-height', match[1]], type: 'dimension' },
	{ pattern: /^font-weight-(.+)$/, path: match => ['font', 'weight', match[1]], type: 'fontWeight' },
	{ pattern: /^radius$/, path: () => ['radius', 'base'], type: 'dimension' },
	{ pattern: /^radius-(.+)$/, path: match => ['radius', match[1]], type: 'dimension' },
	{ pattern: /^control-(.+)$/, path: match => ['control', match[1]], type: 'dimension' },
	{ pattern: /^density$/, path: () => ['density'], type: 'number' },
	{ pattern: /^shadow-strength$/, path: () => ['shadow', 'strength'], type: 'number' },
	{ pattern: /^shadow-(.+)$/, path: match => ['shadow', match[1]], type: 'shadow' },
	{ pattern: /^disabled-opacity$/, path: () => ['opacity', 'disabled'], type: 'number' },
	{ pattern: /^z-(.+)$/, path: match => ['z-index', match[1]], type: 'number' },
	{ pattern: /^duration$/, path: () => ['duration', 'base'], type: 'duration' },
	{ pattern: /^duration-(.+)$/, path: match => ['duration', match[1]], type: 'duration' },
	{ pattern: /^ease$/, path: () => ['easing', 'base'], type: 'cubicBezier' },
	{ pattern: /^ease-(.+)$/, path: match => ['easing', match[1]], type: 'cubicBezier' },
	{ pattern: /^media-(.+)$/, path: match => ['media', match[1]], type: null },
	{ pattern: /^chart-(\d+)$/, path: match => ['chart', match[1]], type: 'color' },
	{ pattern: /^code-(.+)$/, path: match => ['code', match[1]], type: 'color' },
	{ pattern: /^flow-(.+)$/, path: match => ['flow', match[1]], type: 'color' },
	{
		pattern: /^(?:bg|text|border|on|overlay|focus-ring|primary|success|info|warning|error)(?:-.+)?$/,
		path: match => ['color', match[0]],
		type: 'color',
	},
]

const KEYWORD_BEZIER: Record<string, readonly number[]> = {
	linear: [0, 0, 1, 1],
	ease: [0.25, 0.1, 0.25, 1],
	'ease-in': [0.42, 0, 1, 1],
	'ease-out': [0, 0, 0.58, 1],
	'ease-in-out': [0.42, 0, 0.58, 1],
}

/** Путь токена и его тип по имени переменной (`--rise-bg-muted` → `color.bg-muted`); значение нужно для `media-*` */
export function describeToken(cssVariable: string, resolved: string): { path: string[]; type: TokenType } {
	const name = cssVariable.startsWith(CSS_PREFIX) ? cssVariable.slice(CSS_PREFIX.length) : cssVariable
	for (const rule of RULES) {
		const match = rule.pattern.exec(name)
		if (!match) continue
		return { path: rule.path(match), type: rule.type ?? (resolved.startsWith('linear-gradient(') ? 'gradient' : 'color') }
	}
	throw new Error(`Для ${cssVariable} нет правила в build/tokens/tokenMap.ts: добавьте путь и тип токена`)
}

function dimension(value: string): string {
	if (value === '0') return '0px'
	const match = /^(-?(?:\d+\.?\d*|\.\d+))(px|rem|em)$/.exec(value)
	if (!match) throw new Error(`Неверное значение dimension: ${value}`)
	return `${formatNumber(Number(match[1]))}${match[2]}`
}

function duration(value: string): string {
	const match = /^(\d+\.?\d*|\.\d+)(ms|s)$/.exec(value)
	if (!match) throw new Error(`Неверное значение duration: ${value}`)
	return `${formatNumber(Number(match[1]))}${match[2]}`
}

function numberOf(value: string): number {
	const parsed = Number(value)
	if (value === '' || Number.isNaN(parsed)) throw new Error(`Неверное число: ${value}`)
	return parsed
}

function fontFamily(value: string): string[] {
	return splitTopLevel(value, ',').map(item => item.replace(/^(["'])(.*)\1$/, '$2'))
}

function cubicBezier(value: string): readonly number[] {
	if (value in KEYWORD_BEZIER) return KEYWORD_BEZIER[value]
	const match = /^cubic-bezier\((.+)\)$/.exec(value)
	const points = match ? match[1].split(',').map(item => numberOf(item.trim())) : []
	if (points.length !== 4) throw new Error(`Неверное значение cubic-bezier: ${value}`)
	return points
}

function shadowLayer(layer: string): ShadowValue {
	const parts = splitTopLevel(layer, ' ')
	const color = parts.pop() as string
	if (parts.includes('inset') || parts.length < 2 || parts.length > 4) throw new Error(`Неподдерживаемая тень: ${layer}`)
	const [offsetX, offsetY, blur = '0', spread = '0'] = parts.map(dimension)
	return { color: toHex(parseColor(color)), offsetX, offsetY, blur, spread }
}

function gradientStops(value: string): GradientStop[] {
	const args = splitTopLevel(value.slice(value.indexOf('(') + 1, -1), ',')
	return args.slice(1).map(stop => {
		const match = /^(.*\S)\s+(\d+(?:\.\d+)?)%$/.exec(stop)
		if (!match) throw new Error(`Неподдерживаемая остановка градиента: ${stop}`)
		return { color: toHex(parseColor(match[1])), position: Number(match[2]) / 100 }
	})
}

/** Значение токена из значения CSS с вычисленными `var()` и `calc()` */
export function convertValue(type: TokenType, resolved: string): TokenValue {
	const value = resolved.replace(/\s+/g, ' ').trim()
	switch (type) {
		case 'color':
			return toHex(parseColor(value))
		case 'dimension':
			return dimension(value)
		case 'duration':
			return duration(value)
		case 'fontFamily':
			return fontFamily(value)
		case 'fontWeight':
		case 'number':
			return numberOf(value)
		case 'cubicBezier':
			return cubicBezier(value)
		case 'shadow':
			return splitTopLevel(value, ',').map(shadowLayer)
		case 'gradient':
			return gradientStops(value)
	}
}
