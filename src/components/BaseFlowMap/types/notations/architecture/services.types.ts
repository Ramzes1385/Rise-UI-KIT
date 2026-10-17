/** Виды узлов карты сервисов */
export const SERVICES_NODE_KINDS = [
	'user',
	'client',
	'gateway',
	'balancer',
	'service',
	'function',
	'database',
	'cache',
	'queue',
	'storage',
	'external',
	'note',
] as const

/** Вид узла карты сервисов */
export type ServicesNodeKind = (typeof SERVICES_NODE_KINDS)[number]

/** Виды связей карты сервисов: call — вызов, event — событие, data — поток данных */
export const SERVICES_EDGE_KINDS = ['call', 'event', 'data'] as const

/** Вид связи карты сервисов */
export type ServicesEdgeKind = (typeof SERVICES_EDGE_KINDS)[number]

/** Платформы клиента */
export const SERVICES_PLATFORMS = ['web', 'mobile'] as const

/** Платформа клиента */
export type ServicesPlatform = (typeof SERVICES_PLATFORMS)[number]
