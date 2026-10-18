import type { FlowMapData } from '../../../types/data/flowData.types'

const BASE: FlowMapData = {
	version: 1,
	notation: 'dfd',
	title: 'Интернет-магазин · уровень 1',
	description: 'Диаграмма потоков данных: три процесса, три хранилища и три внешние сущности',
	layout: { algorithm: 'layered', direction: 'LR', routing: 'orthogonal', options: { style: 'gane-sarson' } },
	nodes: [
		{ id: 'e1', kind: 'entity', label: 'Клиент' },
		{ id: 'e2', kind: 'entity', label: 'Банк' },
		{ id: 'e3', kind: 'entity', label: 'Служба доставки' },
		{ id: 'p1', kind: 'process', label: 'Оформить заказ', props: { code: '1.0' } },
		{ id: 'p2', kind: 'process', label: 'Принять оплату', props: { code: '2.0' } },
		{ id: 'p3', kind: 'process', label: 'Собрать и отгрузить', props: { code: '3.0' } },
		{ id: 'd1', kind: 'store', label: 'Заказы', props: { code: 'D1' } },
		{ id: 'd2', kind: 'store', label: 'Платежи', props: { code: 'D2' } },
		{ id: 'd3', kind: 'store', label: 'Остатки', props: { code: 'D3' } },
	],
	edges: [
		{ id: 'f1', source: 'e1', target: 'p1', label: 'Данные заказа' },
		{ id: 'f2', source: 'p1', target: 'e1', label: 'Подтверждение заказа' },
		{ id: 'f3', source: 'p1', target: 'd1', label: 'Новый заказ' },
		{ id: 'f4', source: 'p1', target: 'p2', label: 'Счёт на оплату' },
		{ id: 'f5', source: 'p2', target: 'e2', label: 'Запрос списания' },
		{ id: 'f6', source: 'e2', target: 'p2', label: 'Подтверждение оплаты' },
		{ id: 'f7', source: 'p2', target: 'd2', label: 'Платёж' },
		{ id: 'f8', source: 'p2', target: 'p3', label: 'Оплаченный заказ' },
		{ id: 'f9', source: 'd1', target: 'p3', label: 'Состав заказа' },
		{ id: 'f10', source: 'p3', target: 'd3', label: 'Списание остатков' },
		{ id: 'f11', source: 'p3', target: 'e3', label: 'Накладная' },
		{ id: 'f12', source: 'e3', target: 'p3', label: 'Статус доставки' },
		{ id: 'f13', source: 'p3', target: 'e1', label: 'Уведомление об отгрузке' },
	],
}

export const SHOP_DFD_GANE_SARSON: FlowMapData = BASE

export const SHOP_DFD_YOURDON: FlowMapData = {
	...BASE,
	layout: { ...BASE.layout, options: { style: 'yourdon-demarco' } },
}
