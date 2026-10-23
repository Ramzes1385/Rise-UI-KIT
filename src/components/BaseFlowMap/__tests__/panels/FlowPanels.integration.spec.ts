import '@testing-library/jest-dom/vitest'
import { flowDfd } from '../../model/notations/dfd'
import { flowIdef0 } from '../../model/notations/idef0'
import { flowIdef3 } from '../../model/notations/idef3'
import FlowLegend from '../../ui/panels/FlowLegend.vue'
import FlowDetails from '../../ui/panels/FlowDetails.vue'
import { render, screen, within } from '@testing-library/vue'
import type { FlowMapData } from '../../types/data/flowData.types'
import type { FlowNotation } from '../../types/api/flowNotation.types'
import type { FlowElementRef } from '../../types/data/flowReview.types'
import { createFakeContext, provideContext } from '../fixtures/panelsContext'
import { UI_FLOW_DFD, UI_FLOW_IDEF, UI_FLOW_PANELS } from '@/locales/messages'
import { boundary, edge, fn, idef0Diagram, mapData, node } from '../fixtures/idefData'

function mountPanel(component: typeof FlowLegend | typeof FlowDetails, options: Parameters<typeof createFakeContext>[0]) {
	return render(component, { global: provideContext(createFakeContext(options).context) })
}

function legend(notation: FlowNotation, data: FlowMapData) {
	return mountPanel(FlowLegend, { notation, data })
}

function details(notation: FlowNotation, data: FlowMapData, target: FlowElementRef) {
	return mountPanel(FlowDetails, { notation, data, details: target })
}

describe('панели на данных нотаций IDEF и DFD', () => {
	it('легенда IDEF0 называет виды узлов и связь словарём нотации', () => {
		const { nodes, edges } = idef0Diagram()
		legend(flowIdef0, mapData(nodes, edges, 'idef0'))
		const items = within(screen.getByRole('group', { name: UI_FLOW_PANELS.LEGEND }))
			.getAllByRole('listitem')
			.map(item => item.textContent?.trim())
		expect(items).toEqual([UI_FLOW_IDEF.BOUNDARY, UI_FLOW_IDEF.FUNCTION, UI_FLOW_IDEF.ARROW])
	})

	it('легенда IDEF3 показывает предшествование и отношение разными образцами', () => {
		const data = mapData(
			[node('a', 'uob'), node('b', 'uob'), node('r', 'referent')],
			[edge('e1', 'a>b'), edge('e2', 'a>r', { kind: 'relational' })],
		)
		const { container } = legend(flowIdef3, data)
		const labels = screen.getAllByRole('listitem').map(item => item.textContent?.trim())
		expect(labels).toEqual([UI_FLOW_IDEF.UOB, UI_FLOW_IDEF.REFERENT, UI_FLOW_IDEF.PRECEDENCE, UI_FLOW_IDEF.RELATIONAL])
		const lines = [...container.querySelectorAll('.base-flow-map__legend-line')]
		expect(lines.map(line => line.getAttribute('stroke-dasharray'))).toEqual(['', '4 3'])
	})

	it('легенда DFD: внешняя сущность помечена внешней системой', () => {
		const data = mapData([node('p', 'process'), node('s', 'store'), node('c', 'entity')], [edge('f', 'c>p')])
		const { container } = legend(flowDfd, data)
		const labels = screen.getAllByRole('listitem').map(item => item.textContent?.trim())
		expect(labels).toEqual([UI_FLOW_DFD.PROCESS, UI_FLOW_DFD.STORE, UI_FLOW_DFD.ENTITY, UI_FLOW_DFD.FLOW])
		const shapes = [...container.querySelectorAll('.base-flow-map__legend-shape')]
		expect(shapes.map(shape => shape.classList.contains('base-flow-map__legend-shape--external'))).toEqual([false, false, true])
	})

	it('подробности функции IDEF0: вид, кого вызывает и кто вызывает', () => {
		const { nodes, edges } = idef0Diagram()
		details(flowIdef0, mapData(nodes, edges, 'idef0'), { entity: 'node', id: 'a2' })
		const panel = screen.getByRole('region', { name: UI_FLOW_PANELS.DETAILS_NODE })
		expect(within(panel).getByText(UI_FLOW_IDEF.FUNCTION)).toBeInTheDocument()
		expect(screen.getByText(UI_FLOW_PANELS.DETAILS_CALLS).nextElementSibling).toHaveTextContent('a3')
		expect(screen.getByText(UI_FLOW_PANELS.DETAILS_CALLED_BY).nextElementSibling).toHaveTextContent('m1, a1')
	})

	it('подробности связи DFD: заголовок из концов, вид потока', () => {
		const data = mapData([fn('x'), node('c', 'entity', 'Клиент'), node('p', 'process', 'Заказ')], [edge('f', 'c>p')])
		details(flowDfd, data, { entity: 'edge', id: 'f' })
		const panel = screen.getByRole('region', { name: UI_FLOW_PANELS.DETAILS_EDGE })
		expect(within(panel).getByText('Клиент → Заказ')).toBeInTheDocument()
		expect(within(panel).getByText(`${UI_FLOW_DFD.FLOW} · Клиент → Заказ`)).toBeInTheDocument()
	})

	it('подробности граничной стрелки IDEF0', () => {
		details(flowIdef0, mapData([boundary('i1', 'input'), fn('a1', 'A1')], [edge('e1', 'i1>a1')], 'idef0'), {
			entity: 'node',
			id: 'i1',
		})
		expect(screen.getByText(UI_FLOW_IDEF.BOUNDARY)).toBeInTheDocument()
	})
})
