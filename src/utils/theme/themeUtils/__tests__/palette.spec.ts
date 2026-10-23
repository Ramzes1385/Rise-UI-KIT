import { describe, expect, it } from 'vitest'
import { THEME_SHADES } from '../types/themeUtils.types'
import type { ThemePaletteOn } from '../types/themeUtils.types'
import { contrastRatio, hexToOklch } from '@utils/theme/oklchUtils'
import { adjacentShade, createNeutralPalette, createPalette, createRolePalette, liftFill } from '../palette'

const LIGHT_TEXT = '#f5f6f9'
const DARK_TEXT = '#0b0d14'
const FIELD = '#eceef3'
const DARK_SURFACE = '#171a24'
const KIT_ON: ThemePaletteOn = { text: 'light', light: LIGHT_TEXT, dark: DARK_TEXT }

describe('createPalette', () => {
	it('бренд, который держит 4.5:1 со светлым текстом (нейтраль 50), встаёт ровно на главный оттенок без подстройки', () => {
		const result = createPalette('#7c3aed')
		expect(result.shades[600]).toBe('#7c3aed')
		expect(result.main).toBe('#7c3aed')
		expect(result.on).toBe('light')
		expect(result.adjusted).toBe(false)
	})

	it('по умолчанию текст светлый: янтарь кита темнеет, пока нейтраль 50 не возьмёт на нём 4.5:1', () => {
		const result = createPalette('#ee5410')
		expect(result.on).toBe('light')
		expect(result.adjusted).toBe(true)
		expect(result.main).not.toBe('#ee5410')
		expect(contrastRatio(result.main, LIGHT_TEXT)).toBeGreaterThanOrEqual(4.5)
		expect(contrastRatio(result.main, '#ffffff')).toBeGreaterThanOrEqual(4.5)
	})

	it('светлый бренд со светлым текстом темнеет до 4.5:1 и отмечается adjusted', () => {
		const result = createPalette('#FFE600')
		expect(result.seed).toBe('#ffe600')
		expect(result.adjusted).toBe(true)
		expect(result.on).toBe('light')
		expect(contrastRatio(result.main, LIGHT_TEXT)).toBeGreaterThanOrEqual(4.5)
		expect(result.shades[600]).toBe(result.main)
	})

	it('auto: светлый текст, если цвет его держит; тёмный — если держит тёмный (светлый цвет темнеет до 3:1 к фону поля)', () => {
		expect(createPalette('#7c3aed', 600, 'auto')).toMatchObject({ main: '#7c3aed', on: 'light', adjusted: false })
		expect(createPalette('#ee5410', 600, 'auto')).toMatchObject({ main: '#ee5410', on: 'dark', adjusted: false })
		const yellow = createPalette('#ffe600', 600, 'auto')
		expect(yellow.on).toBe('dark')
		expect(contrastRatio(yellow.main, FIELD)).toBeGreaterThanOrEqual(3)
		expect(contrastRatio(yellow.main, DARK_TEXT)).toBeGreaterThanOrEqual(4.5)
	})

	it('auto: цвет между порогами (ни светлый, ни тёмный текст не берут 4.5:1) темнеет под светлый текст', () => {
		expect(contrastRatio('#767676', LIGHT_TEXT)).toBeLessThan(4.5)
		expect(contrastRatio('#767676', DARK_TEXT)).toBeLessThan(4.5)
		const result = createPalette('#767676', 600, 'auto')
		expect(result.on).toBe('light')
		expect(result.adjusted).toBe(true)
		expect(contrastRatio(result.main, LIGHT_TEXT)).toBeGreaterThanOrEqual(4.5)
	})

	it('заданный текст: dark осветляет до 4.5:1 с тёмным (фон поля не учитывается), light затемняет до 4.5:1 со светлым', () => {
		expect(contrastRatio(createPalette('#1d4ed8', 500, 'dark').main, DARK_TEXT)).toBeGreaterThanOrEqual(4.5)
		expect(createPalette('#ffe600', 600, 'dark')).toMatchObject({ main: '#ffe600', on: 'dark', adjusted: false })
		expect(contrastRatio(createPalette('#ee5410', 600, 'light').main, LIGHT_TEXT)).toBeGreaterThanOrEqual(4.5)
	})

	it('яркий тон тёмной темы (500) берёт 4.5:1 с тёмным текстом и у тёмного бренда', () => {
		expect(contrastRatio(createPalette('#1e3a8a').shades[500], DARK_TEXT)).toBeGreaterThanOrEqual(4.5)
	})

	it('оттенки идут от светлого к тёмному', () => {
		const { shades } = createPalette('#1d4ed8')
		const lightness = THEME_SHADES.map(shade => hexToOklch(shades[shade]).l)
		for (let index = 1; index < lightness.length; index++) expect(lightness[index]).toBeLessThan(lightness[index - 1])
	})

	it('соседний светлый шаг светлее главного и у светлого главного оттенка: наведение под тёмный текст светлее заливки', () => {
		const { shades, main } = createPalette('#ffe600', 700, 'dark')
		expect(hexToOklch(shades[600]).l).toBeGreaterThan(hexToOklch(main).l)
		expect(contrastRatio(shades[600], DARK_TEXT)).toBeGreaterThan(contrastRatio(main, DARK_TEXT))
	})

	it('главный оттенок светлее 500 с тёмным текстом подстраивается под тёмный текст', () => {
		const result = createPalette('#18181b', 400, 'dark')
		expect(result.adjusted).toBe(true)
		expect(contrastRatio(result.shades[400], '#0a0a0a')).toBeGreaterThanOrEqual(4.5)
	})

	it('у чёрного бренда тёмные оттенки не слипаются со светлыми, а 50 остаётся светлым фоном', () => {
		const { shades } = createPalette('#000000')
		expect(shades[600]).toBe('#000000')
		expect(hexToOklch(shades[50]).l).toBeGreaterThanOrEqual(0.969)
		expect(hexToOklch(shades[100]).l).toBeGreaterThanOrEqual(0.918)
		expect(contrastRatio(shades[400], '#262626')).toBeGreaterThanOrEqual(4.5)
		expect(contrastRatio(shades[300], '#333333')).toBeGreaterThanOrEqual(4.5)
	})

	it('800 читается на 50 даже у бледного бренда', () => {
		const { shades } = createPalette('#ccffff')
		expect(contrastRatio(shades[800], shades[50])).toBeGreaterThanOrEqual(4.5)
	})

	it('белый бренд всё равно даёт кнопку с контрастом: светлый текст по умолчанию, тёмный и 3:1 к фону поля — в auto', () => {
		expect(contrastRatio(createPalette('#ffffff').main, LIGHT_TEXT)).toBeGreaterThanOrEqual(4.5)
		const auto = createPalette('#ffffff', 600, 'auto')
		expect(auto.on).toBe('dark')
		expect(contrastRatio(auto.main, DARK_TEXT)).toBeGreaterThanOrEqual(4.5)
		expect(contrastRatio(auto.main, FIELD)).toBeGreaterThanOrEqual(3)
	})
})

