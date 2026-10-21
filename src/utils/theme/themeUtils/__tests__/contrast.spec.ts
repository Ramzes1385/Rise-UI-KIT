import { scssValue } from './kitTokens'
import { KIT_PALETTES } from '../presets'
import { describe, expect, it } from 'vitest'
import { KIT_CODE_COLORS, resolveThemeColors, THEME_CONTRAST_PAIRS, themeContrast } from '../contrast'

describe('THEME_CONTRAST_PAIRS', () => {
	it('набор пар как в check-contrast.mjs: 24 общих, 36 подсветки кода, по 8 на каждую из 5 ролей', () => {
		expect(THEME_CONTRAST_PAIRS).toHaveLength(24 + 36 + 40)
		expect(THEME_CONTRAST_PAIRS.filter(pair => pair.informational)).toHaveLength(3 + 5)
	})

	it('пороги — 4.5 для текста и 3 для графики', () => {
		expect(new Set(THEME_CONTRAST_PAIRS.map(pair => pair.min))).toEqual(new Set([4.5, 3]))
		expect(THEME_CONTRAST_PAIRS.find(pair => pair.kind === 'focus-ring')?.min).toBe(3)
		expect(THEME_CONTRAST_PAIRS.filter(pair => pair.kind === 'control-border').map(pair => pair.min)).toEqual([3, 3, 3])
		expect(THEME_CONTRAST_PAIRS.find(pair => pair.kind === 'role-graphic-bg')?.min).toBe(3)
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
		expect(colors['--rise-primary']).toBe('#ee5410')
		expect(colors['--rise-primary-hover']).toBe('#ff6a1f')
		expect(colors['--rise-on-primary']).toBe('#0b0d14')
		expect(colors['--rise-info']).toBe('#2a55f0')
		expect(colors['--rise-info-hover']).toBe('#2143c4')
		expect(colors['--rise-on-info']).toBe('#ffffff')
		expect(colors['--rise-focus-ring']).toBe('#ee5410')
		expect(colors['--rise-text']).toBe(KIT_PALETTES.neutral[800])
		expect(colors['--rise-border-control']).toBe('#7e869a')
		expect(colors['--rise-surface-raised']).toBe('#ffffff')
	})

	it('тёмный режим — таблица тёмных ролей, уровни фона смесью шагов, мягкие фоны смесью 14% и 20% с фоном', () => {
		const colors = resolveThemeColors({}, 'dark')
		expect(colors['--rise-bg']).toBe('#08090f')
		expect(colors['--rise-bg-muted']).toBe('#10121a')
		expect(colors['--rise-surface-raised']).toBe('#1b1e29')
		expect(colors['--rise-primary']).toBe('#ff6a1f')
		expect(colors['--rise-primary-hover']).toBe('#ff8243')
		expect(colors['--rise-on-primary']).toBe('#0b0d14')
		expect(colors['--rise-primary-soft']).toBe('#2b1711')
		expect(colors['--rise-primary-soft-hover']).toBe('#391c12')
		expect(colors['--rise-success']).toBe('#2fd08a')
		expect(colors['--rise-info-text']).toBe('#a9bfff')
		expect(colors['--rise-text-highlighted']).toBe('#f5f6f9')
	})

	it('сиды темы заменяют палитры кита и таблицу светлых ролей', () => {
		expect(resolveThemeColors({ '--rise-color-primary-600': '#7c3aed' }, 'light')['--rise-primary']).toBe('#7c3aed')
		const seeded = resolveThemeColors({ '--rise-color-primary-on': '#ffffff', '--rise-color-primary-hover': '#5b21b6' }, 'light')
		expect(seeded['--rise-on-primary']).toBe('#ffffff')
		expect(seeded['--rise-primary-hover']).toBe('#5b21b6')
		expect(resolveThemeColors({ '--rise-color-primary-on': '#ffffff' }, 'dark')['--rise-on-primary']).toBe('#0b0d14')
	})

	it('литерал тёмной роли из darkVars сильнее таблицы, мягкий фон считается от него', () => {
		const colors = resolveThemeColors({ '--rise-success': '#22c55e' }, 'dark')
		expect(colors['--rise-success']).toBe('#22c55e')
		expect(colors['--rise-success-soft']).toBe('#0c231a')
	})

	it('семантический токен литералом HEX из входа tokens сильнее вычисленного; не HEX — не учитывается', () => {
		const colors = resolveThemeColors({ '--rise-bg': '#fafaf9', '--rise-text': 'var(--x)' }, 'light')
		expect(colors['--rise-bg']).toBe('#fafaf9')
		expect(colors['--rise-text']).toBe(KIT_PALETTES.neutral[800])
	})
})

