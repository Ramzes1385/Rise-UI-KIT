import type { FlowChange } from '../../../types/data/flowReview.types'
import { flowAuthor, flowReviewAdapter } from '../../../model/review/flowReviewAdapter'
import { addEdgeD, addNodeD, moveB, removeC, renameA, reviewData } from '../fixtures/reviewHarness'

const { describe: describeChange, isApplicable } = flowReviewAdapter as Required<typeof flowReviewAdapter>

describe('flowReviewAdapter.describe', () => {
	it('смена подписи — rename с полем label', () => {
		expect(describeChange(renameA)).toMatchObject({
			kind: 'rename',
			entity: 'node',
			id: 'a',
			fields: [{ field: 'label', before: 'Alpha', after: 'Альфа' }],
		})
	})

	it('смена только позиции — move', () => {
		expect(describeChange(moveB)).toMatchObject({ kind: 'move', id: 'b' })
	})

	it('смена прочих или нескольких полей — update', () => {
		const color: FlowChange = { type: 'update', entity: 'node', id: 'a', patch: { color: 'red' }, previous: {} }
		const both: FlowChange = {
			type: 'update',
			entity: 'node',
			id: 'a',
			patch: { label: 'B', position: { x: 1, y: 1 } },
			previous: { label: 'A', position: { x: 0, y: 0 } },
		}
		expect(describeChange(color)?.kind).toBe('update')
		expect(describeChange(both)?.kind).toBe('update')
	})

	it('update без реальной разницы — update без полей', () => {
		const same: FlowChange = { type: 'update', entity: 'node', id: 'a', patch: { label: 'A' }, previous: { label: 'A' } }
		expect(describeChange(same)).toMatchObject({ kind: 'update', fields: [] })
	})

	it('add берёт id из значения, у связи в refs — её концы', () => {
		expect(describeChange(addNodeD)).toMatchObject({ kind: 'add', id: 'd', refs: undefined })
		expect(describeChange(addEdgeD)).toMatchObject({ kind: 'add', entity: 'edge', id: 'e3', refs: ['b', 'd'] })
	})

	it('remove хранит удалённый элемент', () => {
		expect(describeChange(removeC)).toMatchObject({ kind: 'remove', id: 'c', value: { label: 'Gamma' } })
	})

	it('поля корня в «Правках» не показываются', () => {
		expect(describeChange({ type: 'root', patch: { title: 'B' }, previous: { title: 'A' } })).toBeNull()
	})
})

describe('flowReviewAdapter.isApplicable', () => {
	const data = reviewData({ groups: [{ id: 'g', kind: 'zone', label: 'G' }] })

	it('add применим, пока такого id нет', () => {
		expect(isApplicable(data, addNodeD)).toBe(true)
		expect(isApplicable(data, { ...addNodeD, value: { id: 'a', kind: 'service', label: 'Копия' } })).toBe(false)
	})

	it('remove и update требуют, чтобы элемент был', () => {
		expect(isApplicable(data, removeC)).toBe(true)
		expect(isApplicable(data, { ...removeC, id: 'zzz' })).toBe(false)
		expect(isApplicable(data, { ...renameA, id: 'zzz' })).toBe(false)
	})

	it('update применим, пока прежние значения совпадают с данными', () => {
		expect(isApplicable(data, renameA)).toBe(true)
		expect(isApplicable(data, { ...renameA, previous: { label: 'Другое' } })).toBe(false)
		expect(isApplicable(data, moveB)).toBe(true)
		expect(isApplicable(data, { ...moveB, previous: { position: { x: 1, y: 1 } } })).toBe(false)
	})

	it('группы ищутся в groups, а карта без групп и сценариев не ломается', () => {
		const rename: FlowChange = { type: 'update', entity: 'group', id: 'g', patch: { label: 'H' }, previous: { label: 'G' } }
		expect(isApplicable(data, rename)).toBe(true)
		expect(isApplicable(reviewData(), rename)).toBe(false)
		const scenario: FlowChange = { type: 'remove', entity: 'scenario', id: 's', value: { id: 's' } as never, index: 0 }
		expect(isApplicable(reviewData(), scenario)).toBe(false)
	})

	it('изменение корня применимо всегда', () => {
		expect(isApplicable(data, { type: 'root', patch: { title: 'B' }, previous: { title: 'A' } })).toBe(true)
	})
})

describe('flowAuthor', () => {
	it('без пользователя — автор с пустым именем', () => {
		expect(flowAuthor(undefined)).toEqual({ name: '' })
		expect(flowAuthor({ name: 'Анна' })).toEqual({ name: 'Анна' })
	})
})
