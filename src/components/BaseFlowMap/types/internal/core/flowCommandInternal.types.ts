import type { FlowCommand } from '../flowModel.types'
import type { FlowGraph } from '../../api/flowLayout.types'
import type { FlowCommandEnv } from './flowModelCore.types'
import type { FlowEdge, FlowGroup, FlowLayoutSettings, FlowMapData, FlowNode } from '../../data/flowData.types'

/** Что проверяют правила соединения */
export interface FlowConnectCheck {
	/** Среда команд */
	env: FlowCommandEnv
	/** Данные */
	data: FlowMapData
	/** Граф */
	graph: FlowGraph
	/** Узел-источник */
	source: FlowNode
	/** Узел-приёмник */
	target: FlowNode
	/** Порт источника */
	sourcePort?: string
	/** Порт приёмника */
	targetPort?: string
	/** Вид связи */
	kind: string
	/** Id проверяемой связи — её не считают занятым портом */
	edgeId: string
}

/** Хук команды до `beforeChange` */
export type FlowBefore = NonNullable<FlowCommand['before']>

/** Поля для изменения */
export type FlowPatch = Record<string, unknown>

/** Элемент данных карты */
export type FlowDataItem = FlowNode | FlowEdge | FlowGroup

/** Сущности, которые меняет `update` */
export type FlowEditable = 'node' | 'edge' | 'group'

/** Адрес изменяемого элемента */
export interface FlowEditTarget {
	/** Сущность */
	entity: FlowEditable
	/** Id */
	id: string
}

/** Что уходит при удалении */
export interface FlowRemoval {
	/** Узлы */
	nodes: FlowNode[]
	/** Связи */
	edges: FlowEdge[]
	/** Группы */
	groups: FlowGroup[]
}

/** Параметры команды `layout` */
export type FlowLayoutOptions = FlowLayoutSettings & {
	/** Сбросить закрепления */
	isForced?: boolean
	/** Разложить только эти узлы */
	ids?: string[]
}

/** Конец соединения: id узла или узел с портом */
export type FlowEnd = string | { node: string; port?: string }
