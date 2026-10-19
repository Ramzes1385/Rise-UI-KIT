import { computed, ref } from 'vue'
import { createHarness } from '../fixtures/modelHarness'
import { edge, group, map, node } from '../fixtures/flowData'
import { useFlowEdges } from '../../../../model/render/useFlowEdges'
import { useFlowNodes } from '../../../../model/render/useFlowNodes'
import { useFlowGroups } from '../../../../model/render/useFlowGroups'
import type { FlowNotation } from '../../../../types/api/flowNotation.types'
import type { FlowLayoutInput } from '../../../../types/api/flowLayout.types'
import type { FlowRenderSource } from '../../../../types/internal/core/flowRenderInternal.types'

const bare: FlowNotation = {
	id: 'bare',
	label: () => 'Bare',
	nodeKinds: { box: { label: () => 'Box', render: 'html', shape: { shape: 'rect' }, size: { width: 100, height: 40 } } },
	edgeKinds: { link: { label: () => 'Link', stroke: 'solid' } },
	groupKinds: { plain: { label: () => 'Plain', layout: 'box' } },
	defaultNodeKind: 'box',
	defaultEdgeKind: 'link',
}

function echo({ nodes }: FlowLayoutInput) {
	const placed = nodes
		.filter(item => item.id !== 'skipped')
		.map((item, index) => [item.id, { ...item.size, x: index * 150, y: 0 }] as const)
	const rects = Object.fromEntries([...placed, ['ghost', { x: 0, y: 200, width: 100, height: 40 }] as const])
	return { nodes: rects, groups: { plain: { x: -10, y: -10, width: 400, height: 80 } }, bounds: { x: 0, y: 0, width: 400, height: 240 } }
}

function setup() {
	const data = map({
		notation: 'bare',
		layout: { algorithm: 'echo' },
		nodes: [node('a', { kind: 'box', group: 'plain' }), node('b', { kind: 'box' }), node('skipped', { kind: 'box' })],
		edges: [edge('e1', ['a', 'b']), edge('e2', ['a', 'ghost']), edge('e3', ['ghost', 'b'])],
		groups: [group('plain', { kind: 'plain' })],
	})
	const { model } = createHarness(data, {
		props: { notations: [bare], plugins: [{ name: 'echo', layouts: [{ id: 'echo', run: echo }] }] },
	})
	const source: FlowRenderSource = {
		model,
		map: { focused: ref(null), isCompact: ref(false) } as never,
		active: computed(() => null),
		tabIndexOf: () => -1,
	}
	return { model, source }
}

describe('элементы карты с неполными данными', () => {
	it('узел, которого раскладка не вернула, не рисуется', () => {
		const { source } = setup()
		expect(useFlowNodes(source).value.map(item => item.id)).toEqual(['a', 'b'])
	})

	it('вид группы без заголовка и рамки получает запасные: сверху и сплошная', () => {
		const { model } = setup()
		const [item] = useFlowGroups(model).value
		expect(item).toMatchObject({ id: 'plain', header: 'top', border: 'solid' })
	})

	it('связь без маркеров не получает ни начального, ни конечного', () => {
		const { source } = setup()
		const [first] = useFlowEdges(source).value
		expect(first).toMatchObject({ id: 'e1', markerStart: null, markerEnd: null })
	})

	it('связь с узлом, которого нет в данных (конец или начало), подписывается его id', () => {
		const { source } = setup()
		const items = useFlowEdges(source).value
		expect(items.find(item => item.id === 'e2')?.ariaLabel).toContain('ghost')
		expect(items.find(item => item.id === 'e3')?.ariaLabel).toContain('ghost')
	})
})