describe('createRolePalette', () => {
	const themeOn: ThemePaletteOn = { text: 'light', light: '#f4f6f6', dark: '#090e0e', field: '#edf0f6' }

	it('светлый и тёмный текст — цвета темы: заливка берёт 4.5:1 именно с ними', () => {
		const light = createRolePalette('#ee5410', 700, themeOn)
		expect(light.shades[700]).toBe(light.main)
		expect(contrastRatio(light.main, themeOn.light)).toBeGreaterThanOrEqual(4.5)
		const dark = createRolePalette('#1d4ed8', 700, { ...themeOn, text: 'dark' })
		expect(contrastRatio(dark.main, themeOn.dark)).toBeGreaterThanOrEqual(4.5)
	})

	it('тёмный текст с фоном поля: слишком светлая заливка темнеет до 3:1 к нему и держит 4.5:1 с тёмным текстом', () => {
		const result = createRolePalette('#ffe600', 700, { ...themeOn, text: 'dark' })
		expect(result.on).toBe('dark')
		expect(contrastRatio(result.main, themeOn.field as string)).toBeGreaterThanOrEqual(3)
		expect(contrastRatio(result.main, themeOn.dark)).toBeGreaterThanOrEqual(4.5)
	})

	it('auto берёт фон поля темы', () => {
		const result = createRolePalette('#ffe600', 700, { ...themeOn, text: 'auto' })
		expect(result.on).toBe('dark')
		expect(contrastRatio(result.main, themeOn.field as string)).toBeGreaterThanOrEqual(3)
	})
})

