import { MAIN_MAP } from './services'
import type { FlowMapData } from '../../types/data/flowData.types'
import type { FlowScenario } from '../../types/data/flowScenario.types'

const PARALLEL_SCENARIO: FlowScenario = {
	id: 'checkout-parallel',
	label: 'Оформление заказа: резерв и оплата параллельно',
	description: 'Orders одновременно резервирует товар и проводит оплату, следующий шаг ждёт обе ветки',
	timing: 'latency',
	steps: [
		{ id: 'p1', edge: 'e1', label: 'POST /orders', via: 'HTTPS', latency: 18 },
		{ id: 'p2', edge: 'e4', label: 'CreateOrder', via: 'gRPC', latency: 12 },
		{
			type: 'parallel',
			id: 'split',
			label: 'параллельно',
			branches: [
				[{ id: 'p3', edge: 'e5', label: 'резерв товара', via: 'gRPC', latency: 18 }],
				[
					{ id: 'p4', edge: 'e6', label: 'списание оплаты', via: 'gRPC', latency: 420 },
					{ id: 'p5', edge: 'e7', label: '3-D Secure', via: 'HTTPS', latency: 380 },
				],
			],
		},
		{ id: 'p6', edge: 'e8', label: 'сохранить заказ', via: 'SQL', latency: 4 },
		{ id: 'p7', edge: 'e9', label: 'order.created', via: 'событие', latency: 3 },
	],
}

const CHOICE_SCENARIO: FlowScenario = {
	id: 'checkout-choice',
	label: 'Оформление заказа: исход оплаты',
	description: 'После запроса оплаты банк отвечает — заказ сохраняется или отменяется',
	timing: 'latency',
	steps: [
		{ id: 'c1', edge: 'e1', label: 'POST /orders', via: 'HTTPS', latency: 18 },
		{ id: 'c2', edge: 'e4', label: 'CreateOrder', via: 'gRPC', latency: 12 },
		{ id: 'c3', edge: 'e6', label: 'списание оплаты', via: 'gRPC', latency: 420 },
		{ id: 'c4', edge: 'e7', label: '3-D Secure', via: 'HTTPS', latency: 380 },
		{
			type: 'choice',
			id: 'payment',
			label: 'оплата прошла?',
			defaultBranch: 'paid',
			branches: [
				{
					id: 'paid',
					label: 'оплата прошла',
					condition: 'прошла',
					steps: [
						{ id: 'c5', edge: 'e8', label: 'сохранить заказ', via: 'SQL', latency: 4 },
						{ id: 'c6', edge: 'e9', label: 'order.created', via: 'событие', latency: 3 },
						{ id: 'c7', edge: 'e11', label: 'письмо клиенту', via: 'событие', latency: 40 },
					],
				},
				{
					id: 'declined',
					label: 'отказ банка',
					condition: 'отказ',
					steps: [
						{
							id: 'c8',
							node: 'pay',
							label: 'банк отклонил платёж',
							via: 'отказ 3DS',
							latency: 60,
							status: 'error',
							effect: 'pulse',
						},
					],
				},
			],
		},
	],
}

export const PARALLEL_MAP: FlowMapData = { ...MAIN_MAP, scenarios: [PARALLEL_SCENARIO] }

export const CHOICE_MAP: FlowMapData = { ...MAIN_MAP, scenarios: [CHOICE_SCENARIO] }
