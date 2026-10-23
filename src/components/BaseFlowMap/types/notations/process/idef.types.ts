import type { FlowNodeOf, FlowRect } from '../../data/flowData.types'
import type { FlowGraph, FlowLayoutNode } from '../../api/flowLayout.types'
import type { FlowScenarioAction, FlowScenarioChoices, FlowScenarioStep } from '../../data/flowScenario.types'

/** Роли порта функции IDEF0 (ICOM): вход слева, управление сверху, выход справа, механизм снизу, вызов вниз */
export const IDEF0_PORT_ROLES = ['input', 'control', 'output', 'mechanism', 'call'] as const

/** Роль порта функции IDEF0 */
export type Idef0PortRole = (typeof IDEF0_PORT_ROLES)[number]

/** Роли граничной стрелки: что она несёт для функции (выходная стрелка уходит за границу диаграммы) */
export const IDEF0_BOUNDARY_ROLES = ['input', 'control', 'output', 'mechanism'] as const

/** Роль граничной стрелки IDEF0 */
export type Idef0BoundaryRole = (typeof IDEF0_BOUNDARY_ROLES)[number]

/** Туннель стрелки IDEF0: скобки у начала, у конца или у обоих концов */
export type Idef0Tunnel = 'start' | 'end' | 'both'

/** Поля функции IDEF0 */
export interface Idef0FunctionProps {
	/** Номер функции: A1, A2, A21… — в правом нижнем углу, порядок лесенки */
	code?: string
	/** Номер страницы подробной диаграммы — «стр. 2» в левом нижнем углу */
	page?: string
}

/** Поля граничной стрелки IDEF0 */
export interface Idef0BoundaryProps {
	/** Код стрелки: I1, C1, O1, M1 */
	code?: string
	/** Роль: определяет, с какой стороны диаграммы стоит узел (вход слева, управление сверху, выход справа, механизм снизу) */
	icom?: Idef0BoundaryRole
	/** Туннелируемая стрелка: скобки « ( ) » у узла */
	isTunnel?: boolean
}

/** Поля связи-стрелки IDEF0 */
export interface Idef0ArrowProps {
	/** Туннель: скобки у начала, у конца или у обоих концов */
	tunnel?: Idef0Tunnel
}

/** Функция IDEF0 */
export type Idef0FunctionNode = FlowNodeOf<'function', Idef0FunctionProps>

/** Граничная стрелка IDEF0 */
export type Idef0BoundaryNode = FlowNodeOf<'boundary', Idef0BoundaryProps>

/** Виды соединений IDEF3: & — «и», O — «или», X — исключающее «или» */
export const IDEF3_JUNCTIONS = ['junction-and', 'junction-or', 'junction-xor'] as const

/** Вид соединения IDEF3 */
export type Idef3Junction = (typeof IDEF3_JUNCTIONS)[number]

/** Поля единицы поведения (UOB) IDEF3 */
export interface Idef3UobProps {
	/** Номер UOB: в левой клетке нижней строки */
	number?: number | string
	/** Номер функции IDEF0, которую уточняет UOB: A1, A3.2 — в правой клетке */
	ref?: string
}

/** Поля соединения IDEF3 */
export interface Idef3JunctionProps {
	/** Синхронное соединение: двойная черта; false или без поля — асинхронное */
	isSynchronous?: boolean
}

/** Поля ссылки-референта IDEF3 */
export interface Idef3ReferentProps {
	/** Тип ссылки: goto — переход к UOB, object — объект, scenario — сценарий */
	type?: 'goto' | 'object' | 'scenario'
	/** Номер UOB, объекта или сценария, на который указывает ссылка */
	target?: string
}

/** Единица поведения IDEF3 */
export type Idef3UobNode = FlowNodeOf<'uob', Idef3UobProps>

/** Внутреннее: граничная стрелка в раскладке «лесенка» — узел, роль по стороне порта и функции, к которым она подключена */
export interface Idef0LayoutBoundary {
	/** Узел на входе раскладки */
	node: FlowLayoutNode
	/** Роль */
	role: Idef0BoundaryRole
	/** Id функций, к которым подключена стрелка */
	anchors: string[]
}

/** Внутреннее: прямоугольники узлов по id */
export type Idef0LayoutRects = Record<string, FlowRect>

/** Внутреннее: шаг сценария по модели до присвоения id (IDEF0 и IDEF3) */
export type IdefDraftStep = Omit<FlowScenarioAction, 'id'>

/** Внутреннее: состояние обхода токенами IDEF3 (`idef3Simulate`) */
export interface Idef3Run {
	/** Граф карты */
	graph: FlowGraph
	/** Выбор веток для исключающих соединений: id соединения → id связи */
	choices: FlowScenarioChoices
	/** Сколько токенов пришло в узел */
	arrived: Map<string, number>
	/** Узлы, уже сработавшие */
	fired: Set<string>
	/** Собранные шаги */
	steps: FlowScenarioStep[]
	/** Счётчик id шагов */
	counter: number
}
