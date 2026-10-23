import { diffSequence } from '../../model/diff/sequenceDiff'
import { diffLines, diffWords, splitLines, splitRows } from '../../model/diff/textDiff'

const texts = (lines: ReturnType<typeof diffLines>) => lines.map(line => [line.type, line.parts.map(part => part.text).join('')])

describe('сравнение текстов', () => {
	it('diffSequence: общие начало и конец, вставка и удаление в середине', () => {
		expect(diffSequence(['a', 'b', 'c', 'd'], ['a', 'x', 'c', 'd'])).toEqual(['equal', 'removed', 'added', 'equal', 'equal'])
		expect(diffSequence(['a', 'b'], ['b', 'c'])).toEqual(['removed', 'equal', 'added'])
		expect(diffSequence([], ['a'])).toEqual(['added'])
		expect(diffSequence(['a'], [])).toEqual(['removed'])
	})

	it('diffSequence: очень большие входы — середина заменена целиком', () => {
		const before = Array.from({ length: 2001 }, (_, index) => `a${index}`)
		const after = Array.from({ length: 2001 }, (_, index) => `b${index}`)
		const changes = diffSequence(before, after)

		expect(changes).toHaveLength(4002)
		expect(changes.slice(0, 2001).every(change => change === 'removed')).toBe(true)
		expect(changes.slice(2001).every(change => change === 'added')).toBe(true)
	})

	it('splitLines: пустой текст — без строк, переводы строк Windows и Unix', () => {
		expect([splitLines(''), splitLines('a\r\nb\nc')]).toEqual([[], ['a', 'b', 'c']])
	})

	it('diffWords: общие слова и пробелы вместе, изменённые — отдельно', () => {
		expect(diffWords('Срок 10 рабочих дней', 'Срок 5 рабочих дней')).toEqual({
			removed: [
				{ text: 'Срок ', type: 'equal' },
				{ text: '10', type: 'removed' },
				{ text: ' рабочих дней', type: 'equal' },
			],
			added: [
				{ text: 'Срок ', type: 'equal' },
				{ text: '5', type: 'added' },
				{ text: ' рабочих дней', type: 'equal' },
			],
		})
	})

	it('diffLines: удалённые строки блока перед добавленными, номера строк, слова в похожей паре', () => {
		const lines = diffLines('Срок 10 дней\nОплата сразу\nСпоры в суде', 'Срок 5 дней\nСпоры в суде\nГарантия год')

		expect(texts(lines)).toEqual([
			['removed', 'Срок 10 дней'],
			['removed', 'Оплата сразу'],
			['added', 'Срок 5 дней'],
			['equal', 'Споры в суде'],
			['added', 'Гарантия год'],
		])
		expect(lines.map(line => [line.before, line.after])).toEqual([
			[1, undefined],
			[2, undefined],
			[undefined, 1],
			[3, 2],
			[undefined, 3],
		])
		expect(lines[0].parts.map(part => part.type)).toEqual(['equal', 'removed', 'equal'])
		expect(lines[2].parts.map(part => part.type)).toEqual(['equal', 'added', 'equal'])
	})

	it('diffLines: непохожие строки и isWordDiff: false — без выделения слов', () => {
		expect(diffLines('Совсем другое', 'Ничего общего')[0].parts).toEqual([{ text: 'Совсем другое', type: 'equal' }])
		expect(diffLines('Срок 10 дней', 'Срок 5 дней', false)[1].parts).toEqual([{ text: 'Срок 5 дней', type: 'equal' }])
	})

	it('splitRows: пары напротив, строка без пары — с пустой половиной', () => {
		const rows = splitRows(diffLines('a\nb\nc', 'x\nc\ny'))

		expect(rows.map(row => [row.left?.before, row.right?.after])).toEqual([
			[1, 1],
			[2, undefined],
			[3, 2],
			[undefined, 3],
		])
	})
})
