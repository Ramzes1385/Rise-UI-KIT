import { adjacentShade } from '../palette'
import { describe, expect, it } from 'vitest'
import { THEME_ROLES } from '../types/themeUtils.types'
import { scssDarkTints, scssRoleFills, scssValue } from './kitTokens'
import { KIT_DARK_ROLES, KIT_MAIN_SHADES, KIT_PALETTES } from '../presets'
import { darkPageBackground, darkRoleTints, KIT_CODE_COLORS, resolveThemeColors, THEME_CONTRAST_PAIRS, themeContrast } from '../contrast'

describe('THEME_CONTRAST_PAIRS', () => {
	it('набор пар как в check-contrast.mjs: 25 общих, 36 подсветки кода, по 8 на каждую из 5 ролей', () => {
		expect(THEME_CONTRAST_PAIRS).toHaveLength(25 + 36 + 40)
		expect(THEME_CONTRAST_PAIRS.filter(pair => pair.informational)).toHaveLength(3 + 5)
	})

	it('пороги — 4.5 для текста и 3 для графики', () => {
		expect(new Set(THEME_CONTRAST_PAIRS.map(pair => pair.min))).toEqual(new Set([4.5, 3]))
		expect(THEME_CONTRAST_PAIRS.find(pair => pair.kind === 'focus-ring')?.min).toBe(3)
		expect(THEME_CONTRAST_PAIRS.filter(pair => pair.kind === 'control-border').map(pair => pair.min)).toEqual([3, 3, 3])
		expect(THEME_CONTRAST_PAIRS.find(pair => pair.kind === 'role-graphic-bg')?.min).toBe(3)
	})

	it('текст на заливке роли — обязательная пара 4.5:1 и к заливке, и к наведению; кольцо фокуса — к трём фонам', () => {
		for (const role of THEME_ROLES) {
			const on = THEME_CONTRAST_PAIRS.filter(pair => pair.fg === `--rise-on-${role}`)
			expect(on.map(pair => [pair.bg, pair.min, Boolean(pair.informational)])).toEqual([
				[`--rise-${role}`, 4.5, false],
				[`--rise-${role}-hover`, 4.5, false],
			])
		}
		const ring = THEME_CONTRAST_PAIRS.filter(pair => pair.kind === 'focus-ring').map(pair => pair.bg)
		expect(ring).toEqual(['--rise-bg', '--rise-bg-muted', '--rise-bg-elevated'])
	})
})

describe('таблицы ролей кита', () => {
	it('KIT_MAIN_SHADES — шаги заливки $role-fills в _tokens.scss, наведение — следующий шаг', () => {
		const fills = scssRoleFills()
		expect(Object.keys(fills)).toEqual([...THEME_ROLES])
		for (const role of THEME_ROLES)
			expect(fills[role]).toEqual({ fill: KIT_MAIN_SHADES[role], hover: adjacentShade(KIT_MAIN_SHADES[role], 1) })
		expect(KIT_MAIN_SHADES).toEqual({ primary: 700, success: 600, info: 600, warning: 700, error: 600 })
	})

	it('яркий тон тёмной темы в KIT_DARK_ROLES — как tint в $dark-roles', () => {
		const tints = scssDarkTints()
		for (const role of THEME_ROLES) expect(tints[role]).toBe(String(KIT_DARK_ROLES[role].tint))
	})
})

describe('KIT_CODE_COLORS', () => {
	it.each(['light', 'dark'] as const)('совпадают с --rise-code-* в _tokens.scss (%s)', mode => {
		for (const [token, color] of Object.entries(KIT_CODE_COLORS[mode]))
			expect(scssValue(`${mode}-tokens`, `--rise-code-${token}`)).toBe(color)
	})
})

