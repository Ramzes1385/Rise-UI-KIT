import { edge, map, node } from '../fixtures/flowData'
import { createHarness } from '../fixtures/modelHarness'
import type { FlowMetric } from '../../../../types/data/flowData.types'

const data = map({
	nodes: [node('a', { metrics: [{ id: 'cpu', label: 'CPU', value: 1 }] }), node('b'), node('c')],
	edges: [edge('e1', ['a', 'b']), edge('e2', ['b', 'c'])],
})

describe('контроллер: выделение, подсветка, живые данные', () => {
	it('select: replace, add, toggle; шлёт update:selection', () => {
		const { controller, eventsOf } = createHarness(data)
		controller.select(['a'])
		controller.select(['b', 'a'], 'add')
		expect(controller.getSelection()).toEqual(['a', 'b'])
		controller.select(['a', 'c'], 'toggle')
		expect(controller.getSelection()).toEqual(['b', 'c'])
		controller.select(['c'], 'replace')
		expect(controller.getSelection()).toEqual(['c'])
		expect(eventsOf('update:selection')).toHaveLength(4)
	})

	it('начальное выделение берётся из пропсов и следует за ними', async () => {
		const { controller, props } = createHarness(data, { props: { selection: ['b'] } })
		expect(controller.getSelection()).toEqual(['b'])
		props.selection = ['c']
		await Promise.resolve()
		expect(controller.getSelection()).toEqual(['c'])
		props.selection = undefined
		await Promise.resolve()
		expect(controller.getSelection()).toEqual([])
	})

	it('highlightPath по списку и по концам: возвращает id связей, подсвечивает их узлы', () => {
		const { controller, model } = createHarness(data)
		expect(controller.highlightPath(['e1'])).toEqual(['e1'])
		expect([...model.highlighted.value].sort()).toEqual(['a', 'b', 'e1'])
		expect(controller.highlightPath({ from: 'a', to: 'c' })).toEqual(['e1', 'e2'])
		expect([...model.highlighted.value].sort()).toEqual(['a', 'b', 'c', 'e1', 'e2'])
		controller.clearHighlight()
		expect(model.highlighted.value.size).toBe(0)
	})

	it('setStatus и setLive меняют живое состояние узлов и связей', () => {
		const { controller, model } = createHarness(data)
		controller.setStatus('a', 'error')
		controller.setStatus('e1', 'warning')
		expect(model.live.value.nodes?.a.status).toBe('error')
		expect(model.live.value.edges?.e1.status).toBe('warning')
		controller.setStatus('a', null)
		expect(model.live.value.nodes?.a.status).toBeUndefined()
		controller.setLive({ nodes: { b: { badge: 3 } } })
		controller.setLive({ nodes: { b: { status: 'ok' } }, edges: { e2: { traffic: { rate: 5 } } } })
		expect(model.live.value.nodes?.b).toEqual({ badge: 3, status: 'ok' })
		expect(model.live.value.edges?.e2.traffic).toEqual({ rate: 5 })
		controller.setLive({})
		expect(model.live.value.nodes?.b).toEqual({ badge: 3, status: 'ok' })
	})

	it('setMetrics заменяет метрики по id и добавляет новые, поверх данных или прежних живых', () => {
		const { controller, model } = createHarness(data)
		const cpu: FlowMetric = { id: 'cpu', label: 'CPU', value: 90 }
		const ram: FlowMetric = { id: 'ram', label: 'RAM', value: 3 }
		controller.setMetrics('a', [cpu, ram])
		expect(model.live.value.nodes?.a.metrics).toEqual([cpu, ram])
		controller.setMetrics('a', [{ id: 'ram', label: 'RAM', value: 4 }])
		expect(model.live.value.nodes?.a.metrics).toEqual([cpu, { id: 'ram', label: 'RAM', value: 4 }])
		controller.setMetrics('b', [ram])
		expect(model.live.value.nodes?.b.metrics).toEqual([ram])
		controller.setMetrics('ghost', [ram])
		expect(model.live.value.nodes?.ghost.metrics).toEqual([ram])
	})

	it('живые данные из пропсов обновляются вместе с ними', async () => {
		const { model, props } = createHarness(data, { props: { live: { nodes: { a: { status: 'ok' } } } } })
		expect(model.live.value.nodes?.a.status).toBe('ok')
		props.live = { nodes: { a: { status: 'down' } } }
		await Promise.resolve()
		expect(model.live.value.nodes?.a.status).toBe('down')
		props.live = undefined
		await Promise.resolve()
		expect(model.live.value).toEqual({})
	})

	it('exportJson отдаёт данные текстом, getGraph — граф, validate шлёт событие validate', () => {
		const { controller, eventsOf } = createHarness(map({ nodes: [node('a')], edges: [edge('e', ['a', 'ghost'])] }))
		expect(JSON.parse(controller.exportJson()).nodes).toHaveLength(1)
		expect(controller.getGraph().nodes.has('a')).toBe(true)
		const issues = controller.validate()
		expect(issues.map(item => item.code)).toContain('missing-node')
		expect(eventsOf('validate').at(-1)).toEqual(issues)
	})

	it('экспорт изображений без холста даёт пустой результат, вид — запасной', async () => {
		const { controller } = createHarness(data)
		expect(await controller.exportSvg()).toBe('')
		expect((await controller.exportPng()).type).toBe('image/png')
		expect(controller.getViewport()).toEqual({ x: 0, y: 0, zoom: 1 })
		controller.setViewport({ x: 5, y: 6, zoom: 2 })
		expect(controller.getViewport()).toEqual({ x: 5, y: 6, zoom: 2 })
		expect(() => {
			controller.fitView()
			controller.focus('a')
			controller.zoom('in')
		}).not.toThrow()
	})

	it('setView подменяет запасной вид настоящим', async () => {
		const { controller, model } = createHarness(data)
		const view = {
			fitView: vi.fn(),
			focus: vi.fn(),
			zoom: vi.fn(),
			getViewport: vi.fn(() => ({ x: 1, y: 2, zoom: 3 })),
			setViewport: vi.fn(),
			exportSvg: vi.fn(async () => '<svg/>'),
			exportPng: vi.fn(async () => new Blob(['x'])),
		}
		model.setView(view)
		controller.fitView({ padding: 10 })
		controller.focus('a', { isZoomed: true })
		controller.zoom(2)
		controller.setViewport({ x: 0, y: 0, zoom: 1 }, { isAnimated: false })
		expect(controller.getViewport()).toEqual({ x: 1, y: 2, zoom: 3 })
		expect(await controller.exportSvg({ area: 'content' })).toBe('<svg/>')
		expect((await controller.exportPng()).size).toBe(1)
		expect(view.fitView).toHaveBeenCalledWith({ padding: 10 })
		expect(view.focus).toHaveBeenCalledWith('a', { isZoomed: true })
		expect(view.zoom).toHaveBeenCalledWith(2)
		expect(view.setViewport).toHaveBeenCalledWith({ x: 0, y: 0, zoom: 1 }, { isAnimated: false })
	})
})
