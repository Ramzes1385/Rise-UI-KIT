import type { ReviewSuggestion } from '../../../../types/data/flowReview.types'
import type { ReviewAdapter, ReviewChangeInfo } from '../../../../types/internal/review/reviewCore.types'
import {
	countSuggestions,
	createSuggestionView,
	describeChanges,
	filterSuggestions,
	groupChanges,
	initialsOf,
	sortSuggestions,
	suggestionAuthors,
	summarizeChanges,
	toTimestamp,
} from '../../../../model/review/reviewSuggestions'

interface FakeChange {
	id: string
	value: string
	links?: string[]
	kind?: ReviewChangeInfo['kind']
	skip?: boolean
}

const fake: ReviewAdapter<FakeChange, { values: Record<string, string> }> = {
	describe: change =>
		change.skip
			? null
			: { kind: change.kind ?? 'update', entity: 'item', id: change.id, fields: [], value: change.value, refs: change.links },
	isApplicable: (data, change) => data.values[change.id] !== undefined,
}

function proposal(id: string, changes: FakeChange[], extra: Partial<ReviewSuggestion<FakeChange>> = {}): ReviewSuggestion<FakeChange> {
	return { id, author: { name: 'Анна' }, date: 1000, changes, status: 'open', ...extra }
}

describe('toTimestamp', () => {
	it('принимает Date, число и ISO-строку', () => {
		expect(toTimestamp(new Date(5))).toBe(5)
		expect(toTimestamp(7)).toBe(7)
		expect(toTimestamp('2026-01-01T00:00:00.000Z')).toBe(Date.UTC(2026, 0, 1))
	})
})

describe('describeChanges и summarizeChanges с чужим типом изменения', () => {
	it('пропускает изменения, которые адаптер не показывает', () => {
		const infos = describeChanges(
			[
				{ id: 'a', value: '1' },
				{ id: 'b', value: '2', skip: true },
			],
			fake,
		)
		expect(infos.map(item => item.id)).toEqual(['a'])
	})

	it('считает добавленное, убранное и изменённое; один элемент в изменениях — один раз', () => {
		const infos = describeChanges(
			[
				{ id: 'a', value: '', kind: 'add' },
				{ id: 'b', value: '', kind: 'add' },
				{ id: 'c', value: '', kind: 'remove' },
				{ id: 'd', value: '', kind: 'rename' },
				{ id: 'd', value: '', kind: 'move' },
				{ id: 'e', value: '', kind: 'update' },
			],
			fake,
		)
		expect(summarizeChanges(infos)).toEqual([
			{ kind: 'add', entity: 'item', count: 2 },
			{ kind: 'remove', entity: 'item', count: 1 },
			{ kind: 'update', entity: 'item', count: 2 },
		])
	})
})

describe('createSuggestionView', () => {
	const data = { values: { a: 'x' } }

	it('вид предложения: один вид изменений или mixed', () => {
		const same = createSuggestionView(proposal('s', [{ id: 'a', value: '', kind: 'add' }]), { data }, fake)
		const mixed = createSuggestionView(
			proposal('s', [
				{ id: 'a', value: '', kind: 'add' },
				{ id: 'b', value: '', kind: 'remove' },
			]),
			{ data },
			fake,
		)
		expect(same.kind).toBe('add')
		expect(mixed.kind).toBe('mixed')
		expect(same.time).toBe(1000)
	})

	it('устарело, когда версия не совпала с базовой', () => {
		const view = createSuggestionView(proposal('s', [{ id: 'a', value: '' }], { baseVersion: 'v1' }), { data, versionId: 'v2' }, fake)
		expect(view.isStale).toBe(true)
	})

	it('не устарело при той же версии или когда версия неизвестна', () => {
		const same = createSuggestionView(proposal('s', [{ id: 'a', value: '' }], { baseVersion: 'v1' }), { data, versionId: 'v1' }, fake)
		const unknown = createSuggestionView(proposal('s', [{ id: 'a', value: '' }], { baseVersion: 'v1' }), { data }, fake)
		const noBase = createSuggestionView(proposal('s', [{ id: 'a', value: '' }]), { data, versionId: 'v9' }, fake)
		expect([same.isStale, unknown.isStale, noBase.isStale]).toEqual([false, false, false])
	})

	it('устарело при конфликте с данными по isApplicable', () => {
		const view = createSuggestionView(proposal('s', [{ id: 'gone', value: '' }]), { data }, fake)
		expect(view.isStale).toBe(true)
	})

	it('без isApplicable конфликта нет', () => {
		const lenient: ReviewAdapter<FakeChange> = { describe: fake.describe }
		const view = createSuggestionView(proposal('s', [{ id: 'gone', value: '' }]), { data }, lenient)
		expect(view.isStale).toBe(false)
	})

	it('принятое и отклонённое не бывает устаревшим', () => {
		const view = createSuggestionView(
			proposal('s', [{ id: 'gone', value: '' }], { status: 'accepted', baseVersion: 'v1' }),
			{ data, versionId: 'v2' },
			fake,
		)
		expect(view.isStale).toBe(false)
	})
})

