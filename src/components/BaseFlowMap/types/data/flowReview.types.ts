import type { FlowScenario } from './flowScenario.types'
import type { CommentAuthor, CommentItem } from '@components/BaseCommentThread'
import type { FlowEdge, FlowGroup, FlowMapData, FlowNode, FlowPoint } from './flowData.types'

/** Сущности карты */
export const FLOW_ENTITIES = ['node', 'edge', 'group', 'scenario'] as const

/** Сущность карты */
export type FlowEntity = (typeof FLOW_ENTITIES)[number]

/** Элемент карты по ссылке */
export interface FlowElementRef {
	/** Сущность */
	entity: FlowEntity
	/** Id */
	id: string
}

/** Добавление */
export interface FlowAddChange {
	/** Вид изменения */
	type: 'add'
	/** Сущность */
	entity: FlowEntity
	/** Новый элемент целиком */
	value: FlowNode | FlowEdge | FlowGroup | FlowScenario
	/** Место в массиве; без него — в конец */
	index?: number
}

/** Удаление */
export interface FlowRemoveChange {
	/** Вид изменения */
	type: 'remove'
	/** Сущность */
	entity: FlowEntity
	/** Id */
	id: string
	/** Удалённый элемент — для отмены и показа «было» */
	value: FlowNode | FlowEdge | FlowGroup | FlowScenario
	/** Место в массиве до удаления */
	index: number
}

/** Изменение полей (в том числе перемещение — `position`) */
export interface FlowUpdateChange {
	/** Вид изменения */
	type: 'update'
	/** Сущность */
	entity: FlowEntity
	/** Id */
	id: string
	/** Новые значения полей (`undefined` — поле убрано) */
	patch: Record<string, unknown>
	/** Прежние значения тех же полей */
	previous: Record<string, unknown>
}

/** Замена полей корня карты: `title`, `layout`, `notation`… */
export interface FlowRootChange {
	/** Вид изменения */
	type: 'root'
	/** Новые значения */
	patch: Partial<Omit<FlowMapData, 'nodes' | 'edges' | 'groups' | 'scenarios'>>
	/** Прежние значения */
	previous: Partial<Omit<FlowMapData, 'nodes' | 'edges' | 'groups' | 'scenarios'>>
}

/** Атомарное изменение данных: из них состоят команды, история, событие `change` и предложения правок */
export type FlowChange = FlowAddChange | FlowRemoveChange | FlowUpdateChange | FlowRootChange

/** Откуда изменение: user — действие в карте, api — контроллер, history — отмена/повтор, remote — от приложения (совместная работа), layout — авто-раскладка, review — принятое предложение */
export const FLOW_CHANGE_SOURCES = ['user', 'api', 'history', 'remote', 'layout', 'review'] as const

/** Источник изменения */
export type FlowChangeSource = (typeof FLOW_CHANGE_SOURCES)[number]

/** Автор правки или комментария — тот же, что у BaseCommentThread */
export type FlowAuthor = CommentAuthor

/** Состояние предложения: open — ждёт, accepted — принято, declined — отклонено */
export const FLOW_SUGGESTION_STATUSES = ['open', 'accepted', 'declined'] as const

/** Состояние предложения */
export type FlowSuggestionStatus = (typeof FLOW_SUGGESTION_STATUSES)[number]

/** Предложение правки — общее для карты и роадмапа: тело — изменения `C` (у карты — `FlowChange`, у роадмапа — свои), принимается или отклоняется целиком */
export interface ReviewSuggestion<C> {
	/** Id предложения */
	id: string
	/** Автор */
	author: FlowAuthor
	/** Когда: Date, ISO-строка или мс */
	date: Date | string | number
	/** Подпись: «Добавить кеш перед Inventory» */
	label?: string
	/** Изменения */
	changes: C[]
	/** Состояние */
	status: FlowSuggestionStatus
	/** Версия данных, от которой сделано предложение (`FlowVersion.id`): при расхождении — пометка «устарело» */
	baseVersion?: string
}

/** Предложение правки карты */
export type FlowSuggestion = ReviewSuggestion<FlowChange>

/** Цепочка комментариев к элементу (`target` — сущность и id) или к точке холста — общая для карты и роадмапа */
export interface ReviewThread<T extends { entity: string; id: string } = FlowElementRef> {
	/** Id цепочки */
	id: string
	/** К чему: элемент; без него — точка `point` холста */
	target?: T
	/** Точка холста (комментарий не к элементу) */
	point?: FlowPoint
	/** Комментарии — формат BaseCommentThread */
	comments: CommentItem[]
	/** Вопрос решён: цепочка скрыта, пока не включён показ решённых */
	isResolved?: boolean
	/** Есть непрочитанное для текущего пользователя: булавка пульсирует */
	isUnread?: boolean
}

/** Цепочка комментариев карты */
export type FlowCommentThread = ReviewThread<FlowElementRef>

/** Версия карты — для списка версий и сравнения «было / стало» */
export interface FlowVersion {
	/** Id версии */
	id: string
	/** Подпись: «v3 · согласовано» */
	label: string
	/** Когда */
	date: Date | string | number
	/** Автор */
	author?: FlowAuthor
	/** Данные карты этой версии */
	data: FlowMapData
}
