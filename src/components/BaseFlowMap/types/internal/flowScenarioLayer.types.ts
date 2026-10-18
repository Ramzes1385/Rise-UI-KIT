import type { ComputedRef, Ref } from 'vue'
import type { FlowRect, FlowStatus } from '../data/flowData.types'
import type { FlowGraph, FlowRoute } from '../api/flowLayout.types'
import type { FlowScenario, FlowScenarioAction, FlowScenarioState, FlowScenarioStatus, FlowTimelineEntry } from '../data/flowScenario.types'

/** Пропсы слоя сценария: ядро передаёт проп карты `particles` */
export interface FlowScenarioLayerProps {
	/** Частицы: false — выключить; число — предел частиц на карте (по умолчанию 400) */
	particles?: boolean | number
}

/** Пройденный или идущий участок связи: прорисовывается копией пути */
interface FlowTrailMark {
	/** Id шага */
	id: string
	/** Путь SVG связи */
	path: string
	/** Непрорисованная доля пути (`stroke-dashoffset` при `pathLength="1"`): 1 — ничего, 0 — весь путь */
	offset: number
	/** Идёт сейчас или пройден */
	state: 'active' | 'done'
	/** Статус шага */
	status?: FlowStatus
}

/** Токен сценария на связи */
export interface FlowTokenMark {
	/** Id шага */
	id: string
	/** X на холсте */
	x: number
	/** Y на холсте */
	y: number
	/** Статус шага */
	status?: FlowStatus
}

/** Пульс узла, который работает на шаге */
interface FlowPulseMark {
	/** Id шага */
	id: string
	/** Рамка узла */
	rect: FlowRect
	/** Статус шага */
	status?: FlowStatus
}

/** Всё, что слой рисует по состоянию сценария */
export interface FlowScenarioMarks {
	/** Участки связей */
	trails: FlowTrailMark[]
	/** Токены */
	tokens: FlowTokenMark[]
	/** Пульсы узлов */
	pulses: FlowPulseMark[]
}

/** Вход расчёта меток сценария */
export interface FlowMarksInput {
	/** Состояние проигрывания */
	status: FlowScenarioStatus
	/** Время, мс */
	time: number
	/** Хронометраж */
	timeline: readonly FlowTimelineEntry[]
	/** Маршруты связей */
	routes: Record<string, FlowRoute>
	/** Рамки узлов */
	rects: Record<string, FlowRect>
	/** Шаги-действия по id */
	actions: ReadonlyMap<string, FlowScenarioAction>
	/** Движение выключено: токены не бегут, участки показываются сразу целиком */
	isReduced: boolean
}

/** Концы шага для подписи: «откуда → куда» */
export interface FlowActionEnds {
	/** Откуда */
	from?: string
	/** Куда */
	to?: string
}

/** Что панель сценария показывает про шаг */
export interface FlowPanelStep {
	/** Id шага */
	id: string
	/** Номер с 1 */
	number: number
	/** Откуда → куда */
	title: string
	/** Что · как */
	detail: string
	/** Задержка, подписью */
	latency: string
	/** Идёт сейчас */
	isCurrent: boolean
	/** Пройден */
	isDone: boolean
	/** Шаг закончился ошибкой */
	isFailed: boolean
	/** Начало шага, мс */
	start: number
	/** Ветка параллельных шагов: подпись «Параллельно» */
	isParallel: boolean
}

/** Что слой сценария отдаёт шаблону */
export interface FlowScenarioLayerView {
	status: ComputedRef<FlowScenarioStatus>
	marks: ComputedRef<FlowScenarioMarks>
	group: Ref<SVGGElement | null>
	count: ComputedRef<number>
	isMuted: ComputedRef<boolean>
}

/** Что панель сценария отдаёт шаблону */
export interface FlowScenarioPanelView {
	scenario: ComputedRef<FlowScenario | null>
	scenarios: ComputedRef<FlowScenario[]>
	steps: ComputedRef<FlowPanelStep[]>
	status: ComputedRef<string>
	isCompact: ComputedRef<boolean>
	isPlaying: ComputedRef<boolean>
	isSimulated: ComputedRef<boolean>
	stepText: ComputedRef<string>
	summary: ComputedRef<string>
	speedText: ComputedRef<string>
	currentTitle: ComputedRef<string>
	time: ComputedRef<number>
	duration: ComputedRef<number>
	seekStep: ComputedRef<number>
	toggle: () => void
	restart: () => void
	go: (direction: 1 | -1) => void
	seek: (time: number) => void
	jump: (id: string) => void
	cycleSpeed: () => void
	select: (id: string) => void
}

/** Частицы для шаблона слоя */
export interface FlowParticles {
	group: Ref<SVGGElement | null>
	count: ComputedRef<number>
	isMuted: ComputedRef<boolean>
}

/** Вход расчёта строк панели сценария */
export interface FlowPanelInput {
	/** Хронометраж */
	timeline: readonly FlowTimelineEntry[]
	/** Шаги-действия по id */
	actions: ReadonlyMap<string, FlowScenarioAction>
	/** Граф карты: подписи концов шагов */
	graph: FlowGraph
	/** Состояние проигрывания */
	state: Pick<FlowScenarioState, 'activeSteps' | 'doneSteps'>
}
