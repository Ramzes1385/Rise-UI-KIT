/** Утилиты: тема из нескольких входов — сиды на `[data-rise-theme]`, CSS одной строкой и отчёт контраста */

import { roleColor, themeContrast } from './contrast'
import { THEME_ROLES } from './types/themeUtils.types'
import { contrastRatio } from '@utils/theme/oklchUtils'
import { KIT_DARK_ROLES, KIT_MAIN_SHADES } from './presets'
import { createNeutralPalette, createPalette } from './palette'
import type {
	Theme,
	ThemeDarkRole,
	ThemeDensity,
	ThemeNeutralPalette,
	ThemeFonts,
	ThemeInput,
	ThemeMotion,
	ThemePaletteResult,
	ThemeRadius,
	ThemeRole,
	ThemeShade,
	ThemeShadows,
	ThemeColorSeeds,
	ThemeVars as Vars,
} from './types/themeUtils.types'

const RADIUS: Record<ThemeRadius, number> = { none: 0, sm: 2, md: 4, lg: 8, full: 14 }
const DENSITY: Record<ThemeDensity, number> = { compact: 0.75, default: 1, comfortable: 1.25 }
const SHADOWS: Record<ThemeShadows, number> = { none: 0, soft: 0.6, default: 1, strong: 1.8 }
const MOTION: Record<ThemeMotion, [string, string, string, string]> = {
	none: ['0.01ms', '0.01ms', '0.01ms', 'linear'],
	subtle: ['100ms', '150ms', '200ms', 'cubic-bezier(0.2, 0, 0, 1)'],
	standard: ['140ms', '200ms', '320ms', 'cubic-bezier(0.2, 0.8, 0.2, 1)'],
	expressive: ['200ms', '320ms', '450ms', 'cubic-bezier(0.34, 1.56, 0.64, 1)'],
}
const DURATIONS = ['--rise-duration-fast', '--rise-duration', '--rise-duration-slow'] as const
const REDUCED_DURATION = '0.01ms'
const TEXT_CONTRAST = 4.5
const WHITE = '#ffffff'
const DARK_TEXT_SHADE = 950
const HOVER_SHADES = { dark: 500, light: 700 } as const
/** Тёмная тема роли из сгенерированной палитры: литералы кита (у success) к чужому цвету роли не подходят */
const GENERATED_DARK_ROLE: ThemeDarkRole = { fill: 400, hover: 300, text: [200, 59, 300] }
const DARK_ROLE_TOKENS = { fill: '', hover: '-hover', text: '-text' } as const

/** Имя темы для селектора: строчная латиница, цифры и дефис */
function themeName(name: string): string {
	return (
		name
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9-]+/g, '-')
			.replace(/^-+|-+$/g, '') || 'theme'
	)
}

/** Значение сида без символов, которые закрыли бы правило или тег `<style>` */
function safeValue(value: string): string {
	return value.replace(/[{}<>;]/g, '')
}

function paletteVars(role: string, shades: Record<number, string>): Vars {
	return Object.fromEntries(Object.entries(shades).map(([shade, color]) => [`--rise-color-${role}-${shade}`, color]))
}

/**
 * Сгенерированная палитра роли и её светлые сиды: текст на заливке (`--rise-color-<роль>-on`) и наведение
 * (`--rise-color-<роль>-hover`) — по светлоте бренда, а не по таблице кита: тёмный текст — наведение светлее, белый — темнее
 */
function generatedVars(role: ThemeRole, palette: ThemePaletteResult, neutral: ThemeNeutralPalette): Vars {
	return {
		...paletteVars(role, palette.shades),
		[`--rise-color-${role}-on`]: palette.on === 'dark' ? neutral[DARK_TEXT_SHADE] : WHITE,
		[`--rise-color-${role}-hover`]: palette.shades[HOVER_SHADES[palette.on]],
	}
}

/** Тёмные цвета роли, которые в ките — литералы (success): из сгенерированной палитры, только тёмному режиму */
function generatedDarkVars(role: ThemeRole, shades: Record<number, string>): Vars {
	const vars: Vars = {}
	const read = (_role: string, shade: number): string => shades[shade]
	for (const key of ['fill', 'hover', 'text'] as const) {
		if (typeof KIT_DARK_ROLES[role][key] !== 'string') continue
		vars[`--rise-${role}${DARK_ROLE_TOKENS[key]}`] = roleColor(GENERATED_DARK_ROLE[key], role, read)
	}
	return vars
}

function roleVars(input: ThemeInput, neutral: ThemeNeutralPalette): { vars: Vars; darkVars: Vars } {
	const vars: Vars = {}
	const darkVars: Vars = {}
	for (const role of THEME_ROLES.filter(item => item !== 'primary')) {
		const ready = input.palettes?.[role]
		const seed = input[role]
		if (ready) Object.assign(vars, paletteVars(role, ready))
		else if (seed) {
			const palette = createPalette(seed, KIT_MAIN_SHADES[role])
			Object.assign(vars, generatedVars(role, palette, neutral))
			Object.assign(darkVars, generatedDarkVars(role, palette.shades))
		}
	}
	return { vars, darkVars }
}

