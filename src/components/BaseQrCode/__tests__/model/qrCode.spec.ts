import { encodeQr, qrPath } from '../../model/qr/qrCode'

const bitsOf = (modules: readonly (readonly boolean[])[]): string[] => modules.map(row => row.map(isDark => (isDark ? '1' : '0')).join(''))

const hexOf = (modules: readonly (readonly boolean[])[]): string[] =>
	bitsOf(modules).map(bits => {
		const padded = bits.padEnd(Math.ceil(bits.length / 4) * 4, '0')
		return (padded.match(/.{4}/g) ?? []).map(nibble => Number.parseInt(nibble, 2).toString(16)).join('')
	})

const PYTHON_QRCODE_RISE_M_MASK_3 = [
	'111111101111101111111',
	'100000101000101000001',
	'101110100010101011101',
	'101110101000001011101',
	'101110100110001011101',
	'100000100100001000001',
	'111111101010101111111',
	'000000001000000000000',
	'101101110100001001011',
	'111101010010100100001',
	'010001101110111110011',
	'000001011000110001011',
	'110101110101010011000',
	'000000001000010101011',
	'111111101010011011100',
	'100000101001111001100',
	'101110100011001001111',
	'101110101110010011010',
	'101110101101010011100',
	'100000100111101011001',
	'111111101001100100000',
]

const VERSION_7_TEXT = 'https://ramzes1385.github.io/Rise-UI-KIT/?path=/docs/element-baseqrcode--docs&utm_source=unit-tests&utm_medium=qr'

const PYTHON_QRCODE_VERSION_7_M_MASK_5 = [
	'fe43092e4bf8',
	'82e2e9dc5208',
	'ba94799ed2e8',
	'bab2e1fbdae8',
	'ba428fcf3ae8',
	'8262a8f94208',
	'feaaaaaaabf8',
	'009878ca9800',
	'82e13fe56670',
	'409df2e77b30',
	'93c3472def50',
	'b0e75c1fdbe0',
	'c704b40eead0',
	'a09ef95719a8',
	'3702f9e87b60',
	'5496bbc36368',
	'56b531e71250',
	'a97498431d48',
	'7b7c9488c5a8',
	'54719188d468',
	'5fdf7fa35fc0',
	'28c088abf8f0',
	'6a82da85fab0',
	'c88288aa88f0',
	'efe51fb8bf90',
	'052bbbd25168',
	'6be649616c70',
	'7cb02fb055b8',
	'4b7538f72280',
	'bd6fa2161338',
	'5b95f6c18f88',
	'0816469ae270',
	'32f469e50688',
	'9569b8fa3fe0',
	'0a624b24fc30',
	'789e0becf970',
	'9b383fcabfc0',
	'00f128fbd8e8',
	'fe735a899ab0',
	'820b98f658e0',
	'ba58cf911fc0',
	'ba76574741d8',
	'ba72c65018a8',
	'82192e6ff560',
	'fef117e72a70',
]

describe('кодирование QR', () => {
	it('версия 1-M с маской 3 совпадает с эталоном python-qrcode', () => {
		const qr = encodeQr('Rise', 'M', 3)
		expect(qr).toMatchObject({ version: 1, size: 21, mask: 3 })
		expect(bitsOf(qr?.modules ?? [])).toEqual(PYTHON_QRCODE_RISE_M_MASK_3)
	})

	it('версия 7-M с маской 5 — с блоками версии и выравнивания — совпадает с эталоном python-qrcode', () => {
		const qr = encodeQr(VERSION_7_TEXT, 'M', 5)
		expect(qr).toMatchObject({ version: 7, size: 45, mask: 5 })
		expect(hexOf(qr?.modules ?? [])).toEqual(PYTHON_QRCODE_VERSION_7_M_MASK_5)
	})

	it('без маски выбирается маска с наименьшим штрафом, матрица та же, что с ней явно', () => {
		const auto = encodeQr('https://example.com', 'Q')
		expect(auto?.mask).toBeGreaterThanOrEqual(0)
		expect(auto?.mask).toBeLessThan(8)
		expect(encodeQr('https://example.com', 'Q', auto?.mask)?.modules).toEqual(auto?.modules)
	})

	it('текст кодируется в UTF-8: кириллическая буква — два байта', () => {
		expect(encodeQr('Hello!', 'H')?.version).toBe(1)
		expect(encodeQr('Привет', 'H')?.version).toBe(2)
	})

	it('слишком длинный текст — null', () => {
		expect(encodeQr('a'.repeat(271), 'L')?.version).toBe(10)
		expect(encodeQr('a'.repeat(272), 'L')).toBeNull()
	})

	it('путь SVG: горизонтальные серии тёмных модулей со сдвигом на поле', () => {
		const modules = [
			[true, true, false, true],
			[false, false, false, false],
			[true, false, false, false],
		]
		expect(qrPath(modules, 1)).toBe('M1 1h2v1h-2zM4 1h1v1h-1zM1 3h1v1h-1z')
		expect(qrPath(modules, 0)).toBe('M0 0h2v1h-2zM3 0h1v1h-1zM0 2h1v1h-1z')
	})
})
