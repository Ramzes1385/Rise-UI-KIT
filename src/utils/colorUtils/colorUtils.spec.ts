/**
 * Unit-тесты для colorUtils.
 * Покрывают: normalizeHex, isValidHex, channelToHex, hexToRgb, rgbToHex,
 * rgbToHsv, hsvToRgb, hexToHsv, hsvToHex и round-trip конверсии.
 */

import '@testing-library/jest-dom/vitest'

import {
	channelToHex,
	hexToHsv,
	hexToRgb,
	hsvToHex,
	hsvToRgb,
	isValidHex,
	normalizeHex,
	rgbToHex,
	rgbToHsv,
} from './colorUtils'

describe('colorUtils', () => {
	describe('normalizeHex', () => {
		it('нормализует 6-значный HEX с решёткой', () => {
			expect(normalizeHex('#F97316')).toBe('#f97316')
		})

		it('нормализует 6-значный HEX без решётки', () => {
			expect(normalizeHex('f97316')).toBe('#f97316')
		})

		it('разворачивает 3-значный HEX в 6-значный', () => {
			expect(normalizeHex('#abc')).toBe('#aabbcc')
		})

		it('обрезает пробелы по краям', () => {
			expect(normalizeHex('  #fff  ')).toBe('#ffffff')
		})

		it('возвращает null для не-HEX символов', () => {
			expect(normalizeHex('#gggggg')).toBeNull()
		})

		it('возвращает null для некорректной длины', () => {
			expect(normalizeHex('#ffff')).toBeNull()
		})

		it('возвращает null для пустой строки', () => {
			expect(normalizeHex('')).toBeNull()
		})
	})

	describe('isValidHex', () => {
		it('подтверждает валидный 6-значный HEX', () => {
			expect(isValidHex('#3b82f6')).toBe(true)
		})

		it('подтверждает валидный 3-значный HEX', () => {
			expect(isValidHex('fff')).toBe(true)
		})

		it('отклоняет невалидную строку', () => {
			expect(isValidHex('not-a-color')).toBe(false)
		})
	})

	describe('channelToHex', () => {
		it('переводит канал в двухзначный HEX с ведущим нулём', () => {
			expect(channelToHex(5)).toBe('05')
		})

		it('переводит максимальный канал', () => {
			expect(channelToHex(255)).toBe('ff')
		})

		it('ограничивает значения выше 255', () => {
			expect(channelToHex(999)).toBe('ff')
		})

		it('ограничивает отрицательные значения нулём', () => {
			expect(channelToHex(-10)).toBe('00')
		})
	})

	describe('hexToRgb', () => {
		it('преобразует HEX в RGB', () => {
			expect(hexToRgb('#ff8000')).toEqual({ r: 255, g: 128, b: 0 })
		})

		it('возвращает чёрный для невалидного входа', () => {
			expect(hexToRgb('invalid')).toEqual({ r: 0, g: 0, b: 0 })
		})
	})

	describe('rgbToHex', () => {
		it('преобразует RGB в нормализованный HEX', () => {
			expect(rgbToHex({ r: 255, g: 128, b: 0 })).toBe('#ff8000')
		})
	})

	describe('rgbToHsv', () => {
		it('преобразует красный', () => {
			expect(rgbToHsv({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, v: 100 })
		})

		it('преобразует зелёный (ветка max === g)', () => {
			expect(rgbToHsv({ r: 0, g: 255, b: 0 })).toEqual({ h: 120, s: 100, v: 100 })
		})

		it('преобразует синий (ветка max === b)', () => {
			expect(rgbToHsv({ r: 0, g: 0, b: 255 })).toEqual({ h: 240, s: 100, v: 100 })
		})

		it('преобразует чёрный (delta = 0, max = 0)', () => {
			expect(rgbToHsv({ r: 0, g: 0, b: 0 })).toEqual({ h: 0, s: 0, v: 0 })
		})

		it('преобразует белый (delta = 0, max > 0)', () => {
			expect(rgbToHsv({ r: 255, g: 255, b: 255 })).toEqual({ h: 0, s: 0, v: 100 })
		})

		it('даёт отрицательный hue до коррекции (ветка degrees < 0)', () => {
			const result = rgbToHsv({ r: 255, g: 0, b: 128 })
			expect(result.h).toBeGreaterThanOrEqual(0)
			expect(result.h).toBeLessThan(360)
		})
	})

	describe('hsvToRgb', () => {
		it('преобразует красный', () => {
			expect(hsvToRgb({ h: 0, s: 100, v: 100 })).toEqual({ r: 255, g: 0, b: 0 })
		})

		it('преобразует все сегменты круга hue', () => {
			expect(hsvToRgb({ h: 60, s: 100, v: 100 })).toEqual({ r: 255, g: 255, b: 0 })
			expect(hsvToRgb({ h: 120, s: 100, v: 100 })).toEqual({ r: 0, g: 255, b: 0 })
			expect(hsvToRgb({ h: 180, s: 100, v: 100 })).toEqual({ r: 0, g: 255, b: 255 })
			expect(hsvToRgb({ h: 240, s: 100, v: 100 })).toEqual({ r: 0, g: 0, b: 255 })
			expect(hsvToRgb({ h: 300, s: 100, v: 100 })).toEqual({ r: 255, g: 0, b: 255 })
		})

		it('преобразует граничный hue = 360 (i % 6 = 0)', () => {
			expect(hsvToRgb({ h: 360, s: 100, v: 100 })).toEqual({ r: 255, g: 0, b: 0 })
		})

		it('преобразует серый (s = 0)', () => {
			expect(hsvToRgb({ h: 0, s: 0, v: 50 })).toEqual({ r: 128, g: 128, b: 128 })
		})
	})

	describe('hexToHsv / hsvToHex', () => {
		it('hexToHsv преобразует HEX в HSV', () => {
			expect(hexToHsv('#ff0000')).toEqual({ h: 0, s: 100, v: 100 })
		})

		it('hsvToHex преобразует HSV в HEX', () => {
			expect(hsvToHex({ h: 0, s: 100, v: 100 })).toBe('#ff0000')
		})
	})

	describe('round-trip', () => {
		it('hex → hsv → hex сохраняет значение с точностью до округления HSV (±1 на канал)', () => {
			const original = hexToRgb('#3b82f6')
			const restored = hexToRgb(hsvToHex(hexToHsv('#3b82f6')))
			expect(Math.abs(restored.r - original.r)).toBeLessThanOrEqual(1)
			expect(Math.abs(restored.g - original.g)).toBeLessThanOrEqual(1)
			expect(Math.abs(restored.b - original.b)).toBeLessThanOrEqual(1)
		})

		it('rgb → hex → rgb сохраняет значение', () => {
			const original = { r: 34, g: 197, b: 94 }
			expect(hexToRgb(rgbToHex(original))).toEqual(original)
		})
	})
})
