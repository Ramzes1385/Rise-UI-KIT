import { MAIN_MAP } from './services'
import type { FlowEdge, FlowMapData, FlowNode } from '../../types/data/flowData.types'
import type { FlowAuthor, FlowCommentThread, FlowSuggestion, FlowVersion } from '../../types/data/flowReview.types'

const HOUR = 3_600_000
const NOW = Date.UTC(2026, 9, 18, 9, 0)

export const REVIEW_AUTHORS: Record<'maria' | 'oleg' | 'ivan' | 'anna', FlowAuthor> = {
	maria: { name: 'Мария' },
	oleg: { name: 'Олег' },
	ivan: { name: 'Иван' },
	anna: { name: 'Анна' },
}

const CART_NODE: FlowNode = {
	id: 'cart',
	kind: 'cache',
	label: 'Кеш корзины',
	subtitle: 'Redis · TTL 15 мин',
	group: 'data',
	status: 'ok',
}

const CART_EDGE: FlowEdge = { id: 'e12', kind: 'data', source: 'orders', target: 'cart', label: 'корзина' }

const REVIEW_BASE: FlowMapData = { ...MAIN_MAP, scenarios: undefined }

export const REVIEW_CURRENT: FlowMapData = {
	...REVIEW_BASE,
	nodes: [...REVIEW_BASE.nodes, CART_NODE],
	edges: [...REVIEW_BASE.edges, CART_EDGE],
}

export const REVIEW_SUGGESTIONS: FlowSuggestion[] = [
	{
		id: 'sg-cache',
		author: REVIEW_AUTHORS.ivan,
		date: NOW - 2 * HOUR,
		label: 'Добавить кеш каталога',
		status: 'open',
		baseVersion: 'v15',
		changes: [
			{ type: 'add', entity: 'node', value: { ...CART_NODE, id: 'cart-2', label: 'Кеш каталога', subtitle: 'Redis · TTL 5 мин' } },
			{ type: 'add', entity: 'edge', value: { id: 'e13', kind: 'data', source: 'inv', target: 'cart-2', label: 'каталог' } },
		],
	},
	{
		id: 'sg-rename',
		author: REVIEW_AUTHORS.maria,
		date: NOW - 90 * 60_000,
		label: 'Переименовать Payments в Billing',
		status: 'open',
		baseVersion: 'v15',
		changes: [{ type: 'update', entity: 'node', id: 'pay', patch: { label: 'Billing' }, previous: { label: 'Payments' } }],
	},
	{
		id: 'sg-move',
		author: REVIEW_AUTHORS.oleg,
		date: NOW - 45 * 60_000,
		label: 'Уточнить подпись Notifications',
		status: 'open',
		baseVersion: 'v15',
		changes: [
			{ type: 'update', entity: 'node', id: 'notify', patch: { subtitle: 'Node.js · очередь' }, previous: { subtitle: 'Node.js' } },
		],
	},
	{
		id: 'sg-stale',
		author: REVIEW_AUTHORS.anna,
		date: NOW - 26 * HOUR,
		label: 'Убрать Auth',
		status: 'open',
		baseVersion: 'v13',
		changes: [
			{
				type: 'remove',
				entity: 'node',
				id: 'auth',
				index: 3,
				value: REVIEW_BASE.nodes.find(node => node.id === 'auth') as FlowNode,
			},
		],
	},
	{
		id: 'sg-done',
		author: REVIEW_AUTHORS.maria,
		date: NOW - 30 * HOUR,
		label: 'Подписать связь кеша',
		status: 'accepted',
		baseVersion: 'v14',
		changes: [{ type: 'update', entity: 'edge', id: 'e10', patch: { label: 'кеш' }, previous: { label: 'кеш остатков' } }],
	},
]

export const REVIEW_THREADS: FlowCommentThread[] = [
	{
		id: 'th-pay',
		target: { entity: 'node', id: 'pay' },
		isResolved: false,
		isUnread: true,
		comments: [
			{
				id: 'c1',
				author: REVIEW_AUTHORS.maria,
				date: NOW - 20 * 60_000,
				text: 'Billing — это ещё и подписки? Тогда имя шире, чем сервис сейчас.',
				replies: [
					{ id: 'c2', author: REVIEW_AUTHORS.oleg, date: NOW - 12 * 60_000, text: 'Да, подписки переедут сюда в ноябре.' },
					{ id: 'c3', author: REVIEW_AUTHORS.oleg, date: NOW - 2 * 60_000, text: 'Ок, оставим Payments до переезда подписок.' },
				],
			},
		],
	},
	{
		id: 'th-redis',
		target: { entity: 'node', id: 'redis' },
		isResolved: false,
		comments: [
			{
				id: 'c4',
				author: REVIEW_AUTHORS.anna,
				date: NOW - HOUR,
				text: 'Кеш корзины — в том же кластере Redis или отдельный?',
				replies: [
					{
						id: 'c5',
						author: REVIEW_AUTHORS.ivan,
						date: NOW - 50 * 60_000,
						text: 'Отдельный: другой TTL и своя политика вытеснения.',
					},
				],
			},
		],
	},
	{
		id: 'th-event',
		target: { entity: 'edge', id: 'e9' },
		isResolved: true,
		comments: [
			{
				id: 'c6',
				author: REVIEW_AUTHORS.ivan,
				date: NOW - 5 * HOUR,
				text: 'Схема события order.created — в реестре, ссылка в описании связи.',
			},
		],
	},
]

const without = (data: FlowMapData, nodeIds: string[]): FlowMapData => ({
	...data,
	nodes: data.nodes.filter(node => !nodeIds.includes(node.id)),
	edges: data.edges.filter(edge => !nodeIds.includes(edge.source) && !nodeIds.includes(edge.target)),
})

const renamed = (data: FlowMapData, id: string, label: string): FlowMapData => ({
	...data,
	nodes: data.nodes.map(node => (node.id === id ? { ...node, label } : node)),
})

export const REVIEW_VERSIONS: FlowVersion[] = [
	{ id: 'v15', label: 'v15 · текущая', date: NOW - 2 * HOUR, author: REVIEW_AUTHORS.ivan, data: REVIEW_CURRENT },
	{
		id: 'v14',
		label: 'v14 · согласовано',
		date: NOW - 26 * HOUR,
		author: REVIEW_AUTHORS.maria,
		data: renamed(without(REVIEW_CURRENT, ['cart']), 'bank', 'Банк — было'),
	},
	{ id: 'v13', label: 'v13', date: NOW - 72 * HOUR, author: REVIEW_AUTHORS.oleg, data: without(REVIEW_CURRENT, ['cart', 'notify']) },
	{
		id: 'v12',
		label: 'v12',
		date: NOW - 120 * HOUR,
		author: REVIEW_AUTHORS.anna,
		data: without(REVIEW_CURRENT, ['cart', 'notify', 'redis']),
	},
]
