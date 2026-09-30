import { setLocale } from '@/locales/state'
import { buildJsonTree, childPath, expandedUpTo, jsonPreview, jsonType } from '../../model/json/jsonTree'

describe('дерево JSON', () => {
	afterEach(() => setLocale('ru'))

	it('jsonType: объект, массив, строка, число, логическое; всё вне JSON — null', () => {
		expect([{}, [], 'a', 1, true, null, undefined, () => 1].map(jsonType)).toEqual([
			'object',
			'array',
			'string',
			'number',
			'boolean',
			'null',
			'null',
			'null',
		])
	})

	it('childPath: индекс в скобках, имя через точку, остальное — в кавычках', () => {
		expect([childPath('$', 0), childPath('$', 'user'), childPath('$.a', 'last visit'), childPath('$', '1st')]).toEqual([
			'$[0]',
			'$.user',
			'$.a["last visit"]',
			'$["1st"]',
		])
	})

	it('jsonPreview: сводка по языку, пустые {} и [], строка в кавычках', () => {
		expect(jsonPreview({ a: 1, b: 2, c: 3 }, 'object')).toBe('3 ключа')
		expect(jsonPreview([1, 2, 3, 4, 5], 'array')).toBe('5 элементов')
		expect([jsonPreview({}, 'object'), jsonPreview([], 'array')]).toEqual(['{}', '[]'])
		expect([jsonPreview('Анна', 'string'), jsonPreview(2.5, 'number'), jsonPreview(false, 'boolean')]).toEqual([
			'"Анна"',
			'2.5',
			'false',
		])
		expect(jsonPreview(undefined, 'null')).toBe('null')
		setLocale('en')
		expect(jsonPreview({ a: 1 }, 'object')).toBe('1 key')
	})

	it('корень-объект: его ключи — корни дерева, пути и глубина раскрываемых узлов', () => {
		const tree = buildJsonTree({ id: 7, user: { name: 'Анна', tags: ['a'] }, empty: [] })

		expect(tree.items.map(node => node.label)).toEqual(['id: 7', 'user: 2 ключа', 'empty: []'])
		expect(tree.items[1].children?.map(node => node.id)).toEqual(['$.user.name', '$.user.tags'])
		expect(tree.items[2].children).toBeUndefined()
		expect([...tree.depths]).toEqual([
			['$.user', 0],
			['$.user.tags', 1],
		])
		expect(tree.views.get('$.user.tags[0]')).toEqual({ path: '$.user.tags[0]', key: '0', type: 'string', preview: '"a"' })
		expect(expandedUpTo(tree.depths, 1)).toEqual(['$.user'])
		expect(expandedUpTo(tree.depths, 0)).toEqual([])
	})

	it('значение или пустой объект в корне — один узел без ключа', () => {
		expect(buildJsonTree('строка').items).toEqual([{ id: '$', label: '"строка"' }])
		expect(buildJsonTree({}).items).toEqual([{ id: '$', label: '{}' }])
	})
})
