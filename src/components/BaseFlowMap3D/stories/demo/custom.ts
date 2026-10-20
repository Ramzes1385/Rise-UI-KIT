import type { FlowMapData } from '@components/BaseFlowMap'
export const CUSTOM_FLOW: FlowMapData = {
	version: 1,
	notation: 'services',
	title: 'Киоски самообслуживания',
	description: 'Сеть киосков: клиент, киоск с GLB-моделью, очередь с фабрикой и банк с настроенной моделью',
	layout: { algorithm: 'layered', direction: 'LR', routing: 'curved' },
	nodes: [
		{ id: 'app', kind: 'client', label: 'Приложение', status: 'ok' },
		{ id: 'kiosk', kind: 'service', label: 'Киоск оплаты', status: 'ok', model3d: { rotation: 90 } },
		{ id: 'queue', kind: 'service', label: 'Очередь обслуживания', status: 'warning', model3d: { model: 'beacon' } },
		{ id: 'bank', kind: 'external', label: 'Банк', status: 'ok', model3d: { model: 'gold-bank' } },
	],
	edges: [
		{ id: 'e1', kind: 'call', source: 'app', target: 'kiosk', label: 'заказ' },
		{ id: 'e2', kind: 'call', source: 'kiosk', target: 'queue', label: 'талон' },
		{ id: 'e3', kind: 'call', source: 'kiosk', target: 'bank', label: 'оплата' },
	],
	scenarios: [
		{
			id: 'pay',
			label: 'Оплата в киоске',
			timing: 'uniform',
			steps: [
				{ id: 'p1', edge: 'e1', label: 'выбрать заказ' },
				{ id: 'p2', edge: 'e3', label: 'оплатить', model3d: { animation: 'gate' } },
				{ id: 'p3', edge: 'e2', label: 'выдать талон', model3d: { animation: 'pulse' } },
			],
		},
	],
}
