import { encodeBytes, encodeQr } from '../../model/encode/qrCode'
import { clampLogoShare, encodeWithLogo, isInLogoArea, logoArea, logoFits } from '../../model/encode/qrLogo'

const URL = 'https://rise-ui.dev'

const bytesOf = (text: string): number[] => [...new TextEncoder().encode(text)]

describe('логотип в QR-коде', () => {
	it('доля стороны: 0.1–0.3, по умолчанию и для не-чисел — 0.22', () => {
		expect([
			clampLogoShare(undefined),
			clampLogoShare(Number.NaN),
			clampLogoShare(0.5),
			clampLogoShare(0.01),
			clampLogoShare(0.18),
		]).toEqual([0.22, 0.22, 0.3, 0.1, 0.18])
	})

	it('вырез: нечётная сторона с полем не меньше половины модуля, ровно по центру', () => {
		expect(logoArea(37, 0.22)).toEqual({ start: 13, side: 11, image: 8.14 })
		expect(logoArea(25, 0.3)).toEqual({ start: 8, side: 9, image: 7.5 })
		expect(logoArea(21, 0.1)).toEqual({ start: 8, side: 5, image: 2.1 })
	})

	it('клетка в вырезе — от start включительно до start + side не включая', () => {
		const area = { start: 13, side: 11, image: 8.14 }
		expect([
			isInLogoArea(area, [13, 13]),
			isInLogoArea(area, [23, 23]),
			isInLogoArea(area, [24, 13]),
			isInLogoArea(area, [13, 12]),
		]).toEqual([true, true, false, false])
		expect(isInLogoArea(null, [13, 13])).toBe(false)
	})

	it('вырез не задевает служебные узоры и берёт не больше 60% запаса коррекции каждого блока', () => {
		expect(logoFits(1, 'H', logoArea(21, 0.1))).toBe(false)
		expect(logoFits(4, 'H', logoArea(33, 0.22))).toBe(false)
		expect(logoFits(5, 'H', logoArea(37, 0.22))).toBe(true)
		expect(logoFits(10, 'L', logoArea(57, 0.3))).toBe(false)
		expect(logoFits(10, 'L', logoArea(57, 0.1))).toBe(true)
	})

	it('с логотипом версия растёт, пока вырез не поместится: короткая ссылка на уровне H — версия 5 вместо 3', () => {
		expect(encodeQr(URL, 'H')?.version).toBe(3)
		const code = encodeWithLogo(URL, 'H', 0.22)
		expect(code?.area).toEqual({ start: 13, side: 11, image: 8.14 })
		expect(code?.matrix).toEqual(encodeBytes(bytesOf(URL), { version: 5, level: 'H' }))
	})

	it('уровень — нижняя граница: с логотипом берётся более высокий, если код так компактнее', () => {
		expect(encodeWithLogo(URL, 'L', 0.22)?.matrix).toEqual(encodeWithLogo(URL, 'H', 0.22)?.matrix)
		const long = 'https://ramzes1385.github.io/Rise-UI-KIT/?path=/docs/element-baseqrcode--docs&utm_source=qr'
		expect(encodeWithLogo(long, 'M', 0.22)?.matrix.version).toBe(8)
		expect(encodeWithLogo(long, 'H', 0.22)?.matrix.version).toBe(9)
	})

	it('если логотип не помещается даже в версию 10, он уменьшается; слишком длинный текст — null', () => {
		const code = encodeWithLogo('a'.repeat(140), 'Q', 0.3)
		expect(code?.matrix.version).toBe(10)
		expect(code?.area?.image).toBeLessThan(57 * 0.3)
		expect(encodeWithLogo('a'.repeat(300), 'L', 0.22)).toBeNull()
	})
})
