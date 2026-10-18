import { estimateTextWidth } from '../../../../model/routing/textWidth'

describe('estimateTextWidth', () => {
	it('пустая строка — ноль', () => {
		expect(estimateTextWidth('')).toBe(0)
	})

	it('размер шрифта по умолчанию — 12', () => {
		expect(estimateTextWidth('abc')).toBe(estimateTextWidth('abc', 12))
	})

	it('результат — целое, растёт с размером шрифта и с длиной строки', () => {
		const small = estimateTextWidth('Заказы', 12)
		expect(Number.isInteger(small)).toBe(true)
		expect(estimateTextWidth('Заказы', 24)).toBeGreaterThan(small)
		expect(estimateTextWidth('Заказы и платежи', 12)).toBeGreaterThan(small)
	})

	it('узкие знаки уже обычных, широкие шире, заглавные шире строчных, цифры шире узких', () => {
		const width = (text: string): number => estimateTextWidth(text, 100)
		expect(width('i')).toBeLessThan(width('n'))
		expect(width('.')).toBeLessThan(width('n'))
		expect(width('n')).toBeLessThan(width('7'))
		expect(width('7')).toBeLessThan(width('A'))
		expect(width('A')).toBeLessThan(width('m'))
		expect(width('W')).toBe(width('m'))
		expect(width('Ж')).toBe(width('A'))
	})

	it('иероглифы, хангыль и полноширинные знаки занимают целый квадрат', () => {
		expect(estimateTextWidth('日', 10)).toBe(10)
		expect(estimateTextWidth('한', 10)).toBe(10)
		expect(estimateTextWidth('Ａ', 10)).toBe(10)
		expect(estimateTextWidth('日本語', 10)).toBe(30)
	})

	it('суррогатные пары считаются одним знаком', () => {
		expect(estimateTextWidth('😀', 100)).toBe(estimateTextWidth('n', 100))
	})
})
