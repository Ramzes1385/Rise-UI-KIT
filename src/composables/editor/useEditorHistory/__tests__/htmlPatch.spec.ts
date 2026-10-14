import { applyHtmlPatch, createHtmlPatch } from '../helpers/htmlPatch'

describe('htmlPatch', () => {
	it.each([
		['вставка', '<p>ab</p>', '<p>aXb</p>'],
		['удаление', '<p>aXb</p>', '<p>ab</p>'],
		['замена', '<p>abc</p>', '<p>aZc</p>'],
		['без изменений', '<p>ab</p>', '<p>ab</p>'],
		['пустая строка в текст', '', '<p>x</p>'],
		['текст в пустую строку', '<p>x</p>', ''],
		['префикс и суффикс перекрываются', 'aaa', 'aa'],
		['повтор символов', 'aa', 'aaa'],
	])('%s: undo и redo возвращают обе строки', (_name, before, after) => {
		const patch = createHtmlPatch(before, after)

		expect(applyHtmlPatch(after, patch, 'undo')).toBe(before)
		expect(applyHtmlPatch(before, patch, 'redo')).toBe(after)
	})

	it('хранит только изменённую середину', () => {
		const patch = createHtmlPatch('<p>abc</p>', '<p>aZZc</p>')

		expect(patch).toEqual({ start: 4, removed: 'b', inserted: 'ZZ' })
	})

	it('патч большого документа остаётся маленьким', () => {
		const big = 'x'.repeat(1_000_000)
		const patch = createHtmlPatch(`<p>${big}</p><p>ab</p>`, `<p>${big}</p><p>abc</p>`)

		expect(JSON.stringify(patch).length).toBeLessThan(1024)
	})

	it('случайные строки восстанавливаются точно', () => {
		let seed = 7
		const random = (limit: number): number => {
			seed = (seed * 1103515245 + 12345) % 2147483648
			return seed % limit
		}
		const alphabet = 'ab<>/p '
		const make = (length: number): string => Array.from({ length }, () => alphabet[random(alphabet.length)]).join('')
		for (let index = 0; index < 2000; index++) {
			const before = make(random(30))
			const after = make(random(30))
			const patch = createHtmlPatch(before, after)
			expect(applyHtmlPatch(after, patch, 'undo')).toBe(before)
			expect(applyHtmlPatch(before, patch, 'redo')).toBe(after)
		}
	})
})
