import type { ReviewAdapter } from '../../../../types/internal/review/reviewCore.types'
import { buildReviewMarks, buildSuggestionMarks, diffFields, isReviewEqual, markGlyph, markKey } from '../../../../model/review/reviewDiff'

interface Fake {
	id: string
	kind: 'add' | 'remove' | 'rename' | 'move' | 'update'
	fields?: [string, unknown, unknown][]
	value?: unknown
	skip?: boolean
}

const fake: ReviewAdapter<Fake> = {
	describe: change =>
		change.skip
			? null
			: {
					kind: change.kind,
					entity: 'item',
					id: change.id,
					fields: (change.fields ?? []).map(([field, before, after]) => ({ field, before, after })),
					value: change.value,
				},
}

describe('isReviewEqual', () => {
	it('сравнивает примитивы, объекты и массивы по значению', () => {
		expect(isReviewEqual(1, 1)).toBe(true)
		expect(isReviewEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })).toBe(true)
		expect(isReviewEqual({ a: 1 }, { a: 2 })).toBe(false)
		expect(isReviewEqual({ a: 1 }, { a: 1, b: 1 })).toBe(false)
		expect(isReviewEqual([1], { 0: 1 })).toBe(false)
		expect(isReviewEqual(null, {})).toBe(false)
		expect(isReviewEqual({}, null)).toBe(false)
		expect(isReviewEqual(1, '1')).toBe(false)
	})
})

describe('diffFields', () => {
	it('даёт только поля, где было и стало различаются, включая убранные и новые', () => {
		const fields = diffFields({ label: 'B', color: 'red', same: 1 }, { label: 'A', size: 4, same: 1 })
		expect(fields).toEqual([
			{ field: 'label', before: 'A', after: 'B' },
			{ field: 'color', before: undefined, after: 'red' },
			{ field: 'size', before: 4, after: undefined },
		])
	})
})

describe('buildReviewMarks', () => {
	it('ключ метки — сущность и id', () => {
		expect(markKey('node', 'a')).toBe('node:a')
	})

	it('пропускает то, что адаптер не показывает', () => {
		expect(buildReviewMarks([{ id: 'a', kind: 'add', skip: true }], fake)).toEqual([])
	})

	it('несколько правок одного поля сливаются в одну метку: было от первой, стало от последней', () => {
		const marks = buildReviewMarks(
			[
				{ id: 'a', kind: 'rename', fields: [['label', 'A', 'B']] },
				{ id: 'a', kind: 'rename', fields: [['label', 'B', 'C']] },
			],
			fake,
		)
		expect(marks).toHaveLength(1)
		expect(marks[0]).toMatchObject({ kind: 'rename', fields: [{ field: 'label', before: 'A', after: 'C' }] })
	})

	it('правка, вернувшая значение, не оставляет поля', () => {
		const marks = buildReviewMarks(
			[
				{ id: 'a', kind: 'rename', fields: [['label', 'A', 'B']] },
				{ id: 'a', kind: 'rename', fields: [['label', 'B', 'A']] },
			],
			fake,
		)
		expect(marks[0].fields).toEqual([])
	})

	it('разные поля одного элемента собираются вместе, вид становится update', () => {
		const marks = buildReviewMarks(
			[
				{ id: 'a', kind: 'rename', fields: [['label', 'A', 'B']] },
				{ id: 'a', kind: 'move', fields: [['position', 1, 2]] },
			],
			fake,
		)
		expect(marks[0].kind).toBe('update')
		expect(marks[0].fields.map(item => item.field)).toEqual(['label', 'position'])
	})

	it('вид не меняется, если оба изменения одного вида', () => {
		const marks = buildReviewMarks(
			[
				{ id: 'a', kind: 'move', fields: [['position', 1, 2]] },
				{ id: 'a', kind: 'move', fields: [['position', 2, 3]] },
			],
			fake,
		)
		expect(marks[0].kind).toBe('move')
	})

	it('add с последующим update остаётся add и берёт новое значение', () => {
		const marks = buildReviewMarks(
			[
				{ id: 'a', kind: 'add', value: { label: 'A' } },
				{ id: 'a', kind: 'update', fields: [['label', 'A', 'B']], value: { label: 'B' } },
			],
			fake,
		)
		expect(marks[0]).toMatchObject({ kind: 'add', value: { label: 'B' } })
	})

	it('add с последующим update без значения сохраняет прежнее значение', () => {
		const marks = buildReviewMarks(
			[
				{ id: 'a', kind: 'add', value: { label: 'A' } },
				{ id: 'a', kind: 'update', fields: [['label', 'A', 'B']] },
			],
			fake,
		)
		expect(marks[0]).toMatchObject({ kind: 'add', value: { label: 'A' } })
	})

	it('add и затем remove — метка remove без полей', () => {
		const marks = buildReviewMarks(
			[
				{ id: 'a', kind: 'add', value: 1 },
				{ id: 'a', kind: 'remove' },
			],
			fake,
		)
		expect(marks[0]).toMatchObject({ kind: 'remove', fields: [] })
	})

	it('update, затем add — add; update, затем remove — remove', () => {
		const addAfter = buildReviewMarks(
			[
				{ id: 'a', kind: 'update', fields: [['x', 1, 2]] },
				{ id: 'a', kind: 'add' },
			],
			fake,
		)
		const removeAfter = buildReviewMarks(
			[
				{ id: 'a', kind: 'update', fields: [['x', 1, 2]] },
				{ id: 'a', kind: 'remove' },
			],
			fake,
		)
		expect(addAfter[0].kind).toBe('add')
		expect(removeAfter[0].kind).toBe('remove')
	})

	it('remove, затем add — add (элемент вернули)', () => {
		const marks = buildReviewMarks(
			[
				{ id: 'a', kind: 'remove', value: 'old' },
				{ id: 'a', kind: 'add', value: 'new' },
			],
			fake,
		)
		expect(marks[0].kind).toBe('add')
	})

	it('значение берётся первое, а если его нет — из следующей правки', () => {
		const marks = buildReviewMarks(
			[
				{ id: 'a', kind: 'update', fields: [['x', 1, 2]] },
				{ id: 'a', kind: 'update', fields: [['y', 1, 2]], value: 'late' },
			],
			fake,
		)
		expect(marks[0].value).toBe('late')
	})
})

describe('buildSuggestionMarks', () => {
	it('метки предложений помечены id и автором', () => {
		const marks = buildSuggestionMarks(
			[
				{ id: 's1', author: { name: 'Анна' }, changes: [{ id: 'a', kind: 'add' as const }] },
				{ id: 's2', author: { name: 'Борис' }, changes: [{ id: 'b', kind: 'remove' as const }] },
			],
			fake,
		)
		expect(marks.map(item => [item.suggestionId, item.author, item.id])).toEqual([
			['s1', 'Анна', 'a'],
			['s2', 'Борис', 'b'],
		])
	})
})

describe('markGlyph', () => {
	it('+ − → ~', () => {
		expect(markGlyph('add')).toBe('+')
		expect(markGlyph('remove')).toBe('−')
		expect(markGlyph('move')).toBe('→')
		expect(markGlyph('rename')).toBe('~')
		expect(markGlyph('update')).toBe('~')
	})
})
