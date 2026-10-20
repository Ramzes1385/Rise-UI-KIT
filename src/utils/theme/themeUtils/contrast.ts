/** Утилиты: семантические цвета темы в светлом и тёмном режиме и пары контраста WCAG 2.2 AA (общие с check-contrast.mjs) */

import { THEME_ROLES } from './types/themeUtils.types'
import { contrastRatio } from '@utils/theme/oklchUtils'
import { hexToRgb, rgbToHex } from '@utils/data/colorUtils'
import { KIT_DARK_ROLES, KIT_LIGHT_ROLES, KIT_MAIN_SHADES, KIT_PALETTES } from './presets'
import type {
	ThemeContrastPair,
	ThemeContrastRow,
	ThemeMode,
	ThemeRole,
	ThemeRoleColor,
	ThemeShadeReader as Shade,
	ThemeVars as Colors,
} from './types/themeUtils.types'

const TEXT = 4.5
const GRAPHIC = 3
const WHITE = '#ffffff'
const BLACK = '#000000'
const PERCENT = 100
const DARK_SOFT = 14
const DARK_SOFT_HOVER = 20
const RATIO_DECIMALS = 100
const SURFACES = ['--rise-bg', '--rise-bg-muted', '--rise-bg-elevated'] as const
const TEXT_SURFACES = [...SURFACES, '--rise-surface-raised'] as const
const CODE_TOKENS = ['keyword', 'string', 'number', 'comment', 'function', 'tag', 'attribute', 'property', 'variable'] as const
const HEX = /^#[0-9a-f]{3,6}$/i

/** Цвета подсветки кода кита (`--rise-code-*` в `_tokens.scss`): тема их не меняет, но меняет фоны под ними */
export const KIT_CODE_COLORS: Record<ThemeMode, Record<(typeof CODE_TOKENS)[number], string>> = {
	light: {
		keyword: '#6b3fd4',
		string: '#0b7a47',
		number: '#b23e06',
		comment: '#5b6276',
		function: '#2a4fd8',
		tag: '#b0174f',
		attribute: '#8a5200',
		property: '#0b6e7a',
		variable: '#2a2f3d',
	},
	dark: {
		keyword: '#b79cff',
		string: '#7fe0a8',
		number: '#ffa470',
		comment: '#8a91a6',
		function: '#8eabff',
		tag: '#ff8fb1',
		attribute: '#ffd07a',
		property: '#6fe3ee',
		variable: '#cdd3e1',
	},
}

function rolePairs(role: string): ThemeContrastPair[] {
	const fill = `--rise-${role}` as const
	return [
		{ fg: `--rise-on-${role}`, bg: fill, min: TEXT, kind: 'on-role' },
		{ fg: `--rise-on-${role}`, bg: `${fill}-hover`, min: TEXT, kind: 'on-role-hover' },
		{ fg: fill, bg: '--rise-bg', min: GRAPHIC, kind: 'role-graphic-bg' },
		{ fg: `${fill}-text`, bg: '--rise-bg', min: TEXT, kind: 'role-text-bg' },
		{ fg: `${fill}-text`, bg: `${fill}-soft`, min: TEXT, kind: 'role-soft-text' },
		{ fg: `${fill}-text`, bg: `${fill}-soft-hover`, min: TEXT, kind: 'role-soft-hover-text' },
		{ fg: fill, bg: `${fill}-soft`, min: TEXT, kind: 'role-on-soft', informational: true },
		{ fg: fill, bg: '--rise-bg-elevated', min: GRAPHIC, kind: 'role-graphic' },
	]
}