describe('themeContrast', () => {
	it('кит без сидов проходит все обязательные пары в обоих режимах', () => {
		const rows = themeContrast({})
		expect(rows).toHaveLength(THEME_CONTRAST_PAIRS.length * 2)
		expect(rows.filter(row => !row.ok && !row.informational)).toEqual([])
	})

	it('сиды тёмного режима действуют только в тёмном', () => {
		const rows = themeContrast({}, { '--rise-color-primary-500': '#ffffff' })
		const fill = (mode: string): string | undefined =>
			rows.find(row => row.mode === mode && row.kind === 'on-role' && row.bg === '--rise-primary')?.bgColor
		expect(fill('dark')).toBe('#ffffff')
		expect(fill('light')).toBe('#ee5410')
	})

	it('провал отмечается ok: false и контраст округляется до сотых', () => {
		const row = themeContrast({ '--rise-color-neutral-800': '#bbbbbb' }).find(
			item => item.fg === '--rise-text' && item.bg === '--rise-bg',
		)
		expect(row?.ok).toBe(false)
		expect(row?.ratio).toBe(1.92)
	})
})

describe('resolveThemeColors: уровни поверхностей и рамки контролов', () => {
	const LEVELS = ['--rise-surface-raised', '--rise-border-control', '--rise-bg-elevated', '--rise-bg-muted'] as const

	it.each(['light', 'dark'] as const)('каждый уровень объявлен в %s-tokens кита и в теме', mode => {
		const colors = resolveThemeColors({}, mode)
		for (const token of LEVELS) {
			expect(colors[token]).toMatch(/^#[0-9a-f]{6}$/)
			expect(scssValue(`${mode}-tokens`, token)).toBeDefined()
		}
		for (const token of ['--rise-surface-floating', '--rise-surface-dialog', '--rise-field-bg-floating'])
			expect(scssValue(`${mode}-tokens`, token)).toBeDefined()
	})

	it('в светлом режиме поднятая поверхность и рамка контрола — шаги 0 и 500 нейтрали кита', () => {
		const colors = resolveThemeColors({}, 'light')
		expect(scssValue('light-tokens', '--rise-surface-raised')).toBe("#{palette('neutral', 0)}")
		expect(colors['--rise-surface-raised']).toBe(KIT_PALETTES.neutral[0])
		expect(scssValue('light-tokens', '--rise-border-control')).toBe("#{palette('neutral', 500)}")
		expect(colors['--rise-border-control']).toBe(KIT_PALETTES.neutral[500])
	})

	it('в тёмном режиме поднятая поверхность светлее подложки, а рамка контрола светлее поверхности', () => {
		const colors = resolveThemeColors({}, 'dark')
		const luma = (hex: string): number => parseInt(hex.slice(1, 3), 16) + parseInt(hex.slice(3, 5), 16) + parseInt(hex.slice(5, 7), 16)
		expect(luma(colors['--rise-surface-raised'])).toBeGreaterThan(luma(colors['--rise-bg-elevated']))
		expect(luma(colors['--rise-border-control'])).toBeGreaterThan(luma(colors['--rise-surface-raised']))
	})

	it('сид нейтрали переносится в поднятую поверхность и рамку контрола', () => {
		const seeds = { '--rise-color-neutral-0': '#fefce8', '--rise-color-neutral-500': '#6b7280' }
		const colors = resolveThemeColors(seeds, 'light')
		expect(colors['--rise-surface-raised']).toBe('#fefce8')
		expect(colors['--rise-border-control']).toBe('#6b7280')
	})
})