describe('resolveThemeColors', () => {
	it('без сидов светлый режим — семантика кита: заливки 700/600, наведение на шаг темнее, текст на заливке — нейтраль 50', () => {
		const colors = resolveThemeColors({}, 'light')
		expect(colors['--rise-bg']).toBe('#ffffff')
		expect(colors['--rise-primary']).toBe('#c4400a')
		expect(colors['--rise-primary-hover']).toBe('#9a2f07')
		expect(colors['--rise-on-primary']).toBe('#f5f6f9')
		expect(colors['--rise-warning']).toBe('#a85c00')
		expect(colors['--rise-warning-hover']).toBe('#7a4300')
		expect(colors['--rise-info']).toBe('#2a55f0')
		expect(colors['--rise-info-hover']).toBe('#2143c4')
		expect(colors['--rise-on-info']).toBe('#f5f6f9')
		expect(colors['--rise-focus-ring']).toBe('#c4400a')
		expect(colors['--rise-text']).toBe(KIT_PALETTES.neutral[800])
		expect(colors['--rise-border-control']).toBe('#7e869a')
		expect(colors['--rise-surface-raised']).toBe('#ffffff')
	})

	it('тёмный режим — заливки и текст на них как в светлом, уровни фона смесью шагов, мягкие фоны — яркий тон 14% и 20% с фоном', () => {
		const colors = resolveThemeColors({}, 'dark')
		expect(colors['--rise-bg']).toBe('#08090f')
		expect(colors['--rise-bg-muted']).toBe('#10121a')
		expect(colors['--rise-surface-raised']).toBe('#1b1e29')
		expect(colors['--rise-primary']).toBe('#c4400a')
		expect(colors['--rise-primary-hover']).toBe('#9a2f07')
		expect(colors['--rise-on-primary']).toBe('#f5f6f9')
		expect(colors['--rise-primary-soft']).toBe('#2b1711')
		expect(colors['--rise-primary-soft-hover']).toBe('#391c12')
		expect(colors['--rise-success']).toBe('#0b7f4e')
		expect(colors['--rise-success-soft']).toBe('#0d2520')
		expect(colors['--rise-info-text']).toBe('#a9bfff')
		expect(colors['--rise-text-highlighted']).toBe('#f5f6f9')
		expect(colors['--rise-focus-ring']).toBe('#c4400a')
	})

	it('сиды темы заменяют палитры кита; текст на заливке и наведение — сиды в обоих режимах', () => {
		expect(resolveThemeColors({ '--rise-color-primary-700': '#7c3aed' }, 'light')['--rise-primary']).toBe('#7c3aed')
		expect(resolveThemeColors({ '--rise-color-primary-700': '#7c3aed' }, 'dark')['--rise-primary']).toBe('#7c3aed')
		const seeds = { '--rise-color-primary-on': '#0b0d14', '--rise-color-primary-hover': '#ff6a1f' }
		for (const mode of ['light', 'dark'] as const) {
			expect(resolveThemeColors(seeds, mode)['--rise-on-primary']).toBe('#0b0d14')
			expect(resolveThemeColors(seeds, mode)['--rise-primary-hover']).toBe('#ff6a1f')
		}
	})

	it('мягкий фон тёмного режима — от яркого тона роли, а не от заливки; литерал мягкого фона из darkVars сильнее', () => {
		const filled = resolveThemeColors({ '--rise-success': '#22c55e' }, 'dark')
		expect(filled['--rise-success']).toBe('#22c55e')
		expect(filled['--rise-success-soft']).toBe('#0d2520')
		expect(resolveThemeColors({ '--rise-success-soft': '#0c231a' }, 'dark')['--rise-success-soft']).toBe('#0c231a')
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
		const rows = themeContrast({}, { '--rise-color-primary-700': '#ffffff' })
		const fill = (mode: string): string | undefined =>
			rows.find(row => row.mode === mode && row.kind === 'on-role' && row.bg === '--rise-primary')?.bgColor
		expect(fill('dark')).toBe('#ffffff')
		expect(fill('light')).toBe('#c4400a')
	})

	it('текст на заливке и наведении — светлый и проходит 4.5:1 у всех ролей в обоих режимах', () => {
		const rows = themeContrast({}).filter(row => row.kind === 'on-role' || row.kind === 'on-role-hover')
		expect(rows).toHaveLength(THEME_ROLES.length * 2 * 2)
		for (const row of rows) {
			expect(row.fgColor).toBe('#f5f6f9')
			expect(row.ratio).toBeGreaterThanOrEqual(4.5)
		}
	})

	it('провал отмечается ok: false и контраст округляется до сотых', () => {
		const row = themeContrast({ '--rise-color-neutral-800': '#bbbbbb' }).find(
			item => item.fg === '--rise-text' && item.bg === '--rise-bg',
		)
		expect(row?.ok).toBe(false)
		expect(row?.ratio).toBe(1.92)
	})
})

describe('darkPageBackground и darkRoleTints', () => {
	it('фон тёмной темы — нейтраль 950 с чёрным 73 %, как --rise-bg в dark-tokens', () => {
		expect(darkPageBackground(KIT_PALETTES.neutral[950])).toBe(resolveThemeColors({}, 'dark')['--rise-bg'])
	})

	it('мягкий фон, наведение и рамка — смеси яркого тона с фоном 14, 20 и 35 %', () => {
		expect(darkRoleTints('info', '#ffffff', '#000000')).toEqual({
			'--rise-info-soft': '#242424',
			'--rise-info-soft-hover': '#333333',
			'--rise-info-border': '#595959',
		})
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
