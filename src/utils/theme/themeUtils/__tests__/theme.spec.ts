import { createTheme } from '../theme'
import { describe, expect, it } from 'vitest'
import { scssPalettes, scssValue } from './kitTokens'
import { KIT_PALETTES, THEME_PRESETS } from '../presets'
import { darkPageBackground, darkRoleTints } from '../contrast'
import { contrastRatio, relativeLuminance } from '@utils/theme/oklchUtils'
import { THEME_MOTIONS, THEME_PRESET_NAMES } from '../types/themeUtils.types'
import { MOTION_PRESETS } from '@composables/app/useMotion/types/useMotion.types'

const luminance = (hex: string): number => relativeLuminance(hex)

const failures = (input: Parameters<typeof createTheme>[0]): string[] =>
	createTheme(input)
		.contrast.filter(row => !row.ok && !row.informational)
		.map(row => `${row.mode} ${row.fg} / ${row.bg} ${row.ratio}`)

describe('createTheme', () => {
	it('из одного цвета: палитра бренда на шаге заливки 700 и тонированная нейтраль; светлый текст — умолчание кита, без сидов', () => {
		const theme = createTheme({ name: 'brand', primary: '#0f766e' })
		expect(theme.name).toBe('brand')
		expect(theme.vars['--rise-color-primary-700']).toBe('#0f766e')
		expect(theme.vars['--rise-color-primary-on']).toBeUndefined()
		expect(theme.vars['--rise-color-primary-hover']).toBeUndefined()
		expect(theme.vars['--rise-color-neutral-0']).toBeDefined()
		expect(Object.keys(theme.vars)).toHaveLength(11 + 12)
		expect(theme.darkVars).toEqual({})
		expect(theme.adjusted).toBe(false)
		expect(theme.css.startsWith("[data-rise-theme='brand'][data-rise-theme] {\n\t--rise-color-primary-50: ")).toBe(true)
		expect(theme.css).not.toContain('@media')
	})

	it('имя приводится к строчной латинице с дефисами; пустое — theme', () => {
		expect(createTheme({ name: ' My Brand_2 ', primary: '#0f766e' }).name).toBe('my-brand-2')
		expect(createTheme({ name: 'Бренд', primary: '#0f766e' }).name).toBe('theme')
	})

	it('именованные форма, плотность и тени переводятся в сиды', () => {
		const { vars } = createTheme({ name: 'x', primary: '#0f766e', radius: 'full', density: 'compact', shadows: 'soft' })
		expect(vars['--rise-radius']).toBe('14px')
		expect(vars['--rise-density']).toBe('0.75')
		expect(vars['--rise-shadow-strength']).toBe('0.6')
	})

	it('числа — как есть: пиксели и множители', () => {
		const { vars } = createTheme({ name: 'x', primary: '#0f766e', radius: 0, density: 1.1, shadows: 2 })
		expect(vars['--rise-radius']).toBe('0px')
		expect(vars['--rise-density']).toBe('1.1')
		expect(vars['--rise-shadow-strength']).toBe('2')
	})

	it('шрифт заголовков по умолчанию — основной; моноширинный — отдельно', () => {
		expect(createTheme({ name: 'x', primary: '#0f766e', font: { sans: 'Golos' } }).vars['--rise-font-heading']).toBe('Golos')
		const { vars } = createTheme({ name: 'x', primary: '#0f766e', font: { heading: 'Nunito', mono: 'Fira Code' } })
		expect(vars['--rise-font-sans']).toBeUndefined()
		expect(vars['--rise-font-heading']).toBe('Nunito')
		expect(vars['--rise-font-mono']).toBe('Fira Code')
	})

	it('движение задаёт длительности и кривую, а prefers-reduced-motion их снова обнуляет', () => {
		const theme = createTheme({ name: 'x', primary: '#0f766e', motion: 'expressive' })
		expect(theme.vars['--rise-duration']).toBe('320ms')
		expect(theme.vars['--rise-ease']).toBe('cubic-bezier(0.34, 1.56, 0.64, 1)')
		expect(theme.css).toContain(
			"@media (prefers-reduced-motion: reduce) {\n\t[data-rise-theme='x'][data-rise-theme] {\n\t\t--rise-duration-fast: 0.01ms;\n\t\t--rise-duration: 0.01ms;\n\t\t--rise-duration-slow: 0.01ms;\n\t}\n}",
		)
	})

	it('имена движения темы совпадают с пресетами useMotion, а standard — значения кита', () => {
		expect(THEME_MOTIONS).toEqual([...MOTION_PRESETS])
		const theme = createTheme({ name: 'x', primary: '#0f766e', motion: 'standard' })
		expect(theme.vars['--rise-duration']).toBe('200ms')
		expect(theme.vars['--rise-ease']).toBe('cubic-bezier(0.2, 0.8, 0.2, 1)')
		expect(THEME_PRESETS.rise.motion).toBe('standard')
	})

	it('primaryDark даёт тёмному режиму заливку 700 со светлым текстом, наведение, яркий тон 500 и текст роли 300, включая system', () => {
		const theme = createTheme({ name: 'x', primary: '#18181b', primaryDark: '#fafafa' })
		const { darkVars, vars } = theme
		expect(Object.keys(darkVars)).toEqual([
			'--rise-color-primary-300',
			'--rise-color-primary-500',
			'--rise-color-primary-700',
			'--rise-color-primary-on',
			'--rise-color-primary-hover',
		])
		expect(darkVars['--rise-color-primary-500']).toBe('#fafafa')
		expect(darkVars['--rise-color-primary-on']).toBe(vars['--rise-color-neutral-50'])
		expect(contrastRatio(darkVars['--rise-color-primary-700'], darkVars['--rise-color-primary-on'])).toBeGreaterThanOrEqual(4.5)
		expect(contrastRatio(darkVars['--rise-color-primary-hover'], darkVars['--rise-color-primary-on'])).toBeGreaterThanOrEqual(4.5)
		expect(contrastRatio(darkVars['--rise-color-primary-700'], vars['--rise-color-neutral-900'])).toBeGreaterThanOrEqual(3)
		expect(luminance(darkVars['--rise-color-primary-hover'])).toBeLessThan(luminance(darkVars['--rise-color-primary-700']))
		expect(theme.css).toContain("[data-rise-theme='x'][data-rise-theme][data-theme='dark'] {")
		expect(theme.css).toContain(
			"@media (prefers-color-scheme: dark) {\n\t[data-rise-theme='x'][data-rise-theme][data-theme='system'] {",
		)
		expect(theme.adjusted).toBe(true)
	})

	it('primaryDark с тёмным текстом: светлая кнопка тёмного режима, наведение светлее, текст — нейтраль 950', () => {
		const { darkVars, vars } = createTheme({ name: 'x', primary: '#18181b', primaryDark: '#fafafa', text: 'dark' })
		expect(darkVars['--rise-color-primary-on']).toBe(vars['--rise-color-neutral-950'])
		expect(contrastRatio(darkVars['--rise-color-primary-700'], darkVars['--rise-color-primary-on'])).toBeGreaterThanOrEqual(4.5)
		expect(luminance(darkVars['--rise-color-primary-hover'])).toBeGreaterThan(luminance(darkVars['--rise-color-primary-700']))
	})

	it('тёмный бренд для тёмного режима светлеет до 3:1 к фону тёмной темы и отмечается adjusted', () => {
		const theme = createTheme({ name: 'x', primary: '#0f766e', primaryDark: '#000080' })
		expect(theme.adjusted).toBe(true)
		const fill = theme.darkVars['--rise-color-primary-700']
		expect(contrastRatio(fill, theme.vars['--rise-color-neutral-900'])).toBeGreaterThanOrEqual(3)
		expect(contrastRatio(fill, theme.darkVars['--rise-color-primary-on'])).toBeGreaterThanOrEqual(4.5)
		expect(contrastRatio(theme.darkVars['--rise-color-primary-500'], '#0b0d14')).toBeGreaterThanOrEqual(4.5)
	})

	it('цвета статусов из HEX — палитры на шагах заливки кита (600); без входа — не выводятся', () => {
		const { vars, darkVars } = createTheme({ name: 'x', primary: '#0f766e', info: '#0369a1', error: '#be123c' })
		expect(vars['--rise-color-info-600']).toBe('#0369a1')
		expect(vars['--rise-color-error-600']).toBe('#be123c')
		expect(vars['--rise-color-success-600']).toBeUndefined()
		expect(Object.keys(darkVars)).toEqual([
			'--rise-color-info-600',
			'--rise-color-info-700',
			'--rise-color-error-600',
			'--rise-color-error-700',
		])
	})

	it('тёмный бренд светлеет в тёмной теме до 3:1 к поверхности (нейтраль 900), наведение — шаг темнее; только тёмному режиму', () => {
		const { vars, darkVars } = createTheme({ name: 'x', primary: '#1d4ed8' })
		expect(vars['--rise-color-primary-700']).toBe('#1d4ed8')
		expect(Object.keys(darkVars)).toEqual(['--rise-color-primary-700', '--rise-color-primary-800'])
		const [fill, hover] = [darkVars['--rise-color-primary-700'], darkVars['--rise-color-primary-800']]
		expect(contrastRatio(fill, vars['--rise-color-neutral-900'])).toBeGreaterThanOrEqual(3)
		expect(contrastRatio(fill, vars['--rise-color-neutral-50'])).toBeGreaterThanOrEqual(4.5)
		expect(luminance(hover)).toBeLessThan(luminance(fill))
	})

	it('по умолчанию текст светлый: янтарный бренд темнеет до 4.5:1 с нейтралью 50 темы, наведение темнее, сидов нет', () => {
		const amber = createTheme({ name: 'x', primary: '#ee5410' })
		expect(amber.adjusted).toBe(true)
		expect(amber.vars['--rise-color-primary-700']).not.toBe('#ee5410')
		expect(contrastRatio(amber.vars['--rise-color-primary-700'], amber.vars['--rise-color-neutral-50'])).toBeGreaterThanOrEqual(4.5)
		expect(luminance(amber.vars['--rise-color-primary-800'])).toBeLessThan(luminance(amber.vars['--rise-color-primary-700']))
		expect(amber.vars['--rise-color-primary-on']).toBeUndefined()
	})

	it('text: dark — бренд как есть с тёмным текстом (нейтраль 950), наведение светлее; сиды -on и -hover', () => {
		const { vars, darkVars, adjusted } = createTheme({ name: 'x', primary: '#ee5410', text: 'dark' })
		expect(adjusted).toBe(false)
		expect(vars['--rise-color-primary-700']).toBe('#ee5410')
		expect(vars['--rise-color-primary-on']).toBe(vars['--rise-color-neutral-950'])
		expect(vars['--rise-color-primary-hover']).toBe(vars['--rise-color-primary-600'])
		expect(luminance(vars['--rise-color-primary-hover'])).toBeGreaterThan(luminance(vars['--rise-color-primary-700']))
		expect(darkVars).toEqual({})
	})

	it('text: auto — светлый текст, если бренд его держит, иначе тёмный; действует и на статусы из HEX', () => {
		expect(createTheme({ name: 'x', primary: '#1d4ed8', text: 'auto' }).vars['--rise-color-primary-on']).toBeUndefined()
		const { vars } = createTheme({ name: 'x', primary: '#ee5410', warning: '#f59e0b', text: 'auto' })
		expect(vars['--rise-color-primary-on']).toBe(vars['--rise-color-neutral-950'])
		expect(vars['--rise-color-warning-on']).toBe(vars['--rise-color-neutral-950'])
		expect(vars['--rise-color-warning-hover']).toBe(vars['--rise-color-warning-600'])
	})

	it('success из HEX: мягкий фон, рамка и текст роли тёмной темы (в ките — литералы) — из её палитры, только тёмному режиму', () => {
		const { vars, darkVars } = createTheme({ name: 'x', primary: '#0f766e', success: '#15803d' })
		const bg = darkPageBackground(vars['--rise-color-neutral-950'])
		expect(darkVars).toEqual({
			...darkRoleTints('success', vars['--rise-color-success-400'], bg),
			'--rise-success-text': expect.stringMatching(/^#[0-9a-f]{6}$/),
		})
		expect(vars['--rise-success']).toBeUndefined()
		expect(vars['--rise-color-success-600']).toBe('#15803d')
	})

	it('готовые палитры берутся как есть вместо генератора', () => {
		const { vars, adjusted } = createTheme({
			name: 'x',
			primary: '#ffff00',
			palettes: { primary: KIT_PALETTES.primary, warning: KIT_PALETTES.warning },
		})
		expect(adjusted).toBe(false)
		expect(vars['--rise-color-primary-700']).toBe('#c4400a')
		expect(vars['--rise-color-warning-700']).toBe('#a85c00')
		expect(vars['--rise-color-primary-on']).toBeUndefined()
	})

	it('tokens — поверх сгенерированного; значения без символов, которые ломают правило или тег style', () => {
		const theme = createTheme({
			name: 'x',
			primary: '#0f766e',
			tokens: { '--rise-button-radius': '999px', '--rise-radius': '1px} body{color:red</style>' },
		})
		expect(theme.vars['--rise-button-radius']).toBe('999px')
		expect(theme.vars['--rise-radius']).toBe('1px bodycolor:red/style')
		expect(theme.css).not.toMatch(/<|\}\s*body/)
	})

	it('если бренд не берёт 4.5:1 на тонированном фоне (светлая заливка под тёмный текст), фон светлой темы — белый', () => {
		expect(createTheme({ name: 'x', primary: '#00cc66', text: 'dark' }).vars['--rise-color-neutral-0']).toBe('#ffffff')
		expect(createTheme({ name: 'x', primary: '#00cc66' }).vars['--rise-color-neutral-0']).not.toBe('#ffffff')
		expect(createTheme({ name: 'x', primary: '#7c3aed' }).vars['--rise-color-neutral-0']).not.toBe('#ffffff')
	})

	it('из любого цвета — без провалов контраста; пример светлого бренда', () => {
		expect(failures({ name: 'x', primary: '#ffe600' })).toEqual([])
		expect(failures({ name: 'x', primary: '#ffe600', text: 'dark' })).toEqual([])
		expect(createTheme({ name: 'x', primary: '#ffe600' }).adjusted).toBe(true)
	})
})

