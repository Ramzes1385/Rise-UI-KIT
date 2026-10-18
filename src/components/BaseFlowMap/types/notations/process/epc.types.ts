import type { FlowNodeOf } from '../../data/flowData.types'
import type { FlowLayoutNode } from '../../api/flowLayout.types'

/** Виды узлов EPC: событие, функция, коннекторы И / ИЛИ / исключающее ИЛИ, оргединица, информационный объект, интерфейс процесса */
export const EPC_NODE_KINDS = ['event', 'function', 'and', 'or', 'xor', 'org-unit', 'information', 'process-interface'] as const

/** Вид узла EPC */
export type EpcNodeKind = (typeof EPC_NODE_KINDS)[number]

/** Виды связей EPC: поток управления и связь оргединицы или информации с функцией */
export const EPC_EDGE_KINDS = ['control', 'assignment'] as const

/** Вид связи EPC */
export type EpcEdgeKind = (typeof EPC_EDGE_KINDS)[number]

/** Поля функции EPC */
export interface EpcFunctionProps {
	/** Время выполнения, мс — хронометраж `latency` проигрывания */
	latency?: number
}

/** Функция EPC */
export type EpcFunctionNode = FlowNodeOf<'function', EpcFunctionProps>

/** Узлы EPC, которые не входят в поток управления, а «висят» сбоку от функции */
export type EpcAsideKind = 'org-unit' | 'information'

/** Роль узла EPC в чередовании: событие, функция или прозрачный (коннектор, интерфейс процесса) */
export type EpcAlternation = 'event' | 'function' | 'neutral'

/** Узлы, которые раскладка EPC ставит сбоку от функции: оргединицы слева, информационные объекты справа */
export interface EpcAsideSides {
	/** Слева */
	left: FlowLayoutNode[]
	/** Справа */
	right: FlowLayoutNode[]
}

/** Добавка к размеру функции на время слоистой раскладки: место под узлы сбоку */
export interface EpcAsidePads {
	/** Слева, px */
	left: number
	/** Справа, px */
	right: number
	/** Высота стопки, px */
	height: number
}
