import { describe, expect, it } from 'vitest'
import { contrastRatio, hexToOklch, oklchToHex, oklchToRgb, relativeLuminance, rgbToOklch, toGamut } from '../oklchUtils'

describe('oklchUtils', () => {
	describe('rgbToOklch и hexToOklch', () => {
		it('переводит чистый красный в эталонные значения OKLCH', () => {
			const red = rgbToOklch({ r: 255, g: 0, b: 0 })
			expect(red.l).toBeCloseTo(0.628, 3)
			expect(red.c).toBeCloseTo(0.2577, 3)
			expect(red.h).toBeCloseTo(29.23, 1)
		})

		it('белый и чёрный — без хромы, светлота 1 и 0', () => {
			expect(hexToOklch('#ffffff').l).toBeCloseTo(1, 4)
			expect(hexToOklch('#ffffff').c).toBeLessThan(0.0001)
			expect(hexToOklch('#000000').l).toBeCloseTo(0, 6)
		})

		it('тон с отрицательным углом приводится к 0–360', () => {
			const blue = hexToOklch('#0000ff')
			expect(blue.h).toBeGreaterThan(260)
			expect(blue.h).toBeLessThan(270)
		})

		it('короткий HEX читается как полный', () => {
			expect(hexToOklch('#f00')).toEqual(hexToOklch('#ff0000'))
		})
	})

	describe('oklchToHex и oklchToRgb', () => {
		it.each(['#c2410c', '#1d4ed8', '#7c3aed', '#18181b', '#fafafa', '#ffffff', '#000000', '#22c55e'])(
			'%s переживает перевод туда и обратно',
			hex => {
				expect(oklchToHex(hexToOklch(hex))).toBe(hex)
			},
		)

		it('цвет вне гамута теряет хрому, а не уходит за 0–255', () => {
			const rgb = oklchToRgb({ l: 0.7, c: 0.4, h: 150 })
			for (const channel of [rgb.r, rgb.g, rgb.b]) {
				expect(channel).toBeGreaterThanOrEqual(0)
				expect(channel).toBeLessThanOrEqual(255)
			}
		})

		it('светлота за пределами 0–1 обрезается до белого и чёрного', () => {
			expect(oklchToHex({ l: 1.2, c: 0, h: 0 })).toBe('#ffffff')
			expect(oklchToHex({ l: -0.2, c: 0, h: 0 })).toBe('#000000')
		})
	})

	describe('toGamut', () => {
		it('уменьшает хрому цвета вне sRGB при той же светлоте и тоне', () => {
			const result = toGamut({ l: 0.7, c: 0.4, h: 150 })
			expect(result.c).toBeLessThan(0.4)
			expect(result.c).toBeGreaterThan(0)
			expect(result.l).toBe(0.7)
			expect(result.h).toBe(150)
		})

		it('цвет в гамуте не меняет', () => {
			expect(toGamut({ l: 0.5, c: 0.05, h: 30 })).toEqual({ l: 0.5, c: 0.05, h: 30 })
		})

		it('хрома не уходит в минус, если гамут не взять даже серым', () => {
			expect(toGamut({ l: 1.5, c: 0.003, h: 0 }).c).toBe(0)
		})
	})

	describe('relativeLuminance и contrastRatio', () => {
		it('яркость белого — 1, чёрного — 0, тёмного канала — по линейному участку', () => {
			expect(relativeLuminance('#ffffff')).toBeCloseTo(1, 6)
			expect(relativeLuminance('#000000')).toBe(0)
			expect(relativeLuminance('#010101')).toBeCloseTo(0.0003, 4)
		})

		it('чёрный на белом — 21:1, порядок аргументов не важен', () => {
			expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 6)
			expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 6)
			expect(contrastRatio('#c2410c', '#c2410c')).toBe(1)
		})

		it('совпадает с эталоном WCAG для оранжевого кита на белом', () => {
			expect(contrastRatio('#c2410c', '#ffffff')).toBeCloseTo(5.18, 2)
		})
	})
})
