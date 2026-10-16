import { directorySections } from '../../model/directory/directorySections'
import type { ResolvedImageMapObject } from '../../types/internal/imageMapModel.types'
import type { ImageMapDirectoryEntry } from '../../types/internal/ImageMapDirectory.types'
import type { ImageMapFilter, ImageMapGroup, ImageMapObject } from '../../types/imageMapData.types'
import { DIRECTORY_FILTERS, DIRECTORY_GROUPS, directoryData } from './imageMapDirectory.test-utils'
import {
	filterOptions,
	initialFilterValues,
	matchesFilters,
	matchesSearch,
	normalizeText,
	searchText,
} from '../../model/directory/filterUtils'

function object(overrides: Partial<ImageMapObject> = {}): ImageMapObject {
	return { id: 'x', type: 'point', title: 'Объект', x: 0, y: 0, ...overrides } as ImageMapObject
}

function resolved(overrides: Partial<ImageMapObject> = {}, group?: ImageMapGroup): ResolvedImageMapObject {
	return { object: object(overrides), group } as ResolvedImageMapObject
}

function entry(title: string, groupId?: string): ImageMapDirectoryEntry {
	const group = DIRECTORY_GROUPS.find(item => item.id === groupId)
	return { item: resolved({ id: title, title }, group), layerTitle: undefined, isActive: false, isHovered: false }
}

const [GROUPS, TAGS, SWITCH, SELECT] = DIRECTORY_FILTERS as [ImageMapFilter, ImageMapFilter, ImageMapFilter, ImageMapFilter]

describe('filterUtils — текст и поиск', () => {
	it('normalizeText: нижний регистр, ё → е, пробелы схлопываются', () => {
		expect(normalizeText('  Ёлка   НА\tплощади ')).toBe('елка на площади')
	})

	it('searchText собирает название, описание, группу и keywords', () => {
		const text = searchText(resolved({ title: 'Магазин', description: 'Одежда', keywords: ['Джинсы'] }, DIRECTORY_GROUPS[1]))
		expect(text).toBe('магазин одежда магазины джинсы')
		expect(searchText(resolved({ title: 'Касса' }))).toBe('касса')
	})

	it('matchesSearch: все слова запроса, без регистра и ё; пустой запрос — всё', () => {
		const text = searchText(resolved({ title: 'Ёлка', keywords: ['кофе'] }, DIRECTORY_GROUPS[0]))
		expect(matchesSearch(text, 'ЕЛКА')).toBe(true)
		expect(matchesSearch(text, '  кофе   кафе ')).toBe(true)
		expect(matchesSearch(text, 'кофе чай')).toBe(false)
		expect(matchesSearch(text, '   ')).toBe(true)
		expect(matchesSearch(text, '')).toBe(true)
	})
})

