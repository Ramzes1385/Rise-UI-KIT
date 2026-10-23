import type { FlowMapData } from '../../../types/data/flowData.types'
import type { FlowScenario } from '../../../types/data/flowScenario.types'

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const RETURN_SCENARIO: FlowScenario = {
	id: 'return-1042',
	label: 'Экземпляр № 1042',
	description: 'Заявка на возврат от оформления до возврата денег',
	timing: 'latency',
	steps: [
		{ id: 'r1', edge: 'f1', label: 'Оформить заявку', via: 'Клиент · пользовательская', latency: 2 * MINUTE },
		{ id: 'r2', edge: 'm-request', label: 'Проверить заявку', via: 'сообщение', latency: 4 * HOUR },
		{ id: 'r3', edge: 'f3', label: 'Заявка корректна?', via: 'исключающий шлюз' },
		{ id: 'r4', edge: 'f-yes', label: 'Одобрить возврат', via: 'да', latency: 10 * MINUTE },
		{ id: 'r5', edge: 'm-approve', label: 'Решение клиенту', via: 'сообщение', latency: MINUTE },
		{ id: 'r6', edge: 'f-wait', label: '3 дня на отправку', via: 'таймер', latency: DAY + 6 * HOUR },
		{ id: 'r7', edge: 'f6', label: 'Отправить товар', via: 'Клиент · ручная', latency: 20 * MINUTE },
		{ id: 'r8', edge: 'm-parcel', label: 'Посылка на склад', via: 'сообщение', latency: 2 * DAY },
		{ id: 'r9', edge: 'f7', label: 'Принять посылку', via: 'Склад · приём', latency: 15 * MINUTE },
		{
			type: 'parallel',
			id: 'split',
			label: 'проверка и возврат денег одновременно',
			branches: [
				[
					{ id: 'r10', edge: 'f8', label: 'Проверить товар', via: 'Склад · ручная', latency: 2 * HOUR },
					{ id: 'r11', edge: 'f10', label: 'Слияние', via: 'параллельный шлюз' },
				],
				[
					{ id: 'r12', edge: 'f9', label: 'Подготовить возврат денег', via: 'Бухгалтерия · служебная', latency: HOUR },
					{ id: 'r13', edge: 'f11', label: 'Слияние', via: 'параллельный шлюз' },
				],
			],
		},
		{ id: 'r14', edge: 'f12', label: 'Есть брак?', via: 'исключающий шлюз' },
		{ id: 'r15', edge: 'f13', label: 'Деньги возвращены', via: 'да', latency: 5 * MINUTE },
	],
}

const NODES: FlowMapData['nodes'] = [
	{ id: 's', kind: 'start', label: 'Заявка на возврат', group: 'client', description: 'Клиент решил вернуть товар.' },
	{ id: 't1', kind: 'task', label: 'Оформить заявку', group: 'client', props: { taskType: 'user' } },
	{ id: 'im', kind: 'intermediate', label: 'Возврат одобрен', group: 'client', props: { trigger: 'message' } },
	{ id: 'tm', kind: 'intermediate', label: '3 дня на отправку', group: 'client', props: { trigger: 'timer' } },
	{ id: 't4', kind: 'task', label: 'Отправить товар', group: 'client', props: { taskType: 'manual' } },
	{ id: 't2', kind: 'task', label: 'Проверить заявку', group: 'support', props: { taskType: 'user' } },
	{ id: 'g1', kind: 'exclusive', label: 'Заявка корректна?', group: 'support' },
	{ id: 't3', kind: 'task', label: 'Запросить уточнение', group: 'support', props: { taskType: 'send' } },
	{ id: 't7', kind: 'task', label: 'Одобрить возврат', group: 'support', props: { taskType: 'send' } },
	{ id: 't8', kind: 'task', label: 'Принять посылку', group: 'warehouse', props: { taskType: 'receive' } },
	{ id: 'p1', kind: 'parallel', label: 'Разветвление', group: 'warehouse' },
	{ id: 't5', kind: 'task', label: 'Проверить товар', group: 'warehouse', props: { taskType: 'manual' } },
	{ id: 'p2', kind: 'parallel', label: 'Слияние', group: 'warehouse' },
	{ id: 'g2', kind: 'exclusive', label: 'Есть брак?', group: 'warehouse' },
	{ id: 'e2', kind: 'end', label: 'Возврат отклонён', group: 'warehouse' },
	{ id: 't6', kind: 'task', label: 'Подготовить возврат денег', group: 'finance', props: { taskType: 'service' } },
	{ id: 'e1', kind: 'end', label: 'Деньги возвращены', group: 'finance' },
]

const EDGES: FlowMapData['edges'] = [
	{ id: 'f1', source: 's', target: 't1' },
	{ id: 'm-request', kind: 'message', source: 't1', target: 't2', label: 'заявка' },
	{ id: 'f3', source: 't2', target: 'g1' },
	{ id: 'f4', source: 'g1', target: 't3', label: 'нет', condition: 'нет' },
	{ id: 'm-clarify', kind: 'message', source: 't3', target: 't1', label: 'письмо клиенту' },
	{ id: 'f-yes', source: 'g1', target: 't7', label: 'да', condition: 'да', isDefault: true },
	{ id: 'm-approve', kind: 'message', source: 't7', target: 'im', label: 'решение' },
	{ id: 'f-wait', source: 'im', target: 'tm' },
	{ id: 'f6', source: 'tm', target: 't4' },
	{ id: 'm-parcel', kind: 'message', source: 't4', target: 't8', label: 'посылка' },
	{ id: 'f7', source: 't8', target: 'p1' },
	{ id: 'f8', source: 'p1', target: 't5' },
	{ id: 'f9', source: 'p1', target: 't6' },
	{ id: 'f10', source: 't5', target: 'p2' },
	{ id: 'f11', source: 't6', target: 'p2' },
	{ id: 'f12', source: 'p2', target: 'g2' },
	{ id: 'f13', source: 'g2', target: 'e1', label: 'да', condition: 'да', isDefault: true },
	{ id: 'f14', source: 'g2', target: 'e2', label: 'нет', condition: 'нет' },
]

const GROUPS: NonNullable<FlowMapData['groups']> = [
	{ id: 'client', kind: 'pool', label: 'Клиент', order: 0 },
	{ id: 'shop', kind: 'pool', label: 'Интернет-магазин', order: 1 },
	{ id: 'support', kind: 'lane', label: 'Поддержка', parent: 'shop', order: 0, color: 'var(--rise-chart-2)' },
	{ id: 'warehouse', kind: 'lane', label: 'Склад', parent: 'shop', order: 1, color: 'var(--rise-chart-3)' },
	{ id: 'finance', kind: 'lane', label: 'Бухгалтерия', parent: 'shop', order: 2, color: 'var(--rise-chart-4)' },
]

const BASE: FlowMapData = {
	version: 1,
	notation: 'bpmn',
	title: 'Возврат товара',
	description: 'Процесс BPMN: клиент и интернет-магазин обмениваются сообщениями · 2 пула · 3 дорожки · 17 элементов',
	layout: { algorithm: 'layered', direction: 'LR', routing: 'orthogonal' },
	groups: GROUPS,
	nodes: NODES,
	edges: EDGES,
}

export const RETURN_PROCESS: FlowMapData = { ...BASE, scenarios: [RETURN_SCENARIO] }

export const RETURN_PROCESS_PLAIN: FlowMapData = BASE
