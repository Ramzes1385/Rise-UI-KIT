import type { FlowNodeOf } from '../../data/flowData.types'

/** Виды узлов C4: человек, система, контейнер, компонент и внешние человек и система */
export const C4_NODE_KINDS = ['person', 'software-system', 'container', 'component', 'external-person', 'external-system'] as const

/** Вид узла C4 */
export type C4NodeKind = (typeof C4_NODE_KINDS)[number]

/** Виды границ C4: предприятие, система, контейнер */
export const C4_GROUP_KINDS = ['enterprise-boundary', 'system-boundary', 'container-boundary'] as const

/** Вид границы C4 */
export type C4GroupKind = (typeof C4_GROUP_KINDS)[number]

/** Поля контейнера и компонента C4 */
export interface C4TechnologyProps {
	/** Технология: «Go», «PostgreSQL», «Kafka» */
	technology?: string
}

/** Контейнер C4 */
export type C4ContainerNode = FlowNodeOf<'container', C4TechnologyProps>

/** Компонент C4 */
export type C4ComponentNode = FlowNodeOf<'component', C4TechnologyProps>

/** Уровень смыслового зума: масштаб ниже `minZoom` сворачивает группы с этой глубины вложенности и глубже */
export interface C4ZoomLevel {
	/** Масштаб, ниже которого действует уровень */
	minZoom: number
	/** Сколько уровней вложенности групп остаются развёрнутыми: 0 — все группы свёрнуты (контекст системы) */
	depth: number
	/** Название уровня для полосы уровней: «Контекст» (номер добавляет ядро) */
	label: () => string
}
