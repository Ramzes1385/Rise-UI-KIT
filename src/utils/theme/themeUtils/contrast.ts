/** Утилиты: семантические цвета темы в светлом и тёмном режиме и пары контраста WCAG 2.2 AA (общие с check-contrast.mjs) */

import { THEME_ROLES } from './types/themeUtils.types'
import { contrastRatio } from '@utils/theme/oklchUtils'
import { KIT_MAIN_SHADES, KIT_PALETTES } from './presets'
import { hexToRgb, rgbToHex } from '@utils/data/colorUtils'
import type {
	ThemeContrastPair,
	ThemeContrastRow,
	ThemeMode,
	ThemeShadeReader as Shade,
	ThemeVars as Colors,
} from './types/themeUtils.types'

const TEXT = 4.5
const GRAPHIC = 3
const WHITE = '#ffffff'
const PERCENT = 100
const HOVER_STEP = 100
const DARK_SOFT = 12
const DARK_SOFT_HOVER = 18
const RATIO_DECIMALS = 100
const SURFACES = ['--rise-bg', '--rise-bg-muted', '--rise-bg-elevated'] as const
const CODE_TOKENS = ['keyword', 'string', 'number', 'comment', 'function', 'tag', 'attribute', 'property', 'variable'] as const

/** Цвета подсветки кода кита (`--rise-code-*` в `_tokens.scss`): тема их не меняет, но меняет фоны под ними */
export const KIT_CODE_COLORS: Record<ThemeMode, Record<(typeof CODE_TOKENS)[number], string>> = {
	light: {
		keyword: '#cf222e',
		string: '#0a3069',
		number: '#0550ae',
		comment: '#57606a',
		function: '#8250df',
		tag: '#116329',
		attribute: '#0550ae',
		property: '#953800',
		variable: '#953800',
	},
	dark: {
		keyword: '#ff7b72',
		string: '#a5d6ff',
		number: '#79c0ff',
		comment: '#9ca3af',
		function: '#d2a8ff',
		tag: '#7ee787',
		attribute: '#79c0ff',
		property: '#ffa657',
		variable: '#ffa657',
	},
}

function rolePairs(role: string): ThemeContrastPair[] {
	const fill = `--rise-${role}` as const
	return [
		{ fg: `--rise-on-${role}`, bg: fill, min: TEXT, kind: 'on-role' },
		{ fg: `--rise-on-${role}`, bg: `${fill}-hover`, min: TEXT, kind: 'on-role-hover' },
		{ fg: fill, bg: '--rise-bg', min: TEXT, kind: 'role-text' },
		{ fg: `${fill}-text`, bg: `${fill}-soft`, min: TEXT, kind: 'role-soft-text' },
		{ fg: `${fill}-text`, bg: `${fill}-soft-hover`, min: TEXT, kind: 'role-soft-hover-text' },
		{ fg: fill, bg: `${fill}-soft`, min: TEXT, kind: 'role-on-soft', informational: true },
		{ fg: fill, bg: '--rise-bg-elevated', min: GRAPHIC, kind: 'role-graphic' },
	]
}

function basePairs(): ThemeContrastPair[] {
	const list: ThemeContrastPair[] = []
	for (const text of ['--rise-text-highlighted', '--rise-text', '--rise-text-toned'] as const) {
		for (const bg of SURFACES) list.push({ fg: text, bg, min: TEXT, kind: 'surface-text' })
	}
	list.push(
		{ fg: '--rise-text-muted', bg: '--rise-bg', min: TEXT, kind: 'muted-text' },
		{ fg: '--rise-text-muted', bg: '--rise-bg-muted', min: TEXT, kind: 'muted-text' },
		{ fg: '--rise-text-muted', bg: '--rise-bg-elevated', min: TEXT, kind: 'muted-text-elevated', informational: true },
		{ fg: '--rise-text-dimmed', bg: '--rise-bg', min: TEXT, kind: 'dimmed-text', informational: true },
		{ fg: '--rise-text-inverted', bg: '--rise-bg-inverted', min: TEXT, kind: 'inverted-text' },
		{ fg: '--rise-border-accented', bg: '--rise-bg', min: GRAPHIC, kind: 'field-border', informational: true },
		{ fg: '--rise-focus-ring', bg: '--rise-bg', min: GRAPHIC, kind: 'focus-ring' },
	)
	return list
}

function codePairs(): ThemeContrastPair[] {
	return CODE_TOKENS.flatMap(token =>
		[...SURFACES, '--rise-primary-soft' as const].map(bg => ({ fg: `--rise-code-${token}` as const, bg, min: TEXT, kind: 'code' })),
	)
}

/** Пары контраста кита: текст — 4.5:1 (WCAG 1.4.3), графика и кольцо фокуса — 3:1 (1.4.11); справочные не валят проверку */
export const THEME_CONTRAST_PAIRS: readonly ThemeContrastPair[] = [...basePairs(), ...codePairs(), ...THEME_ROLES.flatMap(rolePairs)]

/** Смесь двух непрозрачных цветов в sRGB, как `color-mix(in srgb, a p%, b)` */
function mix(first: string, second: string, percent: number): string {
	const a = hexToRgb(first)
	const b = hexToRgb(second)
	const share = percent / PERCENT
	const channel = (x: number, y: number): number => x * share + y * (1 - share)
	return rgbToHex({ r: channel(a.r, b.r), g: channel(a.g, b.g), b: channel(a.b, b.b) })
}