function basePairs(): ThemeContrastPair[] {
	const list: ThemeContrastPair[] = []
	for (const text of ['--rise-text-highlighted', '--rise-text', '--rise-text-toned'] as const) {
		for (const bg of TEXT_SURFACES) list.push({ fg: text, bg, min: TEXT, kind: 'surface-text' })
	}
	for (const bg of SURFACES) list.push({ fg: '--rise-border-control', bg, min: GRAPHIC, kind: 'control-border' })
	list.push(
		{ fg: '--rise-text-muted', bg: '--rise-bg', min: TEXT, kind: 'muted-text' },
		{ fg: '--rise-text-muted', bg: '--rise-bg-muted', min: TEXT, kind: 'muted-text' },
		{ fg: '--rise-text-muted', bg: '--rise-surface-raised', min: TEXT, kind: 'muted-text' },
		{ fg: '--rise-text-muted', bg: '--rise-bg-elevated', min: TEXT, kind: 'muted-text-elevated', informational: true },
		{ fg: '--rise-text-dimmed', bg: '--rise-bg', min: TEXT, kind: 'dimmed-text', informational: true },
		{ fg: '--rise-text-inverted', bg: '--rise-bg-inverted', min: TEXT, kind: 'inverted-text' },
		{ fg: '--rise-border-accented', bg: '--rise-bg', min: GRAPHIC, kind: 'field-border', informational: true },
		{ fg: '--rise-focus-ring', bg: '--rise-bg', min: GRAPHIC, kind: 'focus-ring' },
		{ fg: '--rise-focus-ring', bg: '--rise-bg-muted', min: GRAPHIC, kind: 'focus-ring' },
	)
	return list
}

function codePairs(): ThemeContrastPair[] {
	return CODE_TOKENS.flatMap(token =>
		[...SURFACES, '--rise-primary-soft' as const].map(bg => ({ fg: `--rise-code-${token}` as const, bg, min: TEXT, kind: 'code' })),
	)
}

/**
 * Пары контраста кита: текст — 4.5:1 (WCAG 1.4.3), графика, граница флажка и кольцо фокуса — 3:1 (1.4.11); справочные не валят
 * проверку. Заливка роли — графика (3:1 к фону): текстом роли служит `--rise-<роль>-text`
 */
export const THEME_CONTRAST_PAIRS: readonly ThemeContrastPair[] = [...basePairs(), ...codePairs(), ...THEME_ROLES.flatMap(rolePairs)]

/** Смесь двух непрозрачных цветов в sRGB, как `color-mix(in srgb, a p%, b)` */
function mix(first: string, second: string, percent: number): string {
	const a = hexToRgb(first)
	const b = hexToRgb(second)
	const share = percent / PERCENT
	const channel = (x: number, y: number): number => x * share + y * (1 - share)
	return rgbToHex({ r: channel(a.r, b.r), g: channel(a.g, b.g), b: channel(a.b, b.b) })
}

/** Цвет роли по записи таблицы `KIT_DARK_ROLES`: шаг палитры, смесь `[шаг, доля %, шаг]` или литерал HEX */
export function roleColor(value: ThemeRoleColor, role: string, p: Shade): string {
	if (typeof value === 'number') return p(role, value)
	if (typeof value === 'string') return value
	return mix(p(role, value[0]), p(role, value[2]), value[1])
}

function shadeReader(vars: Colors): Shade {
	const kit = KIT_PALETTES as unknown as Record<string, Record<number, string>>
	return (role, shade) => vars[`--rise-color-${role}-${shade}`] ?? kit[role][shade]
}

function lightNeutrals(p: Shade): Colors {
	const n = (shade: number): string => p('neutral', shade)
	return {
		'--rise-bg': n(0),
		'--rise-bg-muted': n(50),
		'--rise-bg-elevated': n(100),
		'--rise-bg-inverted': n(950),
		'--rise-surface-raised': n(0),
		'--rise-text-dimmed': n(400),
		'--rise-text-muted': n(600),
		'--rise-text-toned': n(700),
		'--rise-text': n(800),
		'--rise-text-highlighted': n(950),
		'--rise-text-inverted': n(0),
		'--rise-border-accented': n(300),
		'--rise-border-control': n(500),
	}
}

