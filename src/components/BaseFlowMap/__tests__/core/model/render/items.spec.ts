import { computed } from 'vue'
import { createHarness } from '../fixtures/modelHarness'
import { edge, group, map, node } from '../fixtures/flowData'
import { useFlowGroups } from '../../../../model/render/useFlowGroups'
import { useFlowEdges, useFlowLabels } from '../../../../model/render/useFlowEdges'
import type { FlowRenderSource } from '../../../../types/internal/core/flowRenderInternal.types'

function sourceOf(model: ReturnType<typeof createHarness>['model'], active: ReadonlySet<string> | null = null): FlowRenderSource {
	return { model, map: {} as never, active: computed(() => active), tabIndexOf: () => -1 }
}

describe('useFlowGroups', () => {
	it('вложенные группы идут от внешних к внутренним, с глубиной, видом и рамкой', () => {
		const data = map({
			groups: [
				group('inner', { kind: 'zone', parent: 'outer' }),
				group('outer', { kind: 'zone' }),
				group('deep', { kind: 'zone', parent: 'inner' }),
			],
			nodes: [node('a', { group: 'deep' })],
		})
		const { model } = createHarness(data)
		const items = useFlowGroups(model).value
		expect(items.map(item => item.id)).toEqual(['outer', 'inner', 'deep'])
		expect(items.map(item => item.depth)).toEqual([0, 1, 2])
		expect(items[0].header).toBe('top')
		expect(items[0].border).toBe('dashed')
		expect(items[0].rect.width).toBeGreaterThan(0)
	})

	it('карта без групп даёт пустой список', () => {
		const { model } = createHarness(map({ nodes: [node('a')] }))
		expect(useFlowGroups(model).value).toEqual([])
	})

	it('цепочка родителей глубже 16 не зацикливается', () => {
		const groups = Array.from({ length: 20 }, (_, index) =>
			group(`g${index}`, { kind: 'zone', parent: index > 0 ? `g${index - 1}` : undefined }),
		)
		const { model } = createHarness(map({ groups, nodes: [node('a', { group: 'g19' })] }))
		const items = useFlowGroups(model).value
		expect(Math.max(...items.map(item => item.depth))).toBeLessThanOrEqual(16)
	})
})

describe('useFlowEdges и useFlowLabels', () => {
	const data = map({
		nodes: [node('a', { label: 'Alpha' }), node('b', { label: 'Beta' }), node('c')],
		edges: [edge('e1', ['a', 'b'], { label: 'заказ', status: 'warning' }), edge('e2', ['a', 'c']), edge('e3', ['a', 'ghost'])],
	})

	it('связь без маршрута пропускается; подсветка и выбор попадают в элемент', () => {
		const { model } = createHarness(data)
		model.controller.select(['e1'])
		const items = useFlowEdges(sourceOf(model, new Set(['e1']))).value
		expect(items.map(item => item.id)).toEqual(['e1', 'e2'])
		expect(items[0]).toMatchObject({ isSelected: true, isHighlighted: true, isDim: false, tabIndex: -1 })
		expect(items[1]).toMatchObject({ isSelected: false, isHighlighted: false, isDim: true })
		expect(items[0].ariaLabel).toContain('Alpha')
	})

	it('подписи: только у связей с текстом и точкой; скрытые — пустой список', () => {
		const { model } = createHarness(data)
		const edges = useFlowEdges(sourceOf(model))
		const labels = useFlowLabels(
			edges,
			computed(() => false),
		).value
		expect(labels.map(item => item.text)).toEqual(['заказ'])
		expect(
			useFlowLabels(
				edges,
				computed(() => true),
			).value,
		).toEqual([])
		const noPoint = computed(() => edges.value.map(item => ({ ...item, route: { ...item.route, label: null } })))
		expect(
			useFlowLabels(
				noPoint as never,
				computed(() => false),
			).value,
		).toEqual([])
	})
})
