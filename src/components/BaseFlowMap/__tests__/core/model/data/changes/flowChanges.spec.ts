import { edge, group, map, node } from '../../fixtures/flowData'
import { diffFlowData } from '../../../../../model/data/flowDiff'
import type { FlowChange } from '../../../../../types/data/flowReview.types'
import { createRandom, mutate, randomChanges, randomData } from '../../fixtures/seeded'
import { applyFlowChanges, invertFlowChanges } from '../../../../../model/data/flowChanges'

const CASES = 200

describe('applyFlowChanges', () => {
	const base = map({ title: 'T', nodes: [node('a'), node('b')], edges: [edge('e', ['a', 'b'])] })

	it('add добавляет в конец без индекса и по индексу с ним', () => {
		const appended = applyFlowChanges(base, [{ type: 'add', entity: 'node', value: node('c') }])
		expect(appended.nodes.map(item => item.id)).toEqual(['a', 'b', 'c'])
		const inserted = applyFlowChanges(base, [{ type: 'add', entity: 'node', value: node('c'), index: 1 }])
		expect(inserted.nodes.map(item => item.id)).toEqual(['a', 'c', 'b'])
	})

	it.each([{ index: -1 }, { index: 99 }])('add с индексом $index вне списка кладёт в конец', ({ index }) => {
		const result = applyFlowChanges(base, [{ type: 'add', entity: 'node', value: node('c'), index }])
		expect(result.nodes.map(item => item.id)).toEqual(['a', 'b', 'c'])
	})

	it('add создаёт необязательный список (группы, сценарии)', () => {
		const result = applyFlowChanges(base, [{ type: 'add', entity: 'group', value: group('g') }])
		expect(result.groups?.map(item => item.id)).toEqual(['g'])
		const scenario = applyFlowChanges(base, [{ type: 'add', entity: 'scenario', value: { id: 's' } as never }])
		expect(scenario.scenarios).toHaveLength(1)
	})

	it('remove убирает элемент по id', () => {
		const result = applyFlowChanges(base, [{ type: 'remove', entity: 'edge', id: 'e', value: base.edges[0], index: 0 }])
		expect(result.edges).toEqual([])
		expect(result.nodes).toBe(base.nodes)
	})

	it('update сливает поля, undefined удаляет поле', () => {
		const withStatus = map({ nodes: [node('a', { status: 'ok' })] })
		const result = applyFlowChanges(withStatus, [
			{ type: 'update', entity: 'node', id: 'a', patch: { label: 'Новое', status: undefined }, previous: {} },
		])
		expect(result.nodes[0]).toEqual({ id: 'a', kind: 'service', label: 'Новое' })
		expect('status' in result.nodes[0]).toBe(false)
	})

	it('update несуществующего id не меняет данные', () => {
		const result = applyFlowChanges(base, [{ type: 'update', entity: 'node', id: 'zzz', patch: { label: 'X' }, previous: {} }])
		expect(result).toBe(base)
	})

	it('root меняет поля корня, undefined удаляет', () => {
		const result = applyFlowChanges(base, [{ type: 'root', patch: { title: undefined, description: 'D' }, previous: {} }])
		expect(result.description).toBe('D')
		expect('title' in result).toBe(false)
	})

	it('исходные данные не мутируются', () => {
		const snapshot = structuredClone(base)
		applyFlowChanges(base, [
			{ type: 'add', entity: 'node', value: node('c') },
			{ type: 'update', entity: 'node', id: 'a', patch: { label: 'Z' }, previous: {} },
		])
		expect(base).toEqual(snapshot)
	})

	it('без изменений возвращает те же данные', () => {
		expect(applyFlowChanges(base, [])).toBe(base)
	})
})

describe('invertFlowChanges', () => {
	it('инверсия идёт в обратном порядке и меняет тип', () => {
		const added = node('c')
		const changes: FlowChange[] = [
			{ type: 'add', entity: 'node', value: added },
			{ type: 'add', entity: 'node', value: node('d'), index: 0 },
			{ type: 'remove', entity: 'node', id: 'a', value: node('a'), index: 2 },
			{ type: 'update', entity: 'node', id: 'b', patch: { label: 'N' }, previous: { label: 'b' } },
			{ type: 'root', patch: { title: 'N' }, previous: { title: 'O' } },
		]
		expect(invertFlowChanges(changes)).toEqual([
			{ type: 'root', patch: { title: 'O' }, previous: { title: 'N' } },
			{ type: 'update', entity: 'node', id: 'b', patch: { label: 'b' }, previous: { label: 'N' } },
			{ type: 'add', entity: 'node', value: node('a'), index: 2 },
			{ type: 'remove', entity: 'node', id: 'd', value: node('d'), index: 0 },
			{ type: 'remove', entity: 'node', id: 'c', value: added, index: -1 },
		])
	})

	it('пустой список — пустая инверсия', () => {
		expect(invertFlowChanges([])).toEqual([])
	})
})

describe('пустой необязательный список', () => {
	it('remove последнего элемента убирает поле, откат add тоже', () => {
		const data = map({ nodes: [node('a')], groups: [group('g')] })
		const removed = applyFlowChanges(data, [{ type: 'remove', entity: 'group', id: 'g', value: group('g'), index: 0 }])
		expect('groups' in removed).toBe(false)
		const added = applyFlowChanges(map({ nodes: [node('a')] }), [{ type: 'add', entity: 'group', value: group('g') }])
		expect('groups' in applyFlowChanges(added, invertFlowChanges([{ type: 'add', entity: 'group', value: group('g') }]))).toBe(false)
	})
})

describe('свойства на случайных наборах (зерно)', () => {
	it(`apply ∘ invert = id на ${CASES} наборах`, () => {
		for (let seed = 1; seed <= CASES; seed += 1) {
			const random = createRandom(seed)
			const data = randomData(random)
			const changes = randomChanges(random, data, applyFlowChanges)
			const changed = applyFlowChanges(data, changes)
			const restored = applyFlowChanges(changed, invertFlowChanges(changes))
			expect(restored, `зерно ${seed}`).toEqual(data)
		}
	})

	it(`apply(base, diff(base, target)) = target на ${CASES} наборах`, () => {
		for (let seed = 1; seed <= CASES; seed += 1) {
			const random = createRandom(seed * 7919)
			const base = randomData(random)
			const target = mutate(random, base)
			const changes = diffFlowData(base, target)
			expect(applyFlowChanges(base, changes), `зерно ${seed}`).toEqual(target)
			expect(applyFlowChanges(target, invertFlowChanges(changes)), `обратно, зерно ${seed}`).toEqual(base)
		}
	})

	it('diff одинаковых данных пуст', () => {
		for (let seed = 1; seed <= 20; seed += 1) {
			const data = randomData(createRandom(seed))
			expect(diffFlowData(data, structuredClone(data))).toEqual([])
		}
	})
})