describe('adjacentShade', () => {
	it('1 — следующий шаг (темнее), -1 — предыдущий (светлее)', () => {
		expect(adjacentShade(700, 1)).toBe(800)
		expect(adjacentShade(600, 1)).toBe(700)
		expect(adjacentShade(700, -1)).toBe(600)
		expect(adjacentShade(50, 1)).toBe(100)
	})
})

describe('liftFill', () => {
	it('тёмная заливка светлеет до 3:1 к поверхности тёмной темы, светлый текст на ней держит 4.5:1', () => {
		expect(contrastRatio('#1d4ed8', DARK_SURFACE)).toBeLessThan(3)
		const result = liftFill('#1d4ed8', KIT_ON, DARK_SURFACE)
		expect(contrastRatio(result, DARK_SURFACE)).toBeGreaterThanOrEqual(3)
		expect(contrastRatio(result, LIGHT_TEXT)).toBeGreaterThanOrEqual(4.5)
	})

	it('заливка, которая уже отделяется от поверхности, не меняется', () => {
		expect(liftFill('#c4400a', KIT_ON, DARK_SURFACE)).toBe('#c4400a')
	})

	it('не светлеет дальше последнего шага, на котором светлый текст берёт 4.5:1', () => {
		const result = liftFill('#1d4ed8', KIT_ON, '#3a3a3a')
		expect(contrastRatio(result, LIGHT_TEXT)).toBeGreaterThanOrEqual(4.5)
		expect(contrastRatio(result, '#3a3a3a')).toBeLessThan(3)
		expect(hexToOklch(result).l).toBeGreaterThan(hexToOklch('#1d4ed8').l)
	})

	it('останавливается на краю светлоты', () => {
		const result = liftFill('#eeeeee', { ...KIT_ON, light: '#000000' }, '#ffffff')
		expect(hexToOklch(result).l).toBeGreaterThan(0.98)
		expect(contrastRatio(result, '#ffffff')).toBeLessThan(3)
	})
})

describe('createNeutralPalette', () => {
	it('gray — чистый серый, фон светлой темы белый', () => {
		const shades = createNeutralPalette('gray', '#7c3aed')
		expect(shades[0]).toBe('#ffffff')
		for (const shade of THEME_SHADES) expect(hexToOklch(shades[shade]).c).toBeLessThan(0.0005)
	})

	it('tinted — серый с тоном бренда и почти белый фон того же тона', () => {
		const shades = createNeutralPalette('tinted', '#7c3aed')
		const brandHue = hexToOklch('#7c3aed').h
		expect(shades[0]).not.toBe('#ffffff')
		expect(hexToOklch(shades[0]).l).toBeGreaterThan(0.99)
		expect(Math.abs(hexToOklch(shades[500]).h - brandHue)).toBeLessThan(5)
	})

	it('HEX — тон из цвета, хрома не больше 0.04 (с усилением середины), фон белый', () => {
		const shades = createNeutralPalette('#ff0000', '#1d4ed8')
		expect(shades[0]).toBe('#ffffff')
		expect(hexToOklch(shades[50]).c).toBeLessThanOrEqual(0.0405)
		expect(hexToOklch(shades[500]).c).toBeLessThanOrEqual(0.04 * 1.4 + 0.001)
	})

	it('текстовые оттенки берут 4.5:1 с фонами светлой и тёмной темы', () => {
		const shades = createNeutralPalette('#64748b', '#1d4ed8')
		expect(contrastRatio(shades[600], shades[0])).toBeGreaterThanOrEqual(4.5)
		expect(contrastRatio(shades[700], shades[0])).toBeGreaterThanOrEqual(4.5)
		expect(contrastRatio(shades[500], shades[100])).toBeGreaterThanOrEqual(3)
		expect(contrastRatio(shades[400], shades[900])).toBeGreaterThanOrEqual(4.5)
		expect(contrastRatio(shades[300], shades[900])).toBeGreaterThanOrEqual(4.5)
	})
})
