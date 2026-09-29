import { filterMentionOptions, findMentionQuery, insertMention } from '../../model/mentionText'

describe('текст упоминаний', () => {
	it('findMentionQuery: триггер в начале или после пробела, без пробелов после него', () => {
		expect(findMentionQuery('@ан', 3, '@')).toEqual({ query: 'ан', start: 0, end: 3 })
		expect(findMentionQuery('Привет, @ivan.p', 15, '@')).toEqual({ query: 'ivan.p', start: 8, end: 15 })
		expect(findMentionQuery('mail@example', 12, '@')).toBeNull()
		expect(findMentionQuery('@anna привет', 12, '@')).toBeNull()
		expect(findMentionQuery('задача ++12', 11, '++')).toEqual({ query: '12', start: 7, end: 11 })
		expect(findMentionQuery('цена $5', 7, '$')).toEqual({ query: '5', start: 5, end: 7 })
	})

	it('filterMentionOptions: по имени и нику, ё как е, не больше limit', () => {
		const options = [
			{ value: 'fedor', label: 'Фёдор' },
			{ value: 'fedya', label: 'Федя' },
			{ value: 'anna', label: 'Анна' },
		]
		expect(filterMentionOptions(options, 'федо', 5)).toEqual([options[0]])
		expect(filterMentionOptions(options, 'FED', 1)).toEqual([options[0]])
		expect(filterMentionOptions(options, '', 5)).toHaveLength(3)
	})

	it('insertMention: заменяет набранное, добавляет пробел, если его нет', () => {
		expect(insertMention('См. @iv', { query: 'iv', start: 4, end: 7 }, '@ivan')).toEqual({ text: 'См. @ivan ', caret: 10 })
		expect(insertMention('@an текст', { query: 'an', start: 0, end: 3 }, '@anna')).toEqual({ text: '@anna текст', caret: 6 })
	})
})
