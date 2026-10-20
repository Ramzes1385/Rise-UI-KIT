import { describe, expect, it } from 'vitest'
import { THEME_SHADES } from '../types/themeUtils.types'
import { createNeutralPalette, createPalette } from '../palette'
import { contrastRatio, hexToOklch } from '@utils/theme/oklchUtils'

describe('createPalette', () => {
	it('бренд с контрастом 4.5:1 к белому встаёт ровно на 600 без подстройки, текст белый', () => {
		const result = createPalette('#7c3aed')
		expect(result.shades[600]).toBe('#7c3aed')
		expect(result.main).toBe('#7c3aed')
		expect(result.on).toBe('light')
		expect(result.adjusted).toBe(false)
	})

	it('бренд, который берёт 4.5:1 с тёмным текстом и 3:1 к фону поля, встаёт как есть с тёмным текстом', () => {
		const result = createPalette('#ee5410')
		expect(result.main).toBe('#ee5410')
		expect(result.on).toBe('dark')
		expect(result.adjusted).toBe(false)
	})

	it('светлый бренд затемняется до 3:1 к фону поля, несёт тёмный текст и отмечается adjusted', () => {
		const result = createPalette('#FFE600')
		expect(result.seed).toBe('#ffe600')
		expect(result.adjusted).toBe(true)
		expect(result.main).not.toBe('#ffe600')
		expect(result.on).toBe('dark')
		expect(contrastRatio(result.main, '#eceef3')).toBeGreaterThanOrEqual(3)
		expect(contrastRatio(result.main, '#0b0d14')).toBeGreaterThanOrEqual(4.5)
		expect(result.shades[600]).toBe(result.main)
	})

	it('заданный текст: dark осветляет до 4.5:1 с тёмным, light затемняет до 4.5:1 с белым', () => {
		expect(contrastRatio(createPalette('#1d4ed8', 500, 'dark').main, '#0b0d14')).toBeGreaterThanOrEqual(4.5)
		expect(contrastRatio(createPalette('#ee5410', 600, 'light').main, '#ffffff')).toBeGreaterThanOrEqual(4.5)
	})

	it('заливка тёмной темы (500) берёт 4.5:1 с тёмным текстом и у тёмного бренда', () => {
		expect(contrastRatio(createPalette('#1e3a8a').shades[500], '#0b0d14')).toBeGreaterThanOrEqual(4.5)
	})

	it('оттенки идут от светлого к тёмному', () => {
		const { shades } = createPalette('#1d4ed8')
		const lightness = THEME_SHADES.map(shade => hexToOklch(shades[shade]).l)
		for (let index = 1; index < lightness.length; index++) expect(lightness[index]).toBeLessThan(lightness[index - 1])
	})

	it('главный оттенок светлее 500 подстраивается под тёмный текст, а не под белый', () => {
		const result = createPalette('#18181b', 400)
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

	it('белый бренд всё равно даёт кнопку с контрастом: тёмный текст и 3:1 к фону поля', () => {
		const result = createPalette('#ffffff')
		expect(result.on).toBe('dark')
		expect(contrastRatio(result.main, '#0b0d14')).toBeGreaterThanOrEqual(4.5)
		expect(contrastRatio(result.main, '#eceef3')).toBeGreaterThanOrEqual(3)
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
