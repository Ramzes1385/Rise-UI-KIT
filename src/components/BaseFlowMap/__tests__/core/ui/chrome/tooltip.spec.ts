import { render } from '@testing-library/vue'
import { buildFlowGraph } from '../../../../model/data/flowGraph'
import { computed, defineComponent, h, ref, shallowRef } from 'vue'
import type { FlowRoute } from '../../../../types/api/flowLayout.types'
import { useFlowTooltip } from '../../../../model/chrome/useFlowTooltip'
import { FLOW_MAP_CONTEXT } from '../../../../model/context/flowContext'
import type { FlowMapContext } from '../../../../types/internal/flowModel.types'

const data = {
	version: 1 as const,
	nodes: [
		{ id: 'a', kind: 'service', label: 'A' },
		{ id: 'b', kind: 'service', label: 'B' },
	],
	edges: [
		{ id: 'e1', source: 'a', target: 'b' },
		{ id: 'e2', source: 'b', target: 'a' },
	],
}

function setup(routes: Record<string, FlowRoute> = {}, options: { isCompact?: boolean } = {}) {
	const hovered = ref<string | null>(null)
	const focused = ref<string | null>(null)
	const context = {
		hovered,
		focused,
		viewport: ref({ x: 10, y: 20, zoom: 2 }),
		isCompact: ref(options.isCompact ?? false),
		model: {
			graph: computed(() => buildFlowGraph(data)),
			layout: shallowRef({ nodes: { a: { x: 100, y: 50, width: 80, height: 40 } } }),
			routes: shallowRef(routes),
		},
	} as unknown as FlowMapContext
	let tooltip!: ReturnType<typeof useFlowTooltip>
	const Host = defineComponent({
		setup() {
			tooltip = useFlowTooltip()
			return () => h('div')
		},
	})
	render(Host, { global: { provide: { [FLOW_MAP_CONTEXT as symbol]: context } } })
	return { hovered, focused, tooltip }
}

const withLabel = (x: number, y: number): FlowRoute => ({ path: '', points: [], label: { point: { x, y } } as FlowRoute['label'] })

describe('useFlowTooltip', () => {
	it('без наведения и фокуса подсказки нет', () => {
		const { tooltip } = setup()
		expect(tooltip.isShown.value).toBe(false)
		expect(tooltip.style.value).toBeNull()
		expect(tooltip.props.value).toEqual({ target: { entity: 'edge', id: '' }, node: undefined, edge: undefined })
	})

	it('у узла подсказка стоит под его серединой с учётом сдвига и масштаба карты', () => {
		const { tooltip, hovered } = setup()
		hovered.value = 'a'
		expect(tooltip.isShown.value).toBe(true)
		expect(tooltip.style.value).toEqual({ left: '290px', top: '208px' })
		expect(tooltip.props.value).toMatchObject({ target: { entity: 'node', id: 'a' }, node: { id: 'a' }, edge: undefined })
	})

	it('наведение важнее фокуса; без наведения подсказка следует за фокусом', () => {
		const { tooltip, hovered, focused } = setup()
		focused.value = 'a'
		expect(tooltip.props.value.target.id).toBe('a')
		hovered.value = 'e1'
		expect(tooltip.props.value.target).toEqual({ entity: 'edge', id: 'e1' })
	})

	it('у связи подсказка стоит у точки подписи маршрута', () => {
		const { tooltip, hovered } = setup({ e1: withLabel(30, 40) })
		hovered.value = 'e1'
		expect(tooltip.style.value).toEqual({ left: '70px', top: '108px' })
		expect(tooltip.props.value).toMatchObject({ target: { entity: 'edge', id: 'e1' }, edge: { id: 'e1' }, node: undefined })
	})

	it('связь без маршрута или без точки подписи не показывает подсказку', () => {
		const { tooltip, hovered } = setup({ e2: { path: '', points: [], label: null } })
		hovered.value = 'e1'
		expect(tooltip.isShown.value).toBe(false)
		hovered.value = 'e2'
		expect(tooltip.isShown.value).toBe(false)
	})

	it('узел без места в раскладке подсказку не показывает', () => {
		const { tooltip, hovered } = setup()
		hovered.value = 'b'
		expect(tooltip.isShown.value).toBe(false)
	})

	it('на узком экране подсказки нет', () => {
		const { tooltip, hovered } = setup({}, { isCompact: true })
		hovered.value = 'a'
		expect(tooltip.isShown.value).toBe(false)
	})
})
