import type { FlowGraph } from '../api/flowLayout.types'
import type { BadgeStatus } from '@components/BaseBadge'
import type { FlowLiveState } from '../api/flowController.types'
import type { DescriptionsItem } from '@components/BaseDescriptions'
import type { FlowEdgeKindDef, FlowGroupKindDef, FlowNodeKindDef, FlowNotation, FlowShapeDef } from '../api/flowNotation.types'
import type {
	FlowEdge,
	FlowField,
	FlowGroup,
	FlowLink,
	FlowMapData,
	FlowNode,
	FlowOwner,
	FlowRect,
	FlowSize,
	FlowStatus,
} from '../data/flowData.types'

/** Размер мини-карты, px: как в мокапе Main (168 × 110) */
export const FLOW_MINIMAP_SIZE: FlowSize = { width: 168, height: 110 }

/** Преобразование холста в мини-карту: масштаб и сдвиг */
export interface FlowMinimapTransform {
	/** Масштаб холста → мини-карта */
	scale: number
	/** Сдвиг по X, px мини-карты */
	offsetX: number
	/** Сдвиг по Y, px мини-карты */
	offsetY: number
}

/** Прямоугольник на мини-карте: узел или группа */
export interface FlowMinimapItem {
	/** Id узла или группы */
	id: string
	/** Рамка, px мини-карты */
	rect: FlowRect
	/** Статус узла (ok, warning, error…) — цвет прямоугольника; у групп нет */
	status?: FlowStatus
	/** Цвет группы — CSS-цвет или токен */
	color?: string
}

/** Статус для показа: значок, подпись и цвет — не только цвет */
export interface FlowStatusView {
	/** Id статуса */
	id: FlowStatus
	/** Подпись */
	label: string
	/** Значок BaseIcon */
	icon: string
	/** Цвет — токен */
	color: string
	/** Палитра BaseBadge */
	badge: BadgeStatus
}

/** Образец связи в легенде */
type FlowLegendEdgeSample = Pick<FlowEdgeKindDef, 'stroke' | 'startMarker' | 'endMarker' | 'color'>

/** Строка легенды: вид узла, вид связи или статус */
export interface FlowLegendRow {
	/** Ключ строки */
	id: string
	/** Что показывает строка */
	entity: 'node' | 'edge' | 'status'
	/** Подпись */
	label: string
	/** Фигура вида узла */
	shape?: FlowShapeDef['shape']
	/** Внешняя система: пунктирная рамка */
	isExternal?: boolean
	/** Образец связи */
	edge?: FlowLegendEdgeSample
	/** Статус */
	status?: FlowStatusView
}

/** Что показывают подробности */
export interface FlowDetailsView {
	/** Сущность: узел, связь или группа */
	entity: 'node' | 'edge' | 'group'
	/** Id */
	id: string
	/** Заголовок */
	title: string
	/** Название вида и технология: «Сервис · Go» */
	kind: string
	/** Дорожка или группа: подпись и цвет */
	lane?: { label: string; color?: string }
	/** Статус */
	status?: FlowStatusView
	/** Описание */
	description?: string
	/** Метрики — поля BaseDescriptions */
	metrics: DescriptionsItem[]
	/** Свои поля узла */
	fields: FlowField[]
	/** Подписи узлов, которые вызывает этот */
	calls: string[]
	/** Подписи узлов, которые вызывают этот */
	calledBy: string[]
	/** Ответственный */
	owner?: FlowOwner
	/** Ссылки */
	links: FlowLink[]
}

/** Встроенный статус: подпись читается в момент показа, значок и цвет — токены */
export interface FlowBuiltInStatus {
	/** Подпись из словаря */
	label: () => string
	/** Значок BaseIcon */
	icon: string
	/** Цвет — токен */
	color: string
	/** Палитра BaseBadge */
	badge: BadgeStatus
}

/** Что читают панели у модели: значения, не реактивные ссылки — чистые функции `model/panels` */
export interface FlowPanelsSource {
	/** Данные карты */
	data: FlowMapData
	/** Нотация карты */
	notation: FlowNotation
	/** Граф */
	graph: FlowGraph
	/** Живые данные */
	live: FlowLiveState
	/** Вид узла */
	nodeKind: (node: FlowNode) => FlowNodeKindDef
	/** Вид связи */
	edgeKind: (edge: FlowEdge) => FlowEdgeKindDef
	/** Вид группы */
	groupKind: (group: FlowGroup) => FlowGroupKindDef
}

/** Подписи подробностей: заголовок области и названия строк */
export interface FlowDetailsBodyLabels {
	/** Заголовок области подробностей */
	title: string
	/** Кнопка «Закрыть» */
	close: string
	/** Строка «Вызывает» */
	calls: string
	/** Строка «Вызывают» */
	calledBy: string
	/** Заголовок метрик */
	metrics: string
	/** Подпись команды: «Команда «Платежи»» */
	team: string
}

/** Образец связи в легенде: линия и значки концов в поле 24 × 14 */
export interface FlowLegendEdgeShapes {
	/** Путь линии */
	line: string
	/** Штрих: пусто — сплошная */
	dash: string
	/** Значки концов */
	marks: { path: string; isFilled: boolean }[]
}