/** Бренд тёмного режима: встаёт на заливку тёмной темы (500) с тёмным текстом; выводятся оттенки заливки, наведения и текста */
function darkPrimaryVars(primaryDark: string | undefined): { vars: Vars; adjusted: boolean } {
	if (!primaryDark) return { vars: {}, adjusted: false }
	const [fill, hover, text] = [KIT_DARK_ROLES.primary.fill, KIT_DARK_ROLES.primary.hover, KIT_DARK_ROLES.primary.text] as ThemeShade[]
	const result = createPalette(primaryDark, fill, 'dark')
	const shades = Object.fromEntries([text, hover, fill].map(shade => [shade, result.shades[shade]]))
	return { vars: paletteVars('primary', shades), adjusted: result.adjusted }
}

/** Тонированный фон светлой темы чуть темнее белого: если бренд на нём не берёт 4.5:1, фон — белый */
function fitNeutral(neutral: ThemeNeutralPalette, main: string): ThemeNeutralPalette {
	return contrastRatio(main, neutral[0]) < TEXT_CONTRAST ? { ...neutral, 0: WHITE } : neutral
}

function colorSeeds(input: ThemeInput): ThemeColorSeeds {
	const ready = input.palettes?.primary
	const primary = ready ? null : createPalette(input.primary)
	const main = ready ? ready[KIT_MAIN_SHADES.primary] : (primary as ThemePaletteResult).main
	const neutral = input.palettes?.neutral ?? fitNeutral(createNeutralPalette(input.neutral ?? 'tinted', input.primary), main)
	const roles = roleVars(input, neutral)
	const dark = darkPrimaryVars(input.primaryDark)
	return {
		vars: {
			...(primary ? generatedVars('primary', primary, neutral) : paletteVars('primary', ready as Record<number, string>)),
			...paletteVars('neutral', neutral),
			...roles.vars,
		},
		darkVars: { ...dark.vars, ...roles.darkVars },
		adjusted: Boolean(primary?.adjusted) || dark.adjusted,
	}
}

function named<T extends string>(value: T | number | undefined, table: Record<T, number>): number | undefined {
	return typeof value === 'number' ? value : value && table[value]
}

function shapeVars(input: ThemeInput): Vars {
	const vars: Vars = {}
	const radius = named(input.radius, RADIUS)
	const density = named(input.density, DENSITY)
	const shadows = named(input.shadows, SHADOWS)
	if (radius !== undefined) vars['--rise-radius'] = `${radius}px`
	if (density !== undefined) vars['--rise-density'] = String(density)
	if (shadows !== undefined) vars['--rise-shadow-strength'] = String(shadows)
	return vars
}

function fontVars(font: ThemeFonts = {}): Vars {
	const vars: Vars = {}
	if (font.sans) vars['--rise-font-sans'] = font.sans
	const heading = font.heading ?? font.sans
	if (heading) vars['--rise-font-heading'] = heading
	if (font.mono) vars['--rise-font-mono'] = font.mono
	return vars
}

function motionVars(motion: ThemeMotion | undefined): Vars {
	if (!motion) return {}
	const [fast, base, slow, ease] = MOTION[motion]
	return { [DURATIONS[0]]: fast, [DURATIONS[1]]: base, [DURATIONS[2]]: slow, '--rise-ease': ease }
}

function block(selector: string, vars: Vars): string {
	return `${selector} {\n${Object.entries(vars)
		.map(([name, value]) => `\t${name}: ${value};`)
		.join('\n')}\n}`
}

function media(query: string, css: string): string {
	return `@media ${query} {\n${css.replace(/^/gm, '\t')}\n}`
}

function themeCss(selector: string, vars: Vars, darkVars: Vars): string {
	const parts = [block(selector, vars)]
	if (Object.keys(darkVars).length) {
		parts.push(block(`${selector}[data-theme='dark']`, darkVars))
		parts.push(media('(prefers-color-scheme: dark)', block(`${selector}[data-theme='system']`, darkVars)))
	}
	if (DURATIONS.some(name => name in vars)) {
		const reduced = Object.fromEntries(DURATIONS.map(name => [name, REDUCED_DURATION]))
		parts.push(media('(prefers-reduced-motion: reduce)', block(selector, reduced)))
	}
	return parts.join('\n')
}

function sanitize(vars: Vars): Vars {
	return Object.fromEntries(Object.entries(vars).map(([name, value]) => [name, safeValue(value)]))
}

/**
 * Тема из нескольких входов: палитра бренда в OKLCH с гарантией контраста WCAG AA, нейтраль, форма, плотность, шрифты,
 * тени, движение. Вывод — только литералы сидов на `[data-rise-theme="name"][data-rise-theme]` (сильнее `:root` кита
 * при любом порядке подключения); семантику кит пересчитывает сам на `[data-theme]`. Не заданный вход не выводится —
 * значение наследуется от кита или `:root` приложения. Чистая функция: работает в SSR, Node и тестах.
 *
 * @example
 * const theme = createTheme({ name: 'brand', primary: '#0f766e', radius: 'lg' })
 * applyTheme(theme) // или вставить theme.css в CSS приложения без JS
 */
export function createTheme(input: ThemeInput): Theme {
	const name = themeName(input.name)
	const colors = colorSeeds(input)
	const vars = sanitize({ ...colors.vars, ...shapeVars(input), ...fontVars(input.font), ...motionVars(input.motion), ...input.tokens })
	const darkVars = sanitize(colors.darkVars)
	const selector = `[data-rise-theme='${name}'][data-rise-theme]`
	return {
		name,
		css: themeCss(selector, vars, darkVars),
		vars,
		darkVars,
		contrast: themeContrast(vars, darkVars),
		adjusted: colors.adjusted,
	}
}
