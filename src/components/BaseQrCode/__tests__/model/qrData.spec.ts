import { reedSolomon } from '../../model/qr/galois'
import { chooseVersion, dataCapacity, dataCodewords, finalCodewords } from '../../model/qr/qrData'

const bytesOf = (text: string): number[] => [...new TextEncoder().encode(text)]

describe('данные QR-кода в байтовом режиме', () => {
	it('ёмкость версии — кодовые слова данных всех блоков', () => {
		expect([dataCapacity(1, 'L'), dataCapacity(1, 'H'), dataCapacity(5, 'Q'), dataCapacity(10, 'L')]).toEqual([19, 9, 62, 274])
	})

	it('версия — наименьшая, в которую помещается текст; сверх версии 10 — null', () => {
		expect([chooseVersion(0, 'M'), chooseVersion(14, 'M'), chooseVersion(15, 'M')]).toEqual([1, 1, 2])
		expect([chooseVersion(271, 'L'), chooseVersion(272, 'L')]).toEqual([10, null])
		expect([chooseVersion(119, 'H'), chooseVersion(120, 'H')]).toEqual([10, null])
	})

	it('режим, длина, байты, терминатор и чередование 0xEC и 0x11', () => {
		expect(dataCodewords(bytesOf('Rise'), 1, 'M')).toEqual([
			0x40, 0x45, 0x26, 0x97, 0x36, 0x50, 0xec, 0x11, 0xec, 0x11, 0xec, 0x11, 0xec, 0x11, 0xec, 0x11,
		])
	})

	it('текст на всю ёмкость — без заполнителей', () => {
		expect(dataCodewords(bytesOf('x'.repeat(17)), 1, 'L')).toHaveLength(19)
		expect(dataCodewords(bytesOf('x'.repeat(17)), 1, 'L').slice(-2)).toEqual([0x87, 0x80])
	})

	it('с версии 10 длина занимает 16 бит', () => {
		const codewords = dataCodewords(Array<number>(200).fill(0x61), 10, 'L')
		expect(codewords.slice(0, 4)).toEqual([0x40, 0x0c, 0x86, 0x16])
		expect(codewords).toHaveLength(274)
	})

	it('блоки разной длины чередуются: сначала данные, потом коррекция', () => {
		const data = Array.from({ length: 62 }, (_, index) => index)
		const result = finalCodewords(data, 5, 'Q')
		expect(result).toHaveLength(134)
		expect(result.slice(0, 8)).toEqual([0, 15, 30, 46, 1, 16, 31, 47])
		expect(result.slice(58, 62)).toEqual([44, 60, 45, 61])
		const blocks = [data.slice(0, 15), data.slice(15, 30), data.slice(30, 46), data.slice(46)]
		expect(result.slice(62, 66)).toEqual(blocks.map(block => reedSolomon(block, 18)[0]))
		expect(result.slice(-4)).toEqual(blocks.map(block => reedSolomon(block, 18)[17]))
	})
})
