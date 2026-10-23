import { UI_FLOW_PANELS } from '@/locales/messages'
import { panelsSource } from '../../../model/panels/detailsView'
import { FLOW_SHAPES } from '../../../types/api/flowNotation.types'
import type { FlowMapData } from '../../../types/data/flowData.types'
import type { FlowNotation } from '../../../types/api/flowNotation.types'
import type { FlowLiveState } from '../../../types/api/flowController.types'
import type { FlowLegendRow } from '../../../types/internal/flowPanels.types'
import { buildLegendRows, edgeSample, shapePath } from '../../../model/panels/legendRows'
import { createFakeContext, panelsData, panelsNotation } from '../../fixtures/panelsContext'

function rowsOf(options: { data?: FlowMapData; notation?: FlowNotation; live?: FlowLiveState } = {}): FlowLegendRow[] {
	return buildLegendRows(panelsSource(createFakeContext(options).context))
}

describe('легенда: строки', () => {
	it('без объявленной легенды показывает виды узлов, виды связей и статусы, которые есть на карте — в таком порядке', () => {
		expect(rowsOf().map(row => row.id)).toEqual([
			'node:service',
			'node:db',
			'node:partner',
			'edge:call',
			'edge:event',
			'status:ok',
			'status:error',
			'status:down',
			'status:degraded',
		])
	})

	it('вид узла показывается один раз, с подписью вида и фигурой', () => {
		const nodeRows = rowsOf().filter(row => row.entity === 'node')
		expect(nodeRows.map(row => [row.label, row.shape])).toEqual([
			['Сервис', 'round-rect'],
			['База', 'cylinder'],
			['Партнёр', 'rect'],
		])
	})

	it('внешняя система помечена по виду или по самому узлу', () => {
		const data = panelsData()
		data.nodes.push({ id: 'ext', kind: 'service', label: 'Внешний', isExternal: true })
		const byId = Object.fromEntries(rowsOf({ data }).map(row => [row.id, row]))
		expect(byId['node:partner']!.isExternal).toBe(true)
		expect(byId['node:service']!.isExternal).toBeUndefined()
		const flipped = panelsData()
		flipped.nodes.unshift({ id: 'ext', kind: 'service', label: 'Внешний', isExternal: true })
		expect(rowsOf({ data: flipped }).find(row => row.id === 'node:service')!.isExternal).toBe(true)
	})

	it('связь без вида берёт вид по умолчанию нотации; образец связи несёт штрих, концы и цвет', () => {
		const edgeRows = rowsOf().filter(row => row.entity === 'edge')
		expect(edgeRows.map(row => row.label)).toEqual(['Вызов', 'Событие'])
		expect(edgeRows[0]!.edge).toEqual({ stroke: 'solid', startMarker: undefined, endMarker: 'arrow', color: undefined })
		expect(edgeRows[1]!.edge).toEqual({ stroke: 'dashed', startMarker: 'circle', endMarker: 'open-arrow', color: 'var(--rise-info)' })
	})

	it('статусы идут по порядку: встроенные, затем свои из данных; неиспользуемые не показываются', () => {
		const data = panelsData()
		data.nodes = [{ id: 'a', kind: 'service', label: 'A', status: 'unknown' }]
		data.edges = []
		expect(
			rowsOf({ data })
				.filter(row => row.entity === 'status')
				.map(row => row.id),
		).toEqual(['status:unknown'])
	})

	it('статусы живых данных тоже попадают в легенду', () => {
		const data = panelsData()
		data.nodes = [{ id: 'a', kind: 'service', label: 'A' }]
		data.edges = [{ id: 'e', source: 'a', target: 'a' }]
		const live: FlowLiveState = { nodes: { a: { status: 'ok' } }, edges: { e: { status: 'error' }, other: {} } }
		expect(
			rowsOf({ data, live })
				.filter(row => row.entity === 'status')
				.map(row => row.id),
		).toEqual(['status:ok', 'status:error'])
	})

	it('карта без узлов и связей даёт пустую легенду', () => {
		expect(rowsOf({ data: { version: 1, nodes: [], edges: [] } })).toEqual([])
	})

	it('строка статуса несёт значок, цвет и подпись', () => {
		const down = rowsOf().find(row => row.id === 'status:down')!
		expect(down.label).toBe(UI_FLOW_PANELS.STATUS_DOWN)
		expect(down.status).toMatchObject({ id: 'down', icon: 'minus' })
	})

	describe('легенда, объявленная нотацией', () => {
		const declared: FlowNotation = {
			...panelsNotation,
			legend: () => [
				{ id: 'l1', label: 'Микросервис', sample: { entity: 'node', kind: 'service' } },
				{ id: 'l2', label: 'Асинхронно', sample: { entity: 'edge', kind: 'event' } },
				{ id: 'l3', label: 'Падает', sample: { status: 'error' } },
				{ id: 'l4', label: 'Нет такого вида', sample: { entity: 'node', kind: 'ghost' } },
				{ id: 'l5', label: 'Нет такой связи', sample: { entity: 'edge', kind: 'ghost' } },
			],
		}

		it('показывает только объявленные строки со своими подписями; неизвестные виды пропускает', () => {
			const rows = rowsOf({ notation: declared })
			expect(rows.slice(0, 3).map(row => [row.id, row.entity, row.label])).toEqual([
				['l1', 'node', 'Микросервис'],
				['l2', 'edge', 'Асинхронно'],
				['l3', 'status', 'Падает'],
			])
			expect(rows.some(row => row.id === 'l4' || row.id === 'l5')).toBe(false)
		})

		it('объявленные строки образцов берут фигуру и штрих из видов нотации', () => {
			const rows = rowsOf({ notation: declared })
			expect(rows[0]).toMatchObject({ shape: 'round-rect' })
			expect(rows[1]!.edge).toMatchObject({ stroke: 'dashed', startMarker: 'circle' })
			expect(rows[2]!.status).toMatchObject({ id: 'error' })
		})

		it('к объявленным добавляются статусы с карты, которых там ещё нет', () => {
			const ids = rowsOf({ notation: declared }).map(row => row.id)
			expect(ids).toEqual(['l1', 'l2', 'l3', 'status:ok', 'status:down', 'status:degraded'])
		})

		it('пустая объявленная легенда возвращает автоматическую', () => {
			const empty: FlowNotation = { ...panelsNotation, legend: () => [] }
			expect(rowsOf({ notation: empty }).map(row => row.id)).toContain('node:service')
		})
	})
})

