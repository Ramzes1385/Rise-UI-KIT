import type { ComputedRef, Ref } from 'vue'
import type { FlowGraph } from '../api/flowLayout.types'
import type { FlowEdge, FlowNode } from '../data/flowData.types'
import type { FlowGatewaySemantics } from '../api/flowNotation.types'
import type { FlowModel, FlowModelEnvironment, FlowModelProps } from './flowModel.types'
import type {
	FlowScenario,
	FlowScenarioAction,
	FlowScenarioChoice,
	FlowScenarioChoices,
	FlowScenarioStatus,
	FlowStepEffect,
	FlowTimelineEntry,
} from '../data/flowScenario.types'

/** Скорость проигрывания: нижний предел */
export const FLOW_SPEED_MIN = 0.25

/** Скорость проигрывания: верхний предел */
export const FLOW_SPEED_MAX = 4

/** Наибольший шаг часов за один кадр, мс: возврат на вкладку не делает прыжка */
export const FLOW_MAX_FRAME_DELTA = 100

/** Длительность шага при хронометраже uniform по умолчанию, мс */
export const FLOW_DEFAULT_STEP_DURATION = 1200

/** Нижний предел шага при хронометраже latency по умолчанию, мс */
export const FLOW_DEFAULT_MIN_STEP = 600

/** Верхний предел шага при хронометраже latency по умолчанию, мс */
export const FLOW_DEFAULT_MAX_STEP = 2400

/** Предел шагов сценария, построенного обходом токена */
export const FLOW_SIMULATION_MAX_STEPS = 200

/** Хронометраж: строки шагов выбранных веток и общая длительность */
export interface FlowTimelineBuild {
	/** Шаги по времени начала */
	entries: FlowTimelineEntry[]
	/** Длительность всего сценария, мс */
	duration: number
}

/** Настройки хронометража */
export interface FlowTimelineOptions {
	/** Эффект шага, когда он не задан в данных (из вида связи нотации); без него — travel у связи и pulse у узла */
	effectOf?: (action: FlowScenarioAction) => FlowStepEffect | undefined
}

/** Исход шага часов или команды: новое время и состояние */
export interface FlowPlayerMove {
	/** Время от начала, мс */
	time: number
	/** Состояние */
	status: FlowScenarioStatus
}

/** Исходные величины снимка сценария */
export interface FlowPlayerInput {
	/** Id сценария */
	scenario: string | null
	/** Состояние */
	status: FlowScenarioStatus
	/** Время, мс */
	time: number
	/** Скорость */
	speed: number
}

/** Настройки обхода токена по графу нотации */
export interface FlowSimulationConfig {
	/** Id получаемого сценария */
	id: string
	/** Название сценария (из словаря нотации) */
	label: string
	/** Поведение токена на шлюзах: вид узла → разветвление и слияние; вид без записи — разветвление на все выходы, слияние по одному входу */
	gateways: Record<string, FlowGatewaySemantics>
	/** Связь несёт токен (по умолчанию — любая) */
	follow?: (edge: FlowEdge) => boolean
	/** Узел — начало процесса (по умолчанию — нет входящих связей, по которым идёт токен) */
	isStart?: (node: FlowNode, graph: FlowGraph) => boolean
	/** Связь-сигнал (сообщение BPMN): токен по ней доходит до узла, но запускает его, только если других входящих связей нет */
	isSignal?: (edge: FlowEdge) => boolean
	/** Предел шагов; по умолчанию 200 */
	maxSteps?: number
}

/** Спросить, какую ветку выбрать: хук `resolveChoice` или свой источник; ничего — ветка по умолчанию */
export type FlowChoiceAsk = (step: FlowScenarioChoice) => Promise<string | void>

