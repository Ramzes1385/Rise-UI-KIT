import type { FlowStatus } from './flowData.types'
import type { FlowStep3D } from './flowData3d.types'

/**
 * Хронометраж шагов: uniform — все шаги одной длительности (`stepDuration`),
 * latency — пропорционально `latency` шага в пределах [`minStep`, `maxStep`]
 */
export const FLOW_SCENARIO_TIMINGS = ['uniform', 'latency'] as const

/** Хронометраж сценария */
export type FlowScenarioTiming = (typeof FLOW_SCENARIO_TIMINGS)[number]

/** Эффект шага: travel — токен бежит по связи, draw — связь прорисовывается, pulse — узел пульсирует */
export const FLOW_STEP_EFFECTS = ['travel', 'draw', 'pulse'] as const

/** Эффект шага */
export type FlowStepEffect = (typeof FLOW_STEP_EFFECTS)[number]

/** Шаг-действие: токен проходит связь или подсвечивается узел */
export interface FlowScenarioAction {
	/** Вид шага; у действия можно не указывать */
	type?: 'action'
	/** Id шага, уникальный в сценарии */
	id: string
	/** Связь, по которой идёт токен */
	edge?: string
	/** Узел, который работает на этом шаге (без `edge` — подсветка узла) */
	node?: string
	/** Что происходит: «POST /orders», «резерв товара» */
	label?: string
	/** Как: «HTTPS», «событие» */
	via?: string
	/** Реальное время шага, мс — подпись «18 мс» и хронометраж `latency` */
	latency?: number
	/** Длительность анимации шага, мс; без неё — по хронометражу сценария */
	duration?: number
	/** Статус шага: ошибка красит токен и связь, текст — в озвучке */
	status?: FlowStatus
	/** Эффект; без него — из вида связи или узла нотации */
	effect?: FlowStepEffect
	/** Поля 3D шага: анимация модели (контракт 3D); 2D их не читает */
	model3d?: FlowStep3D
}

/** Параллельные ветки: идут одновременно, следующий шаг ждёт все ветки (как параллельный шлюз BPMN) */
export interface FlowScenarioParallel {
	/** Вид шага */
	type: 'parallel'
	/** Id шага */
	id: string
	/** Подпись группы: «параллельно» */
	label?: string
	/** Ветки — списки шагов */
	branches: FlowScenarioStep[][]
}

/** Ветка ветвления по условию */
export interface FlowScenarioBranch {
	/** Id ветки */
	id: string
	/** Подпись: «оплата прошла» */
	label?: string
	/** Условие — подпись и ключ выбора (`FlowScenarioChoices`) */
	condition?: string
	/** Шаги ветки */
	steps: FlowScenarioStep[]
}

/** Ветвление по условию: идёт одна ветка — выбранная (`choices`, хук `resolveChoice`) или `defaultBranch` */
export interface FlowScenarioChoice {
	/** Вид шага */
	type: 'choice'
	/** Id шага */
	id: string
	/** Вопрос: «оплата прошла?» */
	label?: string
	/** Ветки */
	branches: FlowScenarioBranch[]
	/** Ветка по умолчанию; без неё — первая */
	defaultBranch?: string
}

/** Шаг сценария */
export type FlowScenarioStep = FlowScenarioAction | FlowScenarioParallel | FlowScenarioChoice

/** Сценарий — анимированный путь по карте: «Оформление заказа» */
export interface FlowScenario {
	/** Уникальный id сценария */
	id: string
	/** Название */
	label: string
	/** Описание */
	description?: string
	/** Шаги */
	steps: FlowScenarioStep[]
	/** Хронометраж; по умолчанию uniform */
	timing?: FlowScenarioTiming
	/** Длительность шага при uniform, мс; по умолчанию 1200 */
	stepDuration?: number
	/** Пределы шага при latency, мс; по умолчанию 600 и 2400 */
	minStep?: number
	/** Верхний предел шага при latency, мс */
	maxStep?: number
	/** Повторять по кругу */
	isLoop?: boolean
	/** Итог: «≈ 0,9 с от клика до письма»; без него — сумма `latency` пройденных шагов */
	summary?: string
}

/** Выбор веток: id шага-ветвления → id ветки */
export type FlowScenarioChoices = Record<string, string>

/** Состояние проигрывания */
export const FLOW_SCENARIO_STATUSES = ['idle', 'playing', 'paused', 'ended'] as const

/** Состояние проигрывания */
export type FlowScenarioStatus = (typeof FLOW_SCENARIO_STATUSES)[number]

/** Снимок сценария в момент времени — одинаков для 2D и 3D */
export interface FlowScenarioState {
	/** Id сценария */
	scenario: string | null
	/** Состояние */
	status: FlowScenarioStatus
	/** Время от начала, мс */
	time: number
	/** Длительность с учётом выбранных веток, мс */
	duration: number
	/** Номер текущего шага в плоском списке (с 0); -1 — до начала */
	stepIndex: number
	/** Число шагов в плоском списке выбранных веток */
	stepCount: number
	/** Шаги, идущие сейчас (несколько — параллельные ветки) */
	activeSteps: string[]
	/** Пройденные шаги */
	doneSteps: string[]
	/** Скорость: 1 — обычная */
	speed: number
}

/** Строка хронометража: шаг выбранных веток со временем начала — одна для 2D и 3D (3D не повторяет расчёт) */
export interface FlowTimelineEntry {
	/** Id шага-действия */
	step: string
	/** Начало от старта сценария, мс */
	start: number
	/** Длительность анимации, мс */
	duration: number
	/** Связь шага */
	edge?: string
	/** Узел шага */
	node?: string
	/** Ветка (id ветки ветвления или «parallel-id:номер» параллельной) */
	branch?: string
	/** Эффект */
	effect: FlowStepEffect
}