/** Тёмные уровни — смеси шагов, как в `dark-tokens` (`_tokens.scss`) */
function darkNeutrals(p: Shade): Colors {
	const n = (shade: number): string => p('neutral', shade)
	return {
		'--rise-bg': mix(n(950), BLACK, 73),
		'--rise-bg-muted': mix(n(900), n(950), 38),
		'--rise-bg-elevated': n(900),
		'--rise-bg-inverted': n(50),
		'--rise-surface-raised': mix(n(800), n(900), 19),
		'--rise-text-dimmed': n(600),
		'--rise-text-muted': mix(n(400), n(500), 42),
		'--rise-text-toned': mix(n(300), n(400), 34),
		'--rise-text': n(300),
		'--rise-text-highlighted': n(50),
		'--rise-text-inverted': n(950),
		'--rise-border-accented': n(800),
		'--rise-border-control': mix(n(500), n(600), 23),
	}
}

/** Светлая роль: заливка 600, текст и наведение — сиды темы `--rise-color-<роль>-on`/`-hover` или таблица кита */
function lightRole(role: ThemeRole, p: Shade, vars: Colors): Colors {
	const scheme = KIT_LIGHT_ROLES[role]
	return {
		[`--rise-${role}`]: p(role, KIT_MAIN_SHADES[role]),
		[`--rise-${role}-hover`]: vars[`--rise-color-${role}-hover`] ?? p(role, scheme.hover),
		[`--rise-on-${role}`]: vars[`--rise-color-${role}-on`] ?? (scheme.on === 'dark' ? p('neutral', 950) : WHITE),
		[`--rise-${role}-soft`]: p(role, 50),
		[`--rise-${role}-soft-hover`]: p(role, 100),
		[`--rise-${role}-text`]: p(role, 800),
	}
}

/** Тёмная роль: цвета по таблице кита (литерал из `darkVars` сильнее), мягкие фоны — смесь заливки с фоном */
function darkRole(role: ThemeRole, p: Shade, base: Colors): Colors {
	const scheme = KIT_DARK_ROLES[role]
	const pick = (token: string, value: ThemeRoleColor): string => base[token] ?? roleColor(value, role, p)
	const fill = pick(`--rise-${role}`, scheme.fill)
	const bg = base['--rise-bg']
	return {
		[`--rise-${role}`]: fill,
		[`--rise-${role}-hover`]: pick(`--rise-${role}-hover`, scheme.hover),
		[`--rise-on-${role}`]: p('neutral', 950),
		[`--rise-${role}-soft`]: mix(fill, bg, DARK_SOFT),
		[`--rise-${role}-soft-hover`]: mix(fill, bg, DARK_SOFT_HOVER),
		[`--rise-${role}-text`]: pick(`--rise-${role}-text`, scheme.text),
	}
}

function codeColors(mode: ThemeMode): Colors {
	return Object.fromEntries(Object.entries(KIT_CODE_COLORS[mode]).map(([token, color]) => [`--rise-code-${token}`, color]))
}

/** Литералы HEX из сидов темы, заданные прямо на семантических токенах (вход `tokens`, тёмные цвета роли), сильнее вычисленных */
function literalOverrides(vars: Colors): Colors {
	return Object.fromEntries(Object.entries(vars).filter(([name, value]) => !name.startsWith('--rise-color-') && HEX.test(value)))
}

/**
 * Семантические цвета темы в режиме — так же, как их считает `_tokens.scss` из сидов: светлый режим — заливка 600 и текст
 * с наведением по таблице кита или сидам темы, тёмный — таблица тёмных ролей, уровни фона смесью шагов нейтрали, мягкие
 * фоны — смесь заливки с фоном. Сиды, которых нет в `vars`, берутся из палитр кита.
 */
export function resolveThemeColors(vars: Colors, mode: ThemeMode): Colors {
	const p = shadeReader(vars)
	const isLight = mode === 'light'
	const literals = literalOverrides(vars)
	const neutrals = { ...(isLight ? lightNeutrals(p) : darkNeutrals(p)), ...literals }
	const roles = THEME_ROLES.map(role => (isLight ? lightRole(role, p, vars) : darkRole(role, p, { ...neutrals, ...literals })))
	const colors: Colors = Object.assign({}, neutrals, codeColors(mode), ...roles)
	colors['--rise-focus-ring'] = colors['--rise-primary']
	return { ...colors, ...literals }
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