describe('THEME_PRESETS', () => {
	it('четыре пресета, имя совпадает с ключом', () => {
		expect(Object.keys(THEME_PRESETS)).toEqual([...THEME_PRESET_NAMES])
		for (const name of THEME_PRESET_NAMES) expect(createTheme(THEME_PRESETS[name]).name).toBe(name)
	})

	it.each(THEME_PRESET_NAMES)('%s проходит все обязательные пары в светлом и тёмном режиме', name => {
		expect(failures(THEME_PRESETS[name])).toEqual([])
	})

	it('rise — палитры кита дословно по _tokens.scss', () => {
		const palettes = scssPalettes()
		expect(Object.keys(palettes)).toEqual(['primary', 'neutral', 'success', 'info', 'warning', 'error'])
		const { vars } = createTheme(THEME_PRESETS.rise)
		for (const [role, shades] of Object.entries(palettes)) {
			for (const [shade, color] of Object.entries(shades)) expect(vars[`--rise-color-${role}-${shade}`]).toBe(color)
		}
		expect(vars['--rise-color-neutral-0']).toBe('#ffffff')
	})

	it('rise — форма, шрифты и движение как в ките', () => {
		const { vars } = createTheme(THEME_PRESETS.rise)
		for (const token of [
			'--rise-radius',
			'--rise-font-sans',
			'--rise-font-mono',
			'--rise-duration-fast',
			'--rise-duration',
			'--rise-duration-slow',
			'--rise-ease',
		]) {
			expect(vars[token]).toBe(scssValue('static-tokens', token))
		}
		expect(vars['--rise-font-heading']).toBe(vars['--rise-font-sans'])
		expect(vars['--rise-density']).toBe('1')
		expect(vars['--rise-shadow-strength']).toBe('1')
	})

	it('minimal в тёмном режиме — кнопка из primaryDark со светлым текстом; яркий тон (мягкий фон) — сам primaryDark', () => {
		const { darkVars } = createTheme(THEME_PRESETS.minimal)
		expect(darkVars['--rise-color-primary-500']).toBe('#e4e4e7')
		expect(contrastRatio(darkVars['--rise-color-primary-700'], darkVars['--rise-color-primary-on'])).toBeGreaterThanOrEqual(4.5)
	})

	it('тексты на заливках пресетов — светлые: нейтраль 50 темы в обоих режимах', () => {
		for (const name of THEME_PRESET_NAMES) {
			const theme = createTheme(THEME_PRESETS[name])
			const on = theme.contrast.filter(row => row.kind === 'on-role')
			for (const row of on) expect(luminance(row.fgColor), `${name} ${row.mode} ${row.fg}`).toBeGreaterThan(0.85)
		}
	})

	it('шрифты пресетов — только шрифты кита, скругления — без пилюль', () => {
		for (const name of THEME_PRESET_NAMES) {
			const { font = {}, radius } = THEME_PRESETS[name]
			for (const stack of Object.values(font)) expect(stack).toMatch(/^'Rise (Grotesk|Mono)', (sans-serif|monospace)$/)
			expect(radius).not.toBe('full')
		}
		expect(Object.values(THEME_PRESETS.minimal.font ?? {})).toEqual([
			"'Rise Mono', monospace",
			"'Rise Mono', monospace",
			"'Rise Mono', monospace",
		])
	})
})
