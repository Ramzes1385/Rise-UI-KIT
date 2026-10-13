/** Утилиты: палитры кита и готовые темы — `rise` (вид кита), `corporate`, `playful`, `minimal` */

import type { ThemeInput, ThemeNeutralPalette, ThemePalette, ThemePresetName, ThemeRole } from './types/themeUtils.types'

/** Палитры кита дословно по `src/styles/_tokens.scss`; тест сверяет их с файлом */
export const KIT_PALETTES: Record<ThemeRole, ThemePalette> & { neutral: ThemeNeutralPalette } = {
	primary: {
		50: '#fff7ed',
		100: '#ffedd5',
		200: '#fed7aa',
		300: '#fdba74',
		400: '#fb923c',
		500: '#f97316',
		600: '#ea580c',
		700: '#c2410c',
		800: '#9a3412',
		900: '#7c2d12',
		950: '#431407',
	},
	neutral: {
		0: '#ffffff',
		50: '#fafafa',
		100: '#f4f4f5',
		200: '#e4e4e7',
		300: '#d4d4d8',
		400: '#a1a1aa',
		500: '#71717a',
		600: '#52525b',
		700: '#3f3f46',
		800: '#27272a',
		900: '#18181b',
		950: '#09090b',
	},
	success: {
		50: '#f0fdf4',
		100: '#dcfce7',
		200: '#bbf7d0',
		300: '#86efac',
		400: '#4ade80',
		500: '#22c55e',
		600: '#16a34a',
		700: '#15803d',
		800: '#166534',
		900: '#14532d',
		950: '#052e16',
	},
	info: {
		50: '#eff6ff',
		100: '#dbeafe',
		200: '#bfdbfe',
		300: '#93c5fd',
		400: '#60a5fa',
		500: '#3b82f6',
		600: '#2563eb',
		700: '#1d4ed8',
		800: '#1e40af',
		900: '#1e3a8a',
		950: '#172554',
	},
	warning: {
		50: '#fffbeb',
		100: '#fef3c7',
		200: '#fde68a',
		300: '#fcd34d',
		400: '#fbbf24',
		500: '#f59e0b',
		600: '#d97706',
		700: '#b45309',
		800: '#92400e',
		900: '#78350f',
		950: '#451a03',
	},
	error: {
		50: '#fef2f2',
		100: '#fee2e2',
		200: '#fecaca',
		300: '#fca5a5',
		400: '#f87171',
		500: '#ef4444',
		600: '#dc2626',
		700: '#b91c1c',
		800: '#991b1b',
		900: '#7f1d1d',
		950: '#450a0a',
	},
}

/** Главный оттенок роли в светлом режиме (`$light-main-shade` в `_tokens.scss`): заливка кнопки, текст роли */
export const KIT_MAIN_SHADES: Record<ThemeRole, 600 | 700> = { primary: 700, success: 700, info: 600, warning: 700, error: 600 }

const KIT_FONT_SANS = "'Inter Variable', 'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif"
const KIT_FONT_MONO = "'JetBrains Mono Variable', 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"

/**
 * Готовые темы: `rise` — вид кита (палитры как есть, генератор не используется), `corporate` — админки и таблицы,
 * `playful` — потребительские приложения, `minimal` — инструменты и документация. Тема — `createTheme(THEME_PRESETS.corporate)`.
 */
export const THEME_PRESETS: Record<ThemePresetName, ThemeInput> = {
	rise: {
		name: 'rise',
		primary: '#c2410c',
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
		font: { sans: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif' },
		shadows: 'soft',
		motion: 'subtle',
	},
	playful: {
		name: 'playful',
		primary: '#7c3aed',
		neutral: 'tinted',
		radius: 'full',
		density: 'comfortable',
		font: { heading: '"Nunito", system-ui, sans-serif' },
		shadows: 'strong',
		motion: 'expressive',
	},
	minimal: {
		name: 'minimal',
		primary: '#18181b',
		primaryDark: '#fafafa',
		neutral: 'gray',
		radius: 'none',
		density: 'default',
		font: {
			sans: 'ui-monospace, "JetBrains Mono", SFMono-Regular, Menlo, monospace',
			heading: 'ui-monospace, "JetBrains Mono", SFMono-Regular, Menlo, monospace',
		},
		shadows: 'none',
		motion: 'none',
	},
}
