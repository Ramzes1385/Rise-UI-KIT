import { edge, group, map, node } from '../../fixtures/flowData'
import { diffFlowData } from '../../../../../model/data/flowDiff'
import type { FlowChange } from '../../../../../types/data/flowReview.types'

describe('diffFlowData', () => {
	it('одинаковые данные — нет изменений', () => {
		const data = map({ nodes: [node('a', { tags: ['x'], metrics: [{ id: 'm', label: 'M', value: 1 }] })], edges: [] })
		expect(diffFlowData(data, structuredClone(data))).toEqual([])
	})

	it('изменение корня — одна запись root с patch и previous, списки не входят', () => {
		const base = map({ title: 'A', nodes: [node('a')] })
		const target = map({ title: 'B', description: 'D', nodes: [node('a'), node('b')] })
		const root = diffFlowData(base, target).find(change => change.type === 'root')
		expect(root).toEqual({ type: 'root', patch: { title: 'B', description: 'D' }, previous: { title: 'A', description: undefined } })
	})

	it('вложенные объекты сравниваются по значению', () => {
		const base = map({ layout: { direction: 'LR', options: { a: 1 } } })
		expect(diffFlowData(base, map({ layout: { direction: 'LR', options: { a: 1 } } }))).toEqual([])
		expect(diffFlowData(base, map({ layout: { direction: 'LR', options: { a: 2 } } }))).toHaveLength(1)
	})

	it('массив и объект с одинаковыми ключами не равны', () => {
		const base = map({ nodes: [node('a', { tags: ['x'] })] })
		const target = map({ nodes: [node('a', { tags: { 0: 'x' } as never })] })
		expect(diffFlowData(base, target)).toHaveLength(1)
	})

	it('null и объект, разная длина массивов — отличия', () => {
		const base = map({ nodes: [node('a', { meta: { v: null } })] })
		expect(diffFlowData(base, map({ nodes: [node('a', { meta: { v: {} } })] }))).toHaveLength(1)
		expect(diffFlowData(map({ nodes: [node('a', { tags: ['x'] })] }), map({ nodes: [node('a', { tags: ['x', 'y'] })] }))).toHaveLength(
			1,
		)
	})

	it('изменённый элемент — update только с изменившимися полями, id не в патче', () => {
		const base = map({ nodes: [node('a', { status: 'ok' })] })
		const target = map({ nodes: [node('a', { label: 'Новая', status: undefined })] })
		expect(diffFlowData(base, target)).toEqual([
			{
				type: 'update',
				entity: 'node',
				id: 'a',
				patch: { label: 'Новая', status: undefined },
				previous: { label: 'a', status: 'ok' },
			},
		])
	})

	it('удалённые элементы идут с конца списка, добавленные — с их индексом, после обновлений', () => {
		const base = map({ nodes: [node('a'), node('b'), node('c')], edges: [edge('e', ['a', 'b'])] })
		const target = map({ nodes: [node('x'), node('b', { label: 'B' })], edges: [] })
		const changes = diffFlowData(base, target)
		const idOf = (change: FlowChange): string => (change.type === 'add' ? change.value.id : ((change as { id?: string }).id ?? ''))
		expect(changes.map(change => `${change.type}:${idOf(change)}`)).toEqual(['update:b', 'remove:c', 'remove:a', 'add:x', 'remove:e'])
		const removeA = changes.find(change => change.type === 'remove' && change.id === 'a')
		expect(removeA).toMatchObject({ index: 0, entity: 'node' })
		expect(changes.find(change => change.type === 'add')).toMatchObject({ index: 0 })
	})

	it('необязательные списки: отсутствие равно пустому, группы и сценарии учитываются', () => {
		expect(diffFlowData(map(), map({ groups: [] }))).toEqual([])
		expect(diffFlowData(map({ groups: [group('g')] }), map())).toEqual([
			{ type: 'remove', entity: 'group', id: 'g', value: group('g'), index: 0 },
		])
		const added = diffFlowData(map(), map({ scenarios: [{ id: 's' } as never] }))
		expect(added).toEqual([{ type: 'add', entity: 'scenario', value: { id: 's' }, index: 0 }])
	})
})