describe('filterUtils — фильтры', () => {
	it('filterOptions: свои варианты или группы; без групп — пусто', () => {
		expect(filterOptions(TAGS, directoryData())).toBe(TAGS.options)
		expect(filterOptions(GROUPS, directoryData())).toEqual([
			{ value: 'food', label: 'Кафе' },
			{ value: 'shops', label: 'Магазины' },
		])
		expect(filterOptions(GROUPS, directoryData({ groups: undefined }))).toEqual([])
	})

	it('без выбора объект подходит; фильтр без options сравнивает группу', () => {
		expect(matchesFilters(object(), DIRECTORY_FILTERS, {})).toBe(true)
		expect(matchesFilters(object(), [GROUPS], { groups: [] })).toBe(true)
		expect(matchesFilters(object({ group: 'food' }), [GROUPS], { groups: ['food', 'shops'] })).toBe(true)
		expect(matchesFilters(object({ group: 'food' }), [GROUPS], { groups: ['shops'] })).toBe(false)
		expect(matchesFilters(object(), [GROUPS], { groups: ['food'] })).toBe(false)
	})

	it('or — любое из выбранного, and — всё; без tags — не подходит', () => {
		const orFilter = { ...TAGS, logic: 'or' as const }
		const wifi = object({ tags: ['wifi'] })
		expect(matchesFilters(wifi, [orFilter], { amenities: ['wifi', 'parking'] })).toBe(true)
		expect(matchesFilters(wifi, [TAGS], { amenities: ['wifi', 'parking'] })).toBe(false)
		expect(matchesFilters(object({ tags: ['parking', 'wifi'] }), [TAGS], { amenities: ['wifi', 'parking'] })).toBe(true)
		expect(matchesFilters(object(), [orFilter], { amenities: ['wifi'] })).toBe(false)
	})

	it('select игнорирует logic and: одно значение — «любое из»', () => {
		const select = { ...SELECT, logic: 'and' as const }
		expect(matchesFilters(object({ tags: ['alpha'] }), [select], { brand: ['alpha', 'beta'] })).toBe(true)
		expect(matchesFilters(object({ tags: ['gamma'] }), [select], { brand: ['alpha'] })).toBe(false)
	})

	it('разные фильтры — «и»', () => {
		const shop = object({ group: 'shops', tags: ['open'] })
		expect(matchesFilters(shop, [GROUPS, SWITCH], { groups: ['shops'], open: ['open'] })).toBe(true)
		expect(matchesFilters(shop, [GROUPS, SWITCH], { groups: ['food'], open: ['open'] })).toBe(false)
	})

	it('initialFilterValues берёт непустые value и копирует массивы', () => {
		const value = ['wifi']
		const result = initialFilterValues([{ ...TAGS, value }, { ...GROUPS, value: [] }, SWITCH])
		expect(result).toEqual({ amenities: ['wifi'] })
		expect(result.amenities).not.toBe(value)
	})
})

describe('directorySections', () => {
	const base = { groups: DIRECTORY_GROUPS, locale: 'ru', otherTitle: 'Другое' }
	const entries = [entry('Магазин 10', 'shops'), entry('Магазин 2', 'shops'), entry('Ёлка', 'food'), entry('банкомат')]

	it('group: порядок групп из данных, внутри numeric-сортировка, без группы — «Другое» в конце', () => {
		const sections = directorySections({ ...base, entries, groupBy: 'group' })
		expect(sections.map(section => section.title)).toEqual(['Кафе', 'Магазины', 'Другое'])
		expect(sections[1]?.entries.map(item => item.item.object.title)).toEqual(['Магазин 2', 'Магазин 10'])
		expect(sections[2]?.id).toBe('')
	})

	it('group: пустые группы и пустой «Другое» не показываются', () => {
		const sections = directorySections({ ...base, entries: [entry('Магазин 2', 'shops')], groupBy: 'group' })
		expect(sections.map(section => section.id)).toEqual(['shops'])
	})

	it('alpha: разделы по первой букве, ё → Е, пустое название — «#»', () => {
		const sections = directorySections({ ...base, entries: [...entries, entry('Еда'), entry('')], groupBy: 'alpha' })
		expect(sections.map(section => section.title)).toEqual(['#', 'Б', 'Е', 'М'])
		expect(sections[2]?.entries.map(item => item.item.object.title)).toEqual(['Еда', 'Ёлка'])
	})

	it('alpha: письмо без регистра и символы вне BMP не ломают разделы; регистр — по языку', () => {
		const cjk = [entry('東京タワー'), entry('𠮷野家'), entry('北京'), entry('istanbul')]
		const sections = directorySections({ ...base, locale: 'ja-JP', entries: cjk, groupBy: 'alpha' })
		expect(sections.map(section => section.title).sort()).toEqual(['I', '北', '東', '𠮷'].sort())
		expect(directorySections({ ...base, locale: 'tr-TR', entries: [entry('istanbul')], groupBy: 'alpha' })[0]?.title).toBe('İ')
	})

	it('none: один раздел без заголовка; пусто — без разделов', () => {
		const sections = directorySections({ ...base, entries, groupBy: 'none' })
		expect(sections).toHaveLength(1)
		expect(sections[0]).toMatchObject({ id: 'all', title: '' })
		expect(sections[0]?.entries.map(item => item.item.object.title)).toEqual(['банкомат', 'Ёлка', 'Магазин 2', 'Магазин 10'])
		expect(directorySections({ ...base, entries: [], groupBy: 'none' })).toEqual([])
	})
})
