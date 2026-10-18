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
