import { createTheme } from '../theme'
import { describe, expect, it } from 'vitest'
import { scssPalettes, scssValue } from './kitTokens'
import { contrastRatio } from '@utils/theme/oklchUtils'
import { KIT_PALETTES, THEME_PRESETS } from '../presets'
import { THEME_PRESET_NAMES } from '../types/themeUtils.types'

const failures = (input: Parameters<typeof createTheme>[0]): string[] =>
	createTheme(input)
		.contrast.filter(row => !row.ok && !row.informational)
		.map(row => `${row.mode} ${row.fg} / ${row.bg} ${row.ratio}`)

describe('createTheme', () => {
	it('из одного цвета: палитра бренда и тонированная нейтраль, больше ничего', () => {
		const theme = createTheme({ name: 'brand', primary: '#0f766e' })
		expect(theme.name).toBe('brand')
		expect(theme.vars['--rise-color-primary-700']).toBe('#0f766e')
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

	it('primaryDark даёт оттенки 400 и 300 только тёмному режиму, включая system', () => {
		const theme = createTheme({ name: 'x', primary: '#18181b', primaryDark: '#fafafa' })
		expect(theme.darkVars).toEqual({ '--rise-color-primary-300': expect.any(String), '--rise-color-primary-400': '#fafafa' })
		expect(theme.css).toContain("[data-rise-theme='x'][data-rise-theme][data-theme='dark'] {")
		expect(theme.css).toContain(
			"@media (prefers-color-scheme: dark) {\n\t[data-rise-theme='x'][data-rise-theme][data-theme='system'] {",
		)
		expect(theme.adjusted).toBe(false)
	})

	it('тёмный бренд для тёмного режима осветляется до контраста и отмечается adjusted', () => {
		const theme = createTheme({ name: 'x', primary: '#0f766e', primaryDark: '#000080' })
		expect(theme.adjusted).toBe(true)
		expect(contrastRatio(theme.darkVars['--rise-color-primary-400'], '#0a0a0a')).toBeGreaterThanOrEqual(4.5)
	})

	it('цвета статусов из HEX — палитры на главных оттенках кита; без входа — не выводятся', () => {
		const { vars } = createTheme({ name: 'x', primary: '#0f766e', info: '#0369a1', error: '#be123c' })
		expect(vars['--rise-color-info-600']).toBe('#0369a1')
		expect(vars['--rise-color-error-600']).toBe('#be123c')
		expect(vars['--rise-color-success-700']).toBeUndefined()
	})

	it('готовые палитры берутся как есть вместо генератора', () => {
		const { vars, adjusted } = createTheme({
			name: 'x',
			primary: '#ffff00',
			palettes: { primary: KIT_PALETTES.primary, warning: KIT_PALETTES.warning },
		})
		expect(adjusted).toBe(false)
		expect(vars['--rise-color-primary-700']).toBe('#c2410c')
		expect(vars['--rise-color-warning-700']).toBe('#b45309')
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

	it('если бренд не берёт 4.5:1 на тонированном фоне, фон светлой темы — белый', () => {
		expect(createTheme({ name: 'x', primary: '#00cc66' }).vars['--rise-color-neutral-0']).toBe('#ffffff')
		expect(createTheme({ name: 'x', primary: '#7c3aed' }).vars['--rise-color-neutral-0']).not.toBe('#ffffff')
	})

	it('из любого цвета — без провалов контраста; пример светлого бренда', () => {
		expect(failures({ name: 'x', primary: '#ffe600' })).toEqual([])
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

	it('minimal в тёмном режиме — светлая кнопка из primaryDark', () => {
		expect(createTheme(THEME_PRESETS.minimal).darkVars['--rise-color-primary-400']).toBe('#fafafa')
	})
})