describe('сортировка, фильтры, счётчики, авторы', () => {
	const list = [
		proposal('old', [], { date: 1000 }),
		proposal('new', [], { date: '2026-01-01T00:00:00.000Z', author: { name: 'Борис' } }),
		proposal('done', [], { date: new Date(2000), status: 'accepted' }),
		proposal('no', [], { date: 3000, status: 'declined', author: { name: 'Борис' } }),
	]

	it('новые сверху, исходный список не меняется', () => {
		expect(sortSuggestions(list).map(item => item.id)).toEqual(['new', 'no', 'done', 'old'])
		expect(list[0].id).toBe('old')
	})

	it('all показывает всё, isDoneShown=false прячет разобранные', () => {
		expect(filterSuggestions(list, { show: 'all' })).toHaveLength(4)
		expect(filterSuggestions(list, { show: 'all', isDoneShown: false }).map(item => item.id)).toEqual(['old', 'new'])
	})

	it('open оставляет только ждущие решения', () => {
		expect(filterSuggestions(list, { show: 'open' }).map(item => item.id)).toEqual(['old', 'new'])
	})

	it('mine оставляет предложения текущего пользователя', () => {
		expect(filterSuggestions(list, { show: 'mine', currentUser: 'Борис' }).map(item => item.id)).toEqual(['new', 'no'])
	})

	it('скрытые авторы не показываются', () => {
		const hidden = new Set(['Борис'])
		expect(filterSuggestions(list, { show: 'all', hiddenAuthors: hidden }).map(item => item.id)).toEqual(['old', 'done'])
	})

	it('счётчики по состояниям', () => {
		expect(countSuggestions(list)).toEqual({ open: 2, accepted: 1, declined: 1 })
	})

	it('авторы без повторов, в порядке появления', () => {
		expect(suggestionAuthors(list).map(item => item.name)).toEqual(['Анна', 'Борис'])
	})
})

describe('initialsOf', () => {
	it('две первые буквы имени', () => {
		expect(initialsOf('анна ковалёва петровна')).toBe('АК')
		expect(initialsOf('  Борис ')).toBe('Б')
		expect(initialsOf('')).toBe('')
		expect(initialsOf('   ')).toBe('')
	})
})

describe('groupChanges', () => {
	it('узел и его связь идут одной группой, несвязанное — отдельными', () => {
		const changes: FakeChange[] = [
			{ id: 'n1', value: '' },
			{ id: 'e1', value: '', links: ['n1', 'n2'] },
			{ id: 'n3', value: '' },
		]
		const groups = groupChanges(changes, fake)
		expect(groups.map(group => group.map(item => item.id))).toEqual([['n1', 'e1'], ['n3']])
	})

	it('цепочка связей объединяет всех', () => {
		const changes: FakeChange[] = [
			{ id: 'n1', value: '' },
			{ id: 'n2', value: '' },
			{ id: 'n3', value: '' },
			{ id: 'e1', value: '', links: ['n1', 'n2'] },
			{ id: 'e2', value: '', links: ['n2', 'n3'] },
		]
		expect(groupChanges(changes, fake)).toHaveLength(1)
	})

	it('связь на элемент вне изменений ничего не объединяет, а изменения без описания идут общей группой', () => {
		const changes: FakeChange[] = [
			{ id: 'e1', value: '', links: ['outside'] },
			{ id: 'r1', value: '', skip: true },
			{ id: 'r2', value: '', skip: true },
		]
		const groups = groupChanges(changes, fake)
		expect(groups.map(group => group.map(item => item.id))).toEqual([['e1'], ['r1', 'r2']])
	})

	it('пустой список — нет групп', () => {
		expect(groupChanges([], fake)).toEqual([])
	})
})