/** Рабочие величины хронометража одного сценария */
export interface FlowTimelineContext {
	/** Накопленные шаги */
	entries: FlowTimelineEntry[]
	/** Выбранные ветки */
	choices: FlowScenarioChoices
	/** Длительность шага при uniform, мс */
	stepDuration: number
	/** Нижний предел шага, мс */
	minStep: number
	/** Верхний предел шага, мс */
	maxStep: number
	/** Хронометраж latency */
	isLatency: boolean
	/** Самая большая задержка шага сценария, мс */
	maxLatency: number
	/** Эффект шага из нотации */
	effectOf?: FlowTimelineOptions['effectOf']
}

/** Место шага на оси времени */
export interface FlowTimelineCursor {
	/** Начало, мс */
	start: number
	/** Ветка */
	branch?: string
}

/** Ход часов: прошедшее время и скорость */
export interface FlowClockInput {
	/** Время от начала, мс */
	time: number
	/** Прошло с прошлого кадра, мс */
	delta: number
	/** Скорость */
	speed: number
	/** Длительность сценария, мс */
	duration: number
}

/** Переход токена по связи в круге обхода */
export interface FlowSimulationMove {
	/** Связь */
	edge: FlowEdge
	/** Узел-приёмник */
	node: FlowNode
}

/** Состояние обхода токена */
export interface FlowSimulationRun {
	/** Граф */
	graph: FlowGraph
	/** Выбор на шлюзах */
	choices: FlowScenarioChoices
	/** Настройки */
	config: FlowSimulationConfig
	/** Связь несёт токен */
	follow: (edge: FlowEdge) => boolean
	/** Ожидающие токены: узел → связь → сколько */
	waiting: Map<string, Map<string, number>>
	/** Узлы, где токен готов выйти (старты) */
	ready: string[]
	/** Пройденные узлы */
	visited: Set<string>
	/** Сделано шагов */
	steps: number
}

/** Подробности сценария для панели: выбранный сценарий, список и выбор (отдаёт драйвер через `provide`) */
export interface FlowScenarioDetails {
	/** Сценарий в работе: из данных или построенный по модели; null — сценариев нет */
	scenario: ComputedRef<FlowScenario | null>
	/** Сценарии данных */
	scenarios: ComputedRef<FlowScenario[]>
	/** Шаги-действия по id (в развёрнутом виде всех веток) */
	actions: ComputedRef<ReadonlyMap<string, FlowScenarioAction>>
	/** Выбранные ветки (проп `choices` и ответы хука) */
	choices: ComputedRef<FlowScenarioChoices>
	/** Сценарий построен по модели нотации */
	isSimulated: ComputedRef<boolean>
	/** Сценарий запущен сам (`isAutoplay`) и пользователь его ещё не трогал: шаги не озвучиваются */
	isSilent: Ref<boolean>
	/** Выбрать сценарий, не запуская */
	select: (id: string | null) => void
}

/** Изменяемые величины драйвера сценария */
export interface FlowScenarioRuntime {
	/** Выбранный сценарий */
	selected: Ref<string | null>
	/** Состояние */
	status: Ref<FlowScenarioStatus>
	/** Время, мс */
	time: Ref<number>
	/** Скорость */
	speed: Ref<number>
	/** Ответы хука `resolveChoice` */
	resolved: Ref<FlowScenarioChoices>
}

/** Всё, что нужно действиям драйвера сценария */
export interface FlowScenarioContext {
	/** Модель карты (без сценария) */
	model: FlowScenarioModel
	/** Пропсы */
	props: FlowModelProps
	/** Окружение вида */
	environment: FlowModelEnvironment
	/** Изменяемые величины */
	runtime: FlowScenarioRuntime
	/** Подробности сценария */
	details: FlowScenarioDetails
	/** Хронометраж */
	build: ComputedRef<FlowTimelineBuild>
	/** Номер запуска: смена отменяет запуск, ждущий ответов хука */
	session: { token: number }
}

/** Часы кадров: запуск и остановка */
export interface FlowScenarioClock {
	/** Запустить */
	start: () => void
	/** Остановить */
	stop: () => void
}

/** Модель карты для драйвера сценария: всё, кроме самого сценария, контроллера и вида */
export type FlowScenarioModel = Omit<FlowModel, 'scenario' | 'controller' | 'setView'>
