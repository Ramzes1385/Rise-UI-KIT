import { allIds, isSameSelection, normalizeSelection, parseStoredSelection } from '../model/cookieSelection'

const CATEGORIES = [
	{ id: 'necessary', label: 'Необходимые', isRequired: true },
	{ id: 'analytics', label: 'Аналитика' },
	{ id: 'ads', label: 'Реклама' },
]

describe('cookieSelection', () => {
	it('normalizeSelection: добавляет обязательные, отбрасывает неизвестные, порядок по categories', () => {
		expect(normalizeSelection(['ads', 'unknown'], CATEGORIES)).toEqual(['necessary', 'ads'])
		expect(normalizeSelection(['ads', 'analytics'], CATEGORIES)).toEqual(['necessary', 'analytics', 'ads'])
		expect(normalizeSelection([], CATEGORIES)).toEqual(['necessary'])
		expect(normalizeSelection(['a'], [])).toEqual([])
	})

	it('allIds: id всех категорий по порядку', () => {
		expect(allIds(CATEGORIES)).toEqual(['necessary', 'analytics', 'ads'])
		expect(allIds([])).toEqual([])
	})

	it('isSameSelection: сравнивает длину и порядок', () => {
		expect(isSameSelection(['a', 'b'], ['a', 'b'])).toBe(true)
		expect(isSameSelection([], [])).toBe(true)
		expect(isSameSelection(['a'], ['a', 'b'])).toBe(false)
		expect(isSameSelection(['a', 'b'], ['b', 'a'])).toBe(false)
	})

	it('parseStoredSelection: массив строк возвращается как есть', () => {
		expect(parseStoredSelection('["a","b"]')).toEqual(['a', 'b'])
		expect(parseStoredSelection('[]')).toEqual([])
	})

	it('parseStoredSelection: null, битый JSON и не массив строк — null', () => {
		expect(parseStoredSelection(null)).toBeNull()
		expect(parseStoredSelection('{oops')).toBeNull()
		expect(parseStoredSelection('{"a":1}')).toBeNull()
		expect(parseStoredSelection('"a"')).toBeNull()
		expect(parseStoredSelection('[1,2]')).toBeNull()
		expect(parseStoredSelection('["a",1]')).toBeNull()
	})
})
