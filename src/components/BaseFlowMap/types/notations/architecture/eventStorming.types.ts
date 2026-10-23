import type { FlowLayoutNode } from '../../api/flowLayout.types'
/** Виды стикеров Event Storming: событие домена, команда, актор, агрегат, политика, модель чтения, внешняя система, горячая точка, возможность */
export const EVENT_STORMING_NODE_KINDS = [
	'domain-event',
	'command',
	'actor',
	'aggregate',
	'policy',
	'read-model',
	'external-system',
	'hotspot',
	'opportunity',
] as const

/** Вид стикера Event Storming */
export type EventStormingNodeKind = (typeof EVENT_STORMING_NODE_KINDS)[number]

/** Переходы потока: стикер каждого вида ведёт к стикерам перечисленных видов; пометки (горячая точка, возможность) — к любым */
export type EventStormingGrammar = Record<string, readonly EventStormingNodeKind[]>

/** Блок колонок раскладки `timeline`: корневой контекст или колонка свободных стикеров */
export interface TimelineBlock {
	/** Блок — контекст: вокруг него остаётся место под рамку */
	isGroup: boolean
	/** Порядок первого стикера в данных */
	first: number
	/** Шаги потока (колонки до сжатия) внутри блока */
	steps: Set<number>
	/** Стикеры блока */
	nodes: FlowLayoutNode[]
}
