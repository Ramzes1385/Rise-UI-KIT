import { formatNumber } from '@/locales/state'
import { UI_FLOW_PANELS } from '@/locales/messages'
import type { FlowMapData } from '../../../types/data/flowData.types'
import type { FlowElementRef } from '../../../types/data/flowReview.types'
import type { FlowLiveState } from '../../../types/api/flowController.types'
import { createFakeContext, panelsData } from '../../fixtures/panelsContext'
import { buildDetails, panelsSource, sheetViewport } from '../../../model/panels/detailsView'

function view(target: FlowElementRef, options: { data?: FlowMapData; live?: FlowLiveState } = {}) {
	return buildDetails(target, panelsSource(createFakeContext(options).context))
}

describe('подробности: данные для показа', () => {
	describe('узел', () => {
		it('заголовок, вид с технологией, дорожка и описание', () => {
			expect(view({ entity: 'node', id: 'api' })).toMatchObject({
				entity: 'node',
				id: 'api',
				title: 'API',
				kind: 'Сервис · Go',
				lane: { label: 'Ядро', color: 'var(--rise-primary)' },
				description: 'Принимает заказы',
			})
		})

		it('вид без технологии — только название вида; без группы дорожки нет', () => {
			const lonely = view({ entity: 'node', id: 'lonely' })!
			expect(lonely.kind).toBe('Сервис')
			expect(lonely.lane).toBeUndefined()
			expect(lonely.description).toBeUndefined()
			expect(lonely.status).toBeUndefined()
		})

		it('метрики: число форматируется языком кита, единица, тренд и статус дописываются', () => {
			const metrics = view({ entity: 'node', id: 'api' })!.metrics
			expect(metrics).toEqual([
				{ key: 'rps', label: 'Запросы', value: `${formatNumber(1250)} rps ↑ (${UI_FLOW_PANELS.STATUS_WARNING})` },
				{ key: 'p99', label: 'p99', value: '120 мс ↓' },
				{ key: 'err', label: 'Ошибки', value: `${formatNumber(2)} →` },
			])
		})

		it('живые метрики заменяют свои по id и добавляют новые', () => {
			const live: FlowLiveState = {
				nodes: {
					api: {
						metrics: [
							{ id: 'rps', label: 'Запросы', value: 5 },
							{ id: 'cpu', label: 'CPU', value: 40, unit: '%' },
						],
					},
				},
			}
			const metrics = view({ entity: 'node', id: 'api' }, { live })!.metrics
			expect(metrics.map(item => item.key)).toEqual(['rps', 'p99', 'err', 'cpu'])
			expect(metrics[0]!.value).toBe(formatNumber(5))
			expect(metrics[3]!.value).toBe(`${formatNumber(40)} %`)
		})

		it('узел без своих метрик показывает живые', () => {
			const live: FlowLiveState = { nodes: { lonely: { metrics: [{ id: 'm', label: 'M', value: 1 }] } } }
			expect(view({ entity: 'node', id: 'lonely' }, { live })!.metrics).toHaveLength(1)
		})

		it('статус: встроенный, свой из данных, живой главнее своего', () => {
			expect(view({ entity: 'node', id: 'api' })!.status).toMatchObject({ id: 'ok', label: UI_FLOW_PANELS.STATUS_OK })
			expect(view({ entity: 'node', id: 'bank' })!.status).toMatchObject({ id: 'degraded', label: 'Деградация' })
			const live: FlowLiveState = { nodes: { api: { status: 'down' } } }
			expect(view({ entity: 'node', id: 'api' }, { live })!.status).toMatchObject({ id: 'down' })
		})

		it('«Вызывает» и «Вызывают»: подписи соседей без повторов', () => {
			const api = view({ entity: 'node', id: 'api' })!
			expect(api.calls).toEqual(['Заказы БД', 'Банк'])
			expect(api.calledBy).toEqual(['Банк'])
			const db = view({ entity: 'node', id: 'db' })!
			expect(db.calls).toEqual([])
			expect(db.calledBy).toEqual(['API'])
		})

		it('соседи с одинаковой подписью схлопываются, а несуществующий сосед называется по id', () => {
			const data = panelsData()
			data.nodes.push({ id: 'twin', kind: 'service', label: 'Банк' })
			data.edges.push({ id: 'e4', source: 'api', target: 'twin' }, { id: 'e5', source: 'api', target: 'ghost' })
			expect(view({ entity: 'node', id: 'api' }, { data })!.calls).toEqual(['Заказы БД', 'Банк', 'ghost'])
		})

		it('поля, ответственный и ссылки берутся из узла', () => {
			const api = view({ entity: 'node', id: 'api' })!
			expect(api.fields.map(field => field.id)).toEqual(['repo', 'ver'])
			expect(api.owner).toMatchObject({ name: 'Платежи' })
			expect(api.links.map(link => link.label)).toEqual(['Документация', 'Дашборд'])
			const lonely = view({ entity: 'node', id: 'lonely' })!
			expect(lonely.fields).toEqual([])
			expect(lonely.links).toEqual([])
			expect(lonely.owner).toBeUndefined()
		})

		it('неизвестный узел — ничего', () => {
			expect(view({ entity: 'node', id: 'ghost' })).toBeNull()
		})
	})

	describe('связь', () => {
		it('заголовок — подпись связи, вид и концы, статус и описание', () => {
			expect(view({ entity: 'edge', id: 'e1' })).toMatchObject({
				entity: 'edge',
				id: 'e1',
				title: 'запись',
				kind: 'Вызов · API → Заказы БД',
				description: 'Пишет заказы',
				status: { id: 'error' },
				calls: [],
				calledBy: [],
				fields: [],
				links: [],
			})
		})

		it('без подписи заголовок — «откуда → куда», вид по умолчанию берётся у нотации', () => {
			const edge = view({ entity: 'edge', id: 'e2' })!
			expect(edge.title).toBe('API → Банк')
			expect(edge.kind).toBe('Событие · API → Банк')
			expect(edge.status).toBeUndefined()
		})

		it('метрики связи и живой статус', () => {
			const live: FlowLiveState = { edges: { e3: { status: 'warning' } } }
			const edge = view({ entity: 'edge', id: 'e3' }, { live })!
			expect(edge.metrics).toEqual([{ key: 'lat', label: 'Задержка', value: `${formatNumber(40)} мс` }])
			expect(edge.status).toMatchObject({ id: 'warning' })
		})

		it('живые метрики связи', () => {
			const live: FlowLiveState = { edges: { e1: { metrics: [{ id: 'x', label: 'X', value: 'много' }] } } }
			expect(view({ entity: 'edge', id: 'e1' }, { live })!.metrics).toEqual([{ key: 'x', label: 'X', value: 'много' }])
		})

		it('неизвестная связь — ничего', () => {
			expect(view({ entity: 'edge', id: 'ghost' })).toBeNull()
		})
	})

	describe('группа', () => {
		it('заголовок, название вида и описание', () => {
			expect(view({ entity: 'group', id: 'core' })).toMatchObject({
				entity: 'group',
				id: 'core',
				title: 'Ядро',
				kind: 'Зона',
				description: 'Основные сервисы',
				metrics: [],
				calls: [],
				links: [],
			})
		})

		it('неизвестная группа — ничего', () => {
			expect(view({ entity: 'group', id: 'ghost' })).toBeNull()
		})
	})

	it('panelsSource отдаёт значения модели, а не ссылки', () => {
		const { context } = createFakeContext()
		const source = panelsSource(context)
		expect(source.data).toBe(context.model.data.value)
		expect(source.notation).toBe(context.model.notation.value)
		expect(source.graph).toBe(context.model.graph.value)
		expect(source.live).toBe(context.model.live.value)
		expect(source.nodeKind).toBe(context.model.nodeKind)
	})

	it('sheetViewport ставит центр узла в пятую часть высоты рамки — над листом, масштаб сохраняется', () => {
		expect(sheetViewport({ x: 100, y: 50, width: 160, height: 60 }, { x: 0, y: 0, zoom: 2 }, { width: 400, height: 800 })).toEqual({
			zoom: 2,
			x: 200 - 180 * 2,
			y: 160 - 80 * 2,
		})
	})
})
