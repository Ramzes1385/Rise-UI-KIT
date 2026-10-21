/** Утилиты: тема из нескольких входов — сиды на `[data-rise-theme]`, CSS одной строкой и отчёт контраста */

import { THEME_ROLES } from './types/themeUtils.types'
import { contrastRatio } from '@utils/theme/oklchUtils'
import { KIT_DARK_ROLES, KIT_MAIN_SHADES } from './presets'
import { darkPageBackground, darkRoleTints, roleColor, themeContrast } from './contrast'
import { adjacentShade, createNeutralPalette, createPalette, createRolePalette, liftFill } from './palette'
import type {
	Theme,
	ThemeDarkRole,
	ThemeDensity,
	ThemeNeutralPalette,
	ThemeFonts,
	ThemeInput,
	ThemeMotion,
	ThemePalette,
	ThemePaletteResult,
	ThemePaletteText,
	ThemeRadius,
	ThemeRole,
	ThemeRoleContext,
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
/** Тёмная тема роли из сгенерированной палитры: литералы кита (у success) к чужому цвету роли не подходят */
const GENERATED_DARK_ROLE: ThemeDarkRole = { tint: 400, text: [200, 59, 300] }
/** Яркий тон и текст `primary` тёмной темы из `primaryDark` — шаги его палитры под тёмный текст, как у кита */
const DARK_TONE_SHADE = 500
const DARK_TEXT_SHADE = 300

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

/** Текст на заливках ролей темы: выбор `text` (по умолчанию светлый), светлый и тёмный — нейтраль 50 и 950 темы, фон поля — её 100 */
function roleContext(text: ThemePaletteText | undefined, neutral: ThemeNeutralPalette): ThemeRoleContext {
	return { on: { text: text ?? 'light', light: neutral[50], dark: neutral[950], field: neutral[100] }, neutral }
}

/**
 * Сиды текста на заливке (`--rise-color-<роль>-on`) и наведения (`-hover`) — только у тёмного текста: нейтраль 950 и шаг светлее.
 * Светлый текст (нейтраль 50 темы) и наведение на шаг темнее — умолчание кита, сиды не нужны
 */
function onVars(role: ThemeRole, palette: ThemePaletteResult, neutral: ThemeNeutralPalette): Vars {
	if (palette.on === 'light') return {}
	return {
		[`--rise-color-${role}-on`]: neutral[950],
		[`--rise-color-${role}-hover`]: palette.shades[adjacentShade(KIT_MAIN_SHADES[role], -1)],
	}
}

/**
 * Заливка со светлым текстом в тёмной теме: слишком тёмный цвет роли светлеет до 3:1 к поверхности тёмной темы
 * (`--rise-bg-elevated`, нейтраль 900), наведение — шаг темнее новой заливки; сиды шагов только тёмному режиму. Светлая
 * заливка под тёмный текст отделяется от тёмного фона сама
 */
function liftedFill(role: ThemeRole, palette: ThemePaletteResult, context: ThemeRoleContext): Vars {
	const fill = palette.on === 'light' ? liftFill(palette.main, context.on, context.neutral[900]) : palette.main
	if (fill === palette.main) return {}
	const shade = KIT_MAIN_SHADES[role]
	const hover = adjacentShade(shade, 1)
	const shades = createRolePalette(fill, shade, { ...context.on, text: 'light' }).shades
	return paletteVars(role, { [shade]: fill, [hover]: shades[hover] })
}

/** Тёмные цвета роли, которые в ките — литералы (success): мягкий фон, рамка и текст роли из сгенерированной палитры */
function generatedDarkVars(role: ThemeRole, shades: ThemePalette, neutral: ThemeNeutralPalette): Vars {
	const scheme = KIT_DARK_ROLES[role]
	const read = (_role: string, shade: number): string => shades[shade as ThemeShade]
	const vars: Vars = {}
	if (typeof scheme.tint === 'string') {
		const tint = roleColor(GENERATED_DARK_ROLE.tint, role, read)
		Object.assign(vars, darkRoleTints(role, tint, darkPageBackground(neutral[950])))
	}
	if (typeof scheme.text === 'string') vars[`--rise-${role}-text`] = roleColor(GENERATED_DARK_ROLE.text, role, read)
	return vars
}

/** Роль из HEX: палитра с цветом на шаге заливки, сиды тёмного текста, заливка тёмной темы и литералы её цветов (только тёмной) */
function generatedRole(role: ThemeRole, seed: string, context: ThemeRoleContext): ThemeColorSeeds {
	const palette = createRolePalette(seed, KIT_MAIN_SHADES[role], context.on)
	return {
		vars: { ...paletteVars(role, palette.shades), ...onVars(role, palette, context.neutral) },
		darkVars: { ...liftedFill(role, palette, context), ...generatedDarkVars(role, palette.shades, context.neutral) },
		adjusted: palette.adjusted,
	}
}

function roleVars(input: ThemeInput, context: ThemeRoleContext): ThemeColorSeeds {
	const seeds: ThemeColorSeeds = { vars: {}, darkVars: {}, adjusted: false }
	for (const role of THEME_ROLES.filter(item => item !== 'primary')) {
		const ready = input.palettes?.[role]
		const seed = input[role]
		if (ready) Object.assign(seeds.vars, paletteVars(role, ready))
		else if (seed) {
			const generated = generatedRole(role, seed, context)
			Object.assign(seeds.vars, generated.vars)
			Object.assign(seeds.darkVars, generated.darkVars)
		}
	}
	return seeds
}

/**
 * Свой бренд тёмного режима: заливка с текстом по `text` (светлый текст — заливка не темнее 3:1 к фону тёмной темы), сиды текста
 * и наведения тёмной темы; яркий тон (500) и текст роли (300) — из палитры бренда под тёмный текст, как у кита
 */
function darkPrimarySeeds(primaryDark: string, context: ThemeRoleContext): ThemeColorSeeds {
	const shade = KIT_MAIN_SHADES.primary
	const palette = createRolePalette(primaryDark, shade, context.on)
	const lifted = liftedFill('primary', palette, context)
	const isLight = palette.on === 'light'
	const fill = lifted[`--rise-color-primary-${shade}`] ?? palette.main
	const hover = lifted[`--rise-color-primary-${adjacentShade(shade, 1)}`] ?? palette.shades[adjacentShade(shade, isLight ? 1 : -1)]
	const tones = createPalette(primaryDark, DARK_TONE_SHADE, 'dark').shades
	return {
		vars: {},
		darkVars: {
			...paletteVars('primary', {
				[DARK_TEXT_SHADE]: tones[DARK_TEXT_SHADE],
				[DARK_TONE_SHADE]: tones[DARK_TONE_SHADE],
				[shade]: fill,
			}),
			'--rise-color-primary-on': isLight ? context.neutral[50] : context.neutral[950],
			'--rise-color-primary-hover': hover,
		},
		adjusted: fill !== palette.seed,
	}
}

/** Тонированный фон светлой темы чуть темнее белого: если бренд на нём не берёт 4.5:1, фон — белый */
function fitNeutral(neutral: ThemeNeutralPalette, main: string): ThemeNeutralPalette {
	return contrastRatio(main, neutral[0]) < TEXT_CONTRAST ? { ...neutral, 0: WHITE } : neutral
}

/** Нейтраль темы до подгонки фона под бренд: готовая палитра или генератор (`tinted` по умолчанию) */
function baseNeutral(input: ThemeInput): ThemeNeutralPalette {
	return input.palettes?.neutral ?? createNeutralPalette(input.neutral ?? 'tinted', input.primary)
}

function primarySeeds(input: ThemeInput, context: ThemeRoleContext): ThemeColorSeeds {
	const ready = input.palettes?.primary
	return ready ? { vars: paletteVars('primary', ready), darkVars: {}, adjusted: false } : generatedRole('primary', input.primary, context)
}

function colorSeeds(input: ThemeInput): ThemeColorSeeds {
	const base = baseNeutral(input)
	const context = roleContext(input.text, base)
	const primary = primarySeeds(input, context)
	const main = primary.vars[`--rise-color-primary-${KIT_MAIN_SHADES.primary}`]
	const neutral = input.palettes?.neutral ?? fitNeutral(base, main)
	const roles = roleVars(input, context)
	const dark = input.primaryDark ? darkPrimarySeeds(input.primaryDark, context) : primary
	return {
		vars: { ...primary.vars, ...paletteVars('neutral', neutral), ...roles.vars },
		darkVars: { ...dark.darkVars, ...roles.darkVars },
		adjusted: primary.adjusted || dark.adjusted,
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