function shadeReader(vars: Colors): Shade {
	const kit = KIT_PALETTES as unknown as Record<string, Record<number, string>>
	return (role, shade) => vars[`--rise-color-${role}-${shade}`] ?? kit[role][shade]
}

function lightNeutrals(p: Shade): Colors {
	return {
		'--rise-bg': p('neutral', 0),
		'--rise-bg-muted': p('neutral', 50),
		'--rise-bg-elevated': p('neutral', 100),
		'--rise-bg-inverted': p('neutral', 900),
		'--rise-text-dimmed': p('neutral', 400),
		'--rise-text-muted': p('neutral', 500),
		'--rise-text-toned': p('neutral', 600),
		'--rise-text': p('neutral', 700),
		'--rise-text-highlighted': p('neutral', 900),
		'--rise-text-inverted': WHITE,
		'--rise-border-accented': p('neutral', 300),
	}
}

function darkNeutrals(p: Shade): Colors {
	return {
		'--rise-bg': p('neutral', 900),
		'--rise-bg-muted': p('neutral', 800),
		'--rise-bg-elevated': p('neutral', 800),
		'--rise-bg-inverted': WHITE,
		'--rise-text-dimmed': p('neutral', 500),
		'--rise-text-muted': p('neutral', 400),
		'--rise-text-toned': p('neutral', 300),
		'--rise-text': p('neutral', 200),
		'--rise-text-highlighted': WHITE,
		'--rise-text-inverted': p('neutral', 900),
		'--rise-border-accented': p('neutral', 700),
	}
}

function lightRole(role: (typeof THEME_ROLES)[number], p: Shade): Colors {
	const main = KIT_MAIN_SHADES[role]
	return {
		[`--rise-${role}`]: p(role, main),
		[`--rise-${role}-hover`]: p(role, main + HOVER_STEP),
		[`--rise-on-${role}`]: WHITE,
		[`--rise-${role}-soft`]: p(role, 50),
		[`--rise-${role}-soft-hover`]: p(role, 100),
		[`--rise-${role}-text`]: p(role, 800),
	}
}

function darkRole(role: (typeof THEME_ROLES)[number], p: Shade): Colors {
	const fill = p(role, 400)
	const bg = p('neutral', 900)
	return {
		[`--rise-${role}`]: fill,
		[`--rise-${role}-hover`]: p(role, 300),
		[`--rise-on-${role}`]: p('neutral', 950),
		[`--rise-${role}-soft`]: mix(fill, bg, DARK_SOFT),
		[`--rise-${role}-soft-hover`]: mix(fill, bg, DARK_SOFT_HOVER),
		[`--rise-${role}-text`]: p(role, 300),
	}
}

function codeColors(mode: ThemeMode): Colors {
	return Object.fromEntries(Object.entries(KIT_CODE_COLORS[mode]).map(([token, color]) => [`--rise-code-${token}`, color]))
}

/** Литералы HEX из сидов темы, заданные прямо на семантических токенах (вход `tokens`), сильнее вычисленных */
function literalOverrides(vars: Colors): Colors {
	return Object.fromEntries(
		Object.entries(vars).filter(([name, value]) => !name.startsWith('--rise-color-') && /^#[0-9a-f]{3,6}$/i.test(value)),
	)
}

/**
 * Семантические цвета темы в режиме — так же, как их считает `_tokens.scss` из сидов: светлый режим — главные оттенки
 * ролей, тёмный — 400/300 и мягкие фоны через смесь с фоном. Сиды, которых нет в `vars`, берутся из палитр кита.
 */
export function resolveThemeColors(vars: Colors, mode: ThemeMode): Colors {
	const p = shadeReader(vars)
	const isLight = mode === 'light'
	const neutrals = isLight ? lightNeutrals(p) : darkNeutrals(p)
	const roles = THEME_ROLES.map(role => (isLight ? lightRole(role, p) : darkRole(role, p)))
	const colors: Colors = Object.assign({}, neutrals, codeColors(mode), ...roles)
	colors['--rise-focus-ring'] = colors['--rise-primary']
	return { ...colors, ...literalOverrides(vars) }
}

function rowsFor(colors: Colors, mode: ThemeMode): ThemeContrastRow[] {
	return THEME_CONTRAST_PAIRS.map(pair => {
		const fgColor = colors[pair.fg]
		const bgColor = colors[pair.bg]
		const ratio = Math.round(contrastRatio(fgColor, bgColor) * RATIO_DECIMALS) / RATIO_DECIMALS
		return { ...pair, mode, fgColor, bgColor, ratio, ok: contrastRatio(fgColor, bgColor) >= pair.min }
	})
}

/** Отчёт контраста темы: все пары `THEME_CONTRAST_PAIRS` в светлом и тёмном режиме; `darkVars` — сиды только тёмного режима */
export function themeContrast(vars: Colors, darkVars: Colors = {}): ThemeContrastRow[] {
	return [
		...rowsFor(resolveThemeColors(vars, 'light'), 'light'),
		...rowsFor(resolveThemeColors({ ...vars, ...darkVars }, 'dark'), 'dark'),
	]
}
