import type { FlowNodeOf } from '../../data/flowData.types'
import type { FlowLayoutNode } from '../../api/flowLayout.types'

/** Виды узлов UML Sequence: линия жизни, актёр, фрагмент */
export const SEQUENCE_NODE_KINDS = ['lifeline', 'actor', 'fragment'] as const

/** Вид узла UML Sequence */
export type SequenceNodeKind = (typeof SEQUENCE_NODE_KINDS)[number]

/** Виды сообщений: синхронное, асинхронное, ответ, создание и уничтожение линии жизни */
export const SEQUENCE_EDGE_KINDS = ['sync', 'async', 'reply', 'create', 'destroy'] as const

/** Вид сообщения */
export type SequenceEdgeKind = (typeof SEQUENCE_EDGE_KINDS)[number]

/** Операторы комбинированных фрагментов UML 2.5 */
export const SEQUENCE_OPERATORS = ['alt', 'opt', 'loop', 'par', 'break', 'critical', 'ref'] as const

/** Оператор фрагмента */
export type SequenceOperator = (typeof SEQUENCE_OPERATORS)[number]

/** Линия жизни: создание и уничтожение задают сообщения вида `create` и `destroy`, а не поля узла */
export type SequenceLifelineNode = FlowNodeOf<'lifeline'>

/** Поля фрагмента: диапазон сообщений по их id, условие и оператор */
export interface SequenceFragmentProps {
	/** Оператор: alt, opt, loop, par, break, critical, ref */
	operator?: SequenceOperator
	/** Условие в квадратных скобках: «оплата прошла» */
	guard?: string
	/** Id первого сообщения внутри фрагмента */
	from?: string
	/** Id последнего сообщения внутри фрагмента */
	to?: string
}

/** Фрагмент */
export type SequenceFragmentNode = FlowNodeOf<'fragment', SequenceFragmentProps>

/** Строки сообщений: id связи → номер строки */
export type SequenceRows = ReadonlyMap<string, number>

/** Колонка линии жизни: узел и положение по горизонтали */
export interface SequenceColumn {
	/** Узел раскладки */
	node: FlowLayoutNode
	/** Левый край заголовка */
	x: number
}

/** Создание и уничтожение линий жизни: id линии жизни → номер строки сообщения `create` или `destroy` */
export interface SequenceLifecycle {
	/** Строки создания */
	created: ReadonlyMap<string, number>
	/** Строки уничтожения */
	destroyed: ReadonlyMap<string, number>
}
