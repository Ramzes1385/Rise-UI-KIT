/** Триггеры (типы) событий BPMN 2.0: none — без триггера */
export const BPMN_EVENT_TRIGGERS = [
	'none',
	'message',
	'timer',
	'error',
	'escalation',
	'cancel',
	'compensation',
	'conditional',
	'link',
	'signal',
	'terminate',
	'multiple',
	'parallel-multiple',
] as const

/** Триггер события */
export type BpmnEventTrigger = (typeof BPMN_EVENT_TRIGGERS)[number]

/** Виды событий BPMN: старт, промежуточное, конец, граничное (на границе задачи) */
export const BPMN_EVENT_KINDS = ['start', 'intermediate', 'end', 'boundary'] as const

/** Вид события BPMN */
export type BpmnEventKind = (typeof BPMN_EVENT_KINDS)[number]

/** Виды шлюзов BPMN */
export const BPMN_GATEWAY_KINDS = ['exclusive', 'inclusive', 'parallel', 'event-based', 'complex'] as const

/** Вид шлюза BPMN */
export type BpmnGatewayKind = (typeof BPMN_GATEWAY_KINDS)[number]

/** Виды работ BPMN: задача, подпроцесс, вызов, транзакция */
export const BPMN_ACTIVITY_KINDS = ['task', 'subprocess', 'call-activity', 'transaction'] as const

/** Вид работы BPMN */
export type BpmnActivityKind = (typeof BPMN_ACTIVITY_KINDS)[number]

/** Типы задачи BPMN: none — обычная */
export const BPMN_TASK_TYPES = ['none', 'user', 'service', 'script', 'send', 'receive', 'manual', 'business-rule'] as const

/** Тип задачи */
export type BpmnTaskType = (typeof BPMN_TASK_TYPES)[number]

/** Повторение работы: none — нет, standard — цикл, multi-parallel и multi-sequential — множественный экземпляр */
export const BPMN_LOOP_TYPES = ['none', 'standard', 'multi-parallel', 'multi-sequential'] as const

/** Повторение работы */
export type BpmnLoopType = (typeof BPMN_LOOP_TYPES)[number]

/** Какие триггеры допустимы у вида события (OMG BPMN 2.0.2, таблицы типов событий); промежуточное — отдельно ловящее и бросающее */
export const BPMN_TRIGGERS_BY_KIND = {
	start: ['none', 'message', 'timer', 'conditional', 'signal', 'multiple', 'parallel-multiple'],
	'intermediate-catch': ['none', 'message', 'timer', 'conditional', 'link', 'signal', 'multiple', 'parallel-multiple'],
	'intermediate-throw': ['none', 'message', 'escalation', 'compensation', 'link', 'signal', 'multiple'],
	end: ['none', 'message', 'error', 'escalation', 'cancel', 'compensation', 'signal', 'terminate', 'multiple'],
	boundary: [
		'message',
		'timer',
		'conditional',
		'signal',
		'error',
		'escalation',
		'cancel',
		'compensation',
		'multiple',
		'parallel-multiple',
	],
} as const satisfies Record<string, readonly BpmnEventTrigger[]>

/** Поля события BPMN (`FlowNode.props`) */
export interface BpmnEventProps {
	/** Триггер; по умолчанию none (у граничного — message) */
	trigger?: BpmnEventTrigger
	/** Бросающее (залитый значок): у промежуточного события; конечное всегда бросающее, стартовое и граничное — ловящие */
	isThrowing?: boolean
	/** Прерывающее (граничное событие): сплошной ободок; false — пунктирный */
	isInterrupting?: boolean
}

/** Поля работы BPMN (`FlowNode.props`) */
export interface BpmnActivityProps {
	/** Тип задачи (у задачи) */
	taskType?: BpmnTaskType
	/** Повторение */
	loop?: BpmnLoopType
	/** Компенсирующая работа */
	isCompensation?: boolean
}
