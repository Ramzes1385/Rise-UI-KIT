import { findTypeaheadIndex, toMenuGroups } from '../menuUtils'

describe('toMenuGroups', () => {
	it('плоский список — одна группа, группы — как есть, пустой — без групп', () => {
		const copy = { label: 'Копировать' }
		const paste = { label: 'Вставить' }
		expect(toMenuGroups([copy, paste])).toEqual([[copy, paste]])
		expect(toMenuGroups([[copy], [paste]])).toEqual([[copy], [paste]])
		expect(toMenuGroups([])).toEqual([])
	})
})

describe('findTypeaheadIndex', () => {
	const labels = ['Копировать', 'Вставить', 'Выделить всё', 'Удалить']

	it('одна буква ищется после текущего пункта по кругу, без учёта регистра', () => {
		expect(findTypeaheadIndex(labels, 'в', -1)).toBe(1)
		expect(findTypeaheadIndex(labels, 'В', 1)).toBe(2)
		expect(findTypeaheadIndex(labels, 'в', 2)).toBe(1)
	})

	it('повтор одной буквы перебирает пункты на эту букву', () => {
		expect(findTypeaheadIndex(labels, 'вв', 1)).toBe(2)
	})

	it('несколько разных букв уточняют совпадение начиная с текущего пункта', () => {
		expect(findTypeaheadIndex(labels, 'вы', 1)).toBe(2)
		expect(findTypeaheadIndex(labels, 'вс', 1)).toBe(1)
		expect(findTypeaheadIndex(labels, 'уд', -1)).toBe(3)
	})

	it('без совпадений — -1', () => {
		expect(findTypeaheadIndex(labels, 'я', 0)).toBe(-1)
		expect(findTypeaheadIndex([], 'а', -1)).toBe(-1)
	})
})
