import { scssValue } from './kitTokens'
import { KIT_PALETTES } from '../presets'
import { describe, expect, it } from 'vitest'
import { KIT_CODE_COLORS, resolveThemeColors, THEME_CONTRAST_PAIRS, themeContrast } from '../contrast'

describe('THEME_CONTRAST_PAIRS', () => {
	it('набор пар как в check-contrast.mjs: 16 общих, 36 подсветки кода, по 7 на каждую из 5 ролей', () => {
		expect(THEME_CONTRAST_PAIRS).toHaveLength(16 + 36 + 35)
		expect(THEME_CONTRAST_PAIRS.filter(pair => pair.informational)).toHaveLength(3 + 5)
	})

	it('пороги — 4.5 для текста и 3 для графики', () => {
		expect(new Set(THEME_CONTRAST_PAIRS.map(pair => pair.min))).toEqual(new Set([4.5, 3]))
		expect(THEME_CONTRAST_PAIRS.find(pair => pair.kind === 'focus-ring')?.min).toBe(3)
	})
})

describe('KIT_CODE_COLORS', () => {
	it.each(['light', 'dark'] as const)('совпадают с --rise-code-* в _tokens.scss (%s)', mode => {
		for (const [token, color] of Object.entries(KIT_CODE_COLORS[mode]))
			expect(scssValue(`${mode}-tokens`, `--rise-code-${token}`)).toBe(color)
	})
})

describe('resolveThemeColors', () => {
	it('без сидов светлый режим — семантика кита', () => {
		const colors = resolveThemeColors({}, 'light')
		expect(colors['--rise-bg']).toBe('#ffffff')
		expect(colors['--rise-primary']).toBe('#c2410c')
		expect(colors['--rise-primary-hover']).toBe('#9a3412')
		expect(colors['--rise-info']).toBe('#2563eb')
		expect(colors['--rise-on-primary']).toBe('#ffffff')
		expect(colors['--rise-focus-ring']).toBe('#c2410c')
		expect(colors['--rise-text']).toBe(KIT_PALETTES.neutral[700])
	})

	it('тёмный режим — 400/300 и мягкие фоны смесью 12% и 18% с фоном', () => {
		const colors = resolveThemeColors({}, 'dark')
		expect(colors['--rise-bg']).toBe('#18181b')
		expect(colors['--rise-primary']).toBe('#fb923c')
		expect(colors['--rise-primary-hover']).toBe('#fdba74')
		expect(colors['--rise-on-primary']).toBe('#09090b')
		expect(colors['--rise-primary-soft']).toBe('#33271f')
		expect(colors['--rise-primary-soft-hover']).toBe('#412e21')
		expect(colors['--rise-text-highlighted']).toBe('#ffffff')
	})

	it('сиды темы заменяют палитры кита', () => {
		expect(resolveThemeColors({ '--rise-color-primary-700': '#7c3aed' }, 'light')['--rise-primary']).toBe('#7c3aed')
	})

	it('семантический токен литералом HEX из входа tokens сильнее вычисленного; не HEX — не учитывается', () => {
		const colors = resolveThemeColors({ '--rise-bg': '#fafaf9', '--rise-text': 'var(--x)' }, 'light')
		expect(colors['--rise-bg']).toBe('#fafaf9')
		expect(colors['--rise-text']).toBe(KIT_PALETTES.neutral[700])
	})
})

describe('themeContrast', () => {
	it('кит без сидов проходит все обязательные пары в обоих режимах', () => {
		const rows = themeContrast({})
		expect(rows).toHaveLength(THEME_CONTRAST_PAIRS.length * 2)
		expect(rows.filter(row => !row.ok && !row.informational)).toEqual([])
	})

	it('сиды тёмного режима действуют только в тёмном', () => {
		const rows = themeContrast({}, { '--rise-color-primary-400': '#ffffff' })
		const fill = (mode: string): string | undefined =>
			rows.find(row => row.mode === mode && row.kind === 'on-role' && row.bg === '--rise-primary')?.bgColor
		expect(fill('dark')).toBe('#ffffff')
		expect(fill('light')).toBe('#c2410c')
	})

	it('провал отмечается ok: false и контраст округляется до сотых', () => {
		const row = themeContrast({ '--rise-color-neutral-700': '#bbbbbb' }).find(
			item => item.fg === '--rise-text' && item.bg === '--rise-bg',
		)
		expect(row?.ok).toBe(false)
		expect(row?.ratio).toBe(1.92)
	})
})
