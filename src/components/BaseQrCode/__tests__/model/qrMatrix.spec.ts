import { buildMatrix, formatBits, maskPenalty, versionBits } from '../../model/qr/qrMatrix'

const light = (size: number): boolean[][] => Array.from({ length: size }, () => Array<boolean>(size).fill(false))

describe('матрица QR-кода', () => {
	it('биты формата: уровень, маска и BCH(15,5) с маской 0x5412', () => {
		expect(formatBits('M', 0)).toBe(0b101010000010010)
		expect(formatBits('L', 4)).toBe(0b110011000101111)
		expect(formatBits('Q', 0)).toBe(0b011010101011111)
		expect(formatBits('H', 0)).toBe(0b001011010001001)
	})

	it('биты версии: BCH(18,6)', () => {
		expect([versionBits(7), versionBits(10)]).toEqual([0x07c94, 0x0a4d3])
	})

	it('штраф маски: серии, блоки 2×2 и баланс тёмных модулей', () => {
		expect(maskPenalty(light(21))).toBe(42 * 19 + 400 * 3 + 90)
	})

	it('штраф за узор, похожий на искатель, — 40 за каждое вхождение в строке и столбце', () => {
		const modules = light(11)
		modules[5] = [...'10111010000'].map(bit => bit === '1')
		const withPattern = maskPenalty(modules)
		modules[5] = [...'10111010001'].map(bit => bit === '1')
		expect(withPattern - maskPenalty(modules)).toBeGreaterThanOrEqual(40)
	})

	it('поисковые узоры, полосы синхронизации и тёмный модуль на своих местах', () => {
		const { modules, size } = buildMatrix(Array<number>(16).fill(0), { version: 1, level: 'M', mask: 0 })
		const row = (y: number, from: number, to: number): string =>
			modules[y]
				.slice(from, to)
				.map(isDark => (isDark ? '1' : '0'))
				.join('')
		expect([row(0, 0, 7), row(1, 0, 7), row(2, 0, 7)]).toEqual(['1111111', '1000001', '1011101'])
		expect(row(0, size - 7, size)).toBe('1111111')
		expect(row(6, 8, size - 8)).toBe('10101')
		expect(modules[size - 8][8]).toBe(true)
	})
})