const EDGE_SAMPLE = { entity: 'edge', kind: 'x' } as const

describe('легенда: образцы', () => {
	it('shapePath даёт путь для каждой фигуры и прямоугольник по умолчанию', () => {
		for (const shape of FLOW_SHAPES) expect(shapePath(shape)).toMatch(/^M/)
		expect(shapePath(undefined)).toBe(shapePath('rect'))
		expect(new Set(FLOW_SHAPES.map(shapePath)).size).toBeGreaterThan(10)
	})

	it('связь без описания — сплошная линия без концов', () => {
		expect(edgeSample({ id: 'x', entity: 'edge', label: 'x', sample: EDGE_SAMPLE })).toEqual({ line: 'M1 7h22', dash: '', marks: [] })
	})

	it.each([
		['solid', ''],
		['dashed', '4 3'],
		['dotted', '1 3'],
	] as const)('штрих «%s»', (stroke, dash) => {
		expect(edgeSample({ id: 'x', entity: 'edge', label: 'x', sample: EDGE_SAMPLE, edge: { stroke } }).dash).toBe(dash)
	})

	it.each(['arrow', 'open-arrow', 'double-arrow'] as const)('конец «%s» рисуется; заливка только у закрытых стрелок', endMarker => {
		const marks = edgeSample({ id: 'x', entity: 'edge', label: 'x', sample: EDGE_SAMPLE, edge: { stroke: 'solid', endMarker } }).marks
		expect(marks.length).toBe(endMarker === 'double-arrow' ? 2 : 1)
		expect(marks.every(mark => mark.isFilled === (endMarker !== 'open-arrow'))).toBe(true)
	})

	it.each(['circle', 'diamond', 'slash'] as const)('начало «%s» рисуется без заливки и идёт перед концом', startMarker => {
		const marks = edgeSample({
			id: 'x',
			entity: 'edge',
			label: 'x',
			sample: EDGE_SAMPLE,
			edge: { stroke: 'solid', startMarker, endMarker: 'arrow' },
		}).marks
		expect(marks).toHaveLength(2)
		expect(marks[0]!.isFilled).toBe(false)
		expect(marks[1]!.isFilled).toBe(true)
	})

	it('концы «none» ничего не рисуют', () => {
		expect(
			edgeSample({
				id: 'x',
				entity: 'edge',
				label: 'x',
				sample: EDGE_SAMPLE,
				edge: { stroke: 'solid', startMarker: 'none', endMarker: 'none' },
			}).marks,
		).toEqual([])
	})
})
