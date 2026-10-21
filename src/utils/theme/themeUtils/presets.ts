/** Утилиты: палитры кита, роли в светлой и тёмной теме и готовые темы — `rise` (вид кита), `corporate`, `playful`, `minimal` */

import type {
	ThemeDarkRole,
	ThemeInput,
	ThemeNeutralPalette,
	ThemePalette,
	ThemePresetName,
	ThemeRole,
	ThemeShade,
} from './types/themeUtils.types'

/** Палитры кита дословно по `src/styles/_tokens.scss`; тест сверяет их с файлом */
export const KIT_PALETTES: Record<ThemeRole, ThemePalette> & { neutral: ThemeNeutralPalette } = {
	primary: {
		50: '#fff3eb',
		100: '#ffe6d5',
		200: '#ffc9a8',
		300: '#ffa470',
		400: '#ff8243',
		500: '#ff6a1f',
		600: '#ee5410',
		700: '#c4400a',
		800: '#9a2f07',
		900: '#7a2608',
		950: '#431204',
	},
	neutral: {
		0: '#ffffff',
		50: '#f5f6f9',
		100: '#eceef3',
		200: '#e1e4ea',
		300: '#cdd2dc',
		400: '#9aa2b4',
		500: '#7e869a',
		600: '#5b6276',
		700: '#414859',
		800: '#2a2f3d',
		900: '#171a24',
		950: '#0b0d14',
	},
	success: {
		50: '#e8f8f0',
		100: '#d3f2e2',
		200: '#a7e3c5',
		300: '#6fd3a2',
		400: '#2fbf7e',
		500: '#12a666',
		600: '#0b7f4e',
		700: '#086b41',
		800: '#065a37',
		900: '#054a2e',
		950: '#032a1a',
	},
	info: {
		50: '#eef3ff',
		100: '#dde6ff',
		200: '#bccdff',
		300: '#8eabff',
		400: '#6a8dff',
		500: '#4f75ff',
		600: '#2a55f0',
		700: '#2143c4',
		800: '#1c3596',
		900: '#1a2e73',
		950: '#111c45',
	},
	warning: {
		50: '#fff6e0',
		100: '#ffebb8',
		200: '#ffd98a',
		300: '#ffc457',
		400: '#ffb224',
		500: '#e89a00',
		600: '#c77300',
		700: '#a85c00',
		800: '#7a4300',
		900: '#5e3400',
		950: '#361d00',
	},
	error: {
		50: '#ffeef0',
		100: '#ffdce0',
		200: '#ffb8c1',
		300: '#ff9da9',
		400: '#ff7a8a',
		500: '#ff5468',
		600: '#dc1f37',
		700: '#b9152b',
		800: '#9b0f22',
		900: '#7a0c1b',
		950: '#45060e',
	},
}

/**
 * Шаг заливки роли `--rise-<роль>` (`$role-fills` в `_tokens.scss`) — один и тот же в светлой и тёмной теме: на нём светлый
 * текст (нейтраль 50) берёт 4.5:1. Наведение — следующий шаг, темнее. Генератор тем ставит сюда цвет роли
 */
export const KIT_MAIN_SHADES: Record<ThemeRole, ThemeShade> = { primary: 700, success: 600, info: 600, warning: 700, error: 600 }

/**
 * Роли кита в тёмной теме (`$dark-roles` в `_tokens.scss`): яркий цвет роли для мягкого фона и рамки (`tint`) и текст роли —
 * шаг палитры, смесь двух шагов `[шаг, доля %, шаг]` или литерал HEX (цвет макета ярче любой смеси шагов). Заливка, наведение
 * и текст на заливке — как в светлой теме (`KIT_MAIN_SHADES`).
 */
export const KIT_DARK_ROLES: Record<ThemeRole, ThemeDarkRole> = {
	primary: { tint: 500, text: 300 },
	success: { tint: '#2fd08a', text: '#7fe6b8' },
	info: { tint: 400, text: [200, 59, 300] },
	warning: { tint: 400, text: [400, 54, 50] },
	error: { tint: 500, text: 300 },
}

const KIT_FONT_SANS = "'Rise Grotesk', sans-serif"
const KIT_FONT_MONO = "'Rise Mono', monospace"

/**
 * Готовые темы: `rise` — вид кита (палитры как есть, генератор не используется), `corporate` — админки и таблицы,
 * `playful` — потребительские приложения, `minimal` — инструменты и документация. Шрифты — только шрифты кита
 * (Rise Grotesk, Rise Mono), скругления — без пилюль. Тема — `createTheme(THEME_PRESETS.corporate)`.
 */
export const THEME_PRESETS: Record<ThemePresetName, ThemeInput> = {
	rise: {
		name: 'rise',
		primary: '#ee5410',
		neutral: 'gray',
		palettes: KIT_PALETTES,
		radius: 'md',
		density: 'default',
		font: { sans: KIT_FONT_SANS, heading: KIT_FONT_SANS, mono: KIT_FONT_MONO },
		shadows: 'default',
		motion: 'standard',
	},
	corporate: {
		name: 'corporate',
		primary: '#1d4ed8',
		neutral: '#64748b',
		radius: 'sm',
		density: 'compact',
		shadows: 'soft',
		motion: 'subtle',
	},
	playful: {
		name: 'playful',
		primary: '#7c3aed',
		neutral: 'tinted',
		radius: 'lg',
		density: 'comfortable',
		shadows: 'strong',
		motion: 'expressive',
	},
	minimal: {
		name: 'minimal',
		primary: '#18181b',
		primaryDark: '#e4e4e7',
		neutral: 'gray',
		radius: 'none',
		density: 'default',
		font: { sans: KIT_FONT_MONO, heading: KIT_FONT_MONO, mono: KIT_FONT_MONO },
		shadows: 'none',
		motion: 'none',
	},
}
