import { vi } from 'vitest'
import { computed, ref, shallowRef } from 'vue'
import { buildFlowGraph } from '../../model/data/flowGraph'
import { FLOW_MAP_CONTEXT } from '../../model/context/flowContext'
import type { FlowNotation } from '../../types/api/flowNotation.types'
import type { FlowElementRef } from '../../types/data/flowReview.types'
import type { FlowLayoutResult } from '../../types/api/flowLayout.types'
import type { FlowMapContext } from '../../types/internal/flowModel.types'
import type { FlowLiveState, FlowViewport } from '../../types/api/flowController.types'
import { resolveEdgeKind, resolveGroupKind, resolveNodeKind } from '../../model/notations/resolveKind'
import type { FlowEdge, FlowGroup, FlowMapData, FlowNode, FlowSize } from '../../types/data/flowData.types'

export const panelsNotation: FlowNotation = {
	id: 'test',
	label: () => 'Тест',
	nodeKinds: {
		service: { label: () => 'Сервис', render: 'html', shape: { shape: 'round-rect' }, size: { width: 160, height: 56 } },
		db: { label: () => 'База', render: 'svg', shape: { shape: 'cylinder' }, size: { width: 120, height: 56 } },
		partner: {
			label: () => 'Партнёр',
			render: 'svg',
			shape: { shape: 'rect' },
			size: { width: 120, height: 56 },
			isExternal: true,
		},
	},
	edgeKinds: {
		call: { label: () => 'Вызов', stroke: 'solid', endMarker: 'arrow' },
		event: { label: () => 'Событие', stroke: 'dashed', startMarker: 'circle', endMarker: 'open-arrow', color: 'var(--rise-info)' },
	},
	groupKinds: { zone: { label: () => 'Зона', layout: 'box' } },
	defaultNodeKind: 'service',
	defaultEdgeKind: 'call',
}

export function panelsData(): FlowMapData {
	return {
		version: 1,
		title: 'Заказы',
		nodes: [
			{
				id: 'api',
				kind: 'service',
				label: 'API',
				subtitle: 'Go',
				description: 'Принимает заказы',
				status: 'ok',
				group: 'core',
				metrics: [
					{ id: 'rps', label: 'Запросы', value: 1250, unit: 'rps', trend: 'up', status: 'warning' },
					{ id: 'p99', label: 'p99', value: '120 мс', trend: 'down' },
					{ id: 'err', label: 'Ошибки', value: 2, trend: 'flat' },
				],
				fields: [
					{ id: 'repo', label: 'Репозиторий', value: 'orders', href: 'https://git.example/orders' },
					{ id: 'ver', label: 'Версия', value: 3 },
				],
				owner: { name: 'Платежи', avatar: undefined, href: 'https://team.example/payments' },
				links: [
					{ label: 'Документация', href: 'https://docs.example/api', isExternal: true },
					{ label: 'Дашборд', href: '/dash' },
				],
			},
			{ id: 'db', kind: 'db', label: 'Заказы БД', status: 'down', group: 'core', owner: { name: 'Данные' } },
			{ id: 'bank', kind: 'partner', label: 'Банк', status: 'degraded' },
			{ id: 'lonely', kind: 'service', label: 'Одинокий' },
		],
		edges: [
			{ id: 'e1', source: 'api', target: 'db', label: 'запись', status: 'error', description: 'Пишет заказы' },
			{ id: 'e2', source: 'api', target: 'bank', kind: 'event' },
			{ id: 'e3', source: 'bank', target: 'api', kind: 'event', metrics: [{ id: 'lat', label: 'Задержка', value: 40, unit: 'мс' }] },
		],
		groups: [{ id: 'core', kind: 'zone', label: 'Ядро', color: 'var(--rise-primary)', description: 'Основные сервисы' }],
		statuses: [{ id: 'degraded', label: 'Деградация', icon: 'alert-triangle', color: '#c60' }],
	}
}

function panelsLayout(): FlowLayoutResult {
	return {
		nodes: {
			api: { x: 0, y: 0, width: 160, height: 56 },
			db: { x: 300, y: 0, width: 120, height: 56 },
			bank: { x: 0, y: 200, width: 120, height: 56 },
			lonely: { x: 300, y: 200, width: 160, height: 56 },
		},
		groups: { core: { x: -20, y: -20, width: 460, height: 100 } },
		edges: {},
		bounds: { x: -20, y: -20, width: 480, height: 276 },
	}
}

export interface FakeContextOptions {
	data?: FlowMapData
	notation?: FlowNotation
	layout?: FlowLayoutResult
	live?: FlowLiveState
	isCompact?: boolean
	viewport?: FlowViewport
	frame?: FlowSize
	details?: FlowElementRef | null
}

export function createFakeContext(options: FakeContextOptions = {}) {
	const notation = options.notation ?? panelsNotation
	const data = shallowRef(options.data ?? panelsData())
	const layout = shallowRef(options.layout ?? panelsLayout())
	const live = ref<FlowLiveState>(options.live ?? {})
	const viewport = ref<FlowViewport>(options.viewport ?? { x: 0, y: 0, zoom: 1 })
	const frame = ref<FlowSize>(options.frame ?? { width: 800, height: 600 })
	const isCompact = ref(options.isCompact ?? false)
	const details = ref<FlowElementRef | null>(options.details ?? null)
	const registry = new Map([[notation.id, notation]])
	const graph = computed(() => buildFlowGraph(data.value))
	const fitView = vi.fn()
	const setViewport = vi.fn((next: FlowViewport, _options?: { isAnimated?: boolean }) => {
		viewport.value = next
	})
	const openDetails = vi.fn((target: FlowElementRef | null) => {
		details.value = target
	})
	const context = {
		model: {
			data,
			graph,
			notation: computed(() => notation),
			nodeKind: (node: FlowNode) => resolveNodeKind(node.kind, notation, registry),
			edgeKind: (edge: FlowEdge) => resolveEdgeKind(edge.kind, notation, registry),
			groupKind: (group: FlowGroup) => resolveGroupKind(group.kind, notation, registry),
			layout,
			live,
			controller: { fitView },
		},
		viewport,
		frame,
		isCompact,
		setViewport,
		details,
		openDetails,
	} as unknown as FlowMapContext
	return { context, data, layout, live, viewport, frame, isCompact, details, fitView, setViewport, openDetails }
}

export function provideContext(context: FlowMapContext): { provide: Record<symbol, FlowMapContext> } {
	return { provide: { [FLOW_MAP_CONTEXT as symbol]: context } }
}

export function stubBox(element: Element, rect: { left?: number; top?: number } = {}): void {
	const box = { left: 0, top: 0, x: 0, y: 0, width: 168, height: 110, right: 168, bottom: 110, toJSON: () => ({}), ...rect }
	vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(box as DOMRect)
}
