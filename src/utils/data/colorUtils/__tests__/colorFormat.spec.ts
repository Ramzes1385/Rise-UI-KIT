import { describe, expect, it } from 'vitest'
import { formatColor, hslToRgb, parseColor, rgbToHsl } from '../colorFormat'

describe('colorFormat', () => {
	describe('parseColor', () => {
		it('разбирает HEX из 3 и 6 знаков как непрозрачный', () => {
			expect(parseColor('#f97316')).toEqual({ r: 249, g: 115, b: 22, a: 1 })
			expect(parseColor(' fff ')).toEqual({ r: 255, g: 255, b: 255, a: 1 })
		})

		it('разбирает HEX с прозрачностью из 4 и 8 знаков', () => {
			expect(parseColor('#f9731680')).toEqual({ r: 249, g: 115, b: 22, a: 0.5 })
			expect(parseColor('#0008')).toEqual({ r: 0, g: 0, b: 0, a: 0.53 })
		})

		it('разбирает rgb() и rgba() через запятые и пробелы', () => {
			expect(parseColor('rgb(249, 115, 22)')).toEqual({ r: 249, g: 115, b: 22, a: 1 })
			expect(parseColor('rgba(249, 115, 22, 0.25)')).toEqual({ r: 249, g: 115, b: 22, a: 0.25 })
			expect(parseColor('rgb(249 115 22 / 40%)')).toEqual({ r: 249, g: 115, b: 22, a: 0.4 })
		})

		it('разбирает каналы rgb в процентах и зажимает лишнее', () => {
			expect(parseColor('rgb(100%, 0%, 50%)')).toEqual({ r: 255, g: 0, b: 128, a: 1 })
			expect(parseColor('rgb(300, -5, 0)')).toEqual({ r: 255, g: 0, b: 0, a: 1 })
		})

		it('разбирает hsl() и hsla() с градусами', () => {
			expect(parseColor('hsl(25, 95%, 53%)')).toEqual({ r: 249, g: 116, b: 21, a: 1 })
			expect(parseColor('hsla(120deg 100% 50% / 0.5)')).toEqual({ r: 0, g: 255, b: 0, a: 0.5 })
		})

		it('возвращает null для невалидной строки', () => {
			expect(parseColor('orange')).toBeNull()
			expect(parseColor('#12345')).toBeNull()
			expect(parseColor('rgb(1, 2)')).toBeNull()
			expect(parseColor('rgb(1, 2, 3, 4, 5)')).toBeNull()
			expect(parseColor('rgb(a, 2, 3)')).toBeNull()
			expect(parseColor('rgba(1, 2, 3, x)')).toBeNull()
		})
	})

	describe('formatColor', () => {
		it('пишет непрозрачный цвет в HEX, RGB и HSL', () => {
			const color = { r: 249, g: 115, b: 22, a: 1 }
			expect(formatColor(color, 'hex')).toBe('#f97316')
			expect(formatColor(color, 'rgb')).toBe('rgb(249, 115, 22)')
			expect(formatColor(color, 'hsl')).toBe('hsl(25, 95%, 53%)')
		})

		it('пишет прозрачность в #rrggbbaa, rgba() и hsla()', () => {
			const color = { r: 249, g: 115, b: 22, a: 0.5 }
			expect(formatColor(color, 'hex')).toBe('#f9731680')
			expect(formatColor(color, 'rgb')).toBe('rgba(249, 115, 22, 0.5)')
			expect(formatColor(color, 'hsl')).toBe('hsla(25, 95%, 53%, 0.5)')
		})

		it('округляет прозрачность до сотых', () => {
			expect(formatColor({ r: 0, g: 0, b: 0, a: 0.123 }, 'rgb')).toBe('rgba(0, 0, 0, 0.12)')
			expect(formatColor({ r: 0, g: 0, b: 0, a: 0.999 }, 'rgb')).toBe('rgb(0, 0, 0)')
		})
	})

	describe('rgbToHsl и hslToRgb', () => {
		it('переводят основные цвета туда и обратно', () => {
			expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, l: 50 })
			expect(rgbToHsl({ r: 0, g: 255, b: 0 })).toEqual({ h: 120, s: 100, l: 50 })
			expect(rgbToHsl({ r: 0, g: 0, b: 255 })).toEqual({ h: 240, s: 100, l: 50 })
			expect(rgbToHsl({ r: 255, g: 0, b: 128 })).toEqual({ h: 330, s: 100, l: 50 })
			expect(hslToRgb({ h: 240, s: 100, l: 50 })).toEqual({ r: 0, g: 0, b: 255 })
			expect(hslToRgb({ h: 330, s: 100, l: 25 })).toEqual({ r: 128, g: 0, b: 64 })
		})

		it('серые цвета — без тона и насыщенности', () => {
			expect(rgbToHsl({ r: 128, g: 128, b: 128 })).toEqual({ h: 0, s: 0, l: 50 })
			expect(hslToRgb({ h: 90, s: 0, l: 50 })).toEqual({ r: 128, g: 128, b: 128 })
		})

		it('hslToRgb приводит тон к 0–360 и зажимает проценты', () => {
			expect(hslToRgb({ h: -120, s: 150, l: 50 })).toEqual({ r: 0, g: 0, b: 255 })
			expect(hslToRgb({ h: 480, s: 100, l: 75 })).toEqual({ r: 128, g: 255, b: 128 })
		})
	})
})
