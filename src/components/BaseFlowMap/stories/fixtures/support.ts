import type { FlowMapData } from '@components/BaseFlowMap'
import { defineFlowNotation } from '@components/BaseFlowMap'

export const SUPPORT_NOTATION = defineFlowNotation({
	id: 'support',
	label: () => 'Поддержка',
	standard: 'Регламент обращений',
	nodeKinds: {
		ticket: {
			label: () => 'Обращение',
			render: 'html',
			shape: { shape: 'round-rect' },
			size: { width: 200, height: 56 },
			icon: 'inbox',
			paletteGroup: 'support',
		},
		decision: {
			label: () => 'Решение',
			render: 'svg',
			shape: { shape: 'diamond', fill: 'var(--rise-bg-muted)', stroke: 'var(--rise-warning)' },
			size: { width: 132, height: 84 },
			labelPlacement: 'inside',
			paletteGroup: 'support',
		},
		done: {
			label: () => 'Закрыто',
			render: 'svg',
			shape: { shape: 'pill', ring: 'thick', fill: 'var(--rise-bg-muted)', stroke: 'var(--rise-success)' },
			size: { width: 120, height: 44 },
			labelPlacement: 'inside',
			paletteGroup: 'support',
		},
	},
	edgeKinds: {
		next: { label: () => 'Переход', stroke: 'solid', endMarker: 'arrow', routing: 'orthogonal' },
		escalate: { label: () => 'Эскалация', stroke: 'dashed', endMarker: 'arrow', color: 'var(--rise-error)', routing: 'orthogonal' },
	},
	groupKinds: { lane: { label: () => 'Дорожка', layout: 'band', header: 'start', border: 'solid' } },
	defaultNodeKind: 'ticket',
	defaultEdgeKind: 'next',
	layout: { algorithm: 'layered', direction: 'LR', routing: 'orthogonal' },
})

export const SUPPORT_MAP: FlowMapData = {
	version: 1,
	notation: 'support',
	title: 'Обработка обращения',
	description: 'Путь обращения клиента через поддержку и разработку',
	groups: [
		{ id: 'client', kind: 'lane', label: 'Клиент', order: 0, color: 'var(--rise-chart-1)' },
		{ id: 'support', kind: 'lane', label: 'Поддержка', order: 1, color: 'var(--rise-chart-3)' },
		{ id: 'dev', kind: 'lane', label: 'Разработка', order: 2, color: 'var(--rise-chart-5)' },
	],
	nodes: [
		{ id: 'request', kind: 'ticket', label: 'Обращение клиента', group: 'client' },
		{ id: 'triage', kind: 'decision', label: 'Решаем сами?', group: 'support' },
		{ id: 'reply', kind: 'ticket', label: 'Ответ клиенту', group: 'support' },
		{ id: 'handoff', kind: 'ticket', label: 'Передать разработчикам', group: 'support' },
		{ id: 'fix', kind: 'ticket', label: 'Исправить дефект', group: 'dev' },
		{ id: 'verify', kind: 'ticket', label: 'Проверить исправление', group: 'support' },
		{ id: 'closed', kind: 'done', label: 'Закрыто', group: 'client' },
	],
	edges: [
		{ id: 's1', source: 'request', target: 'triage' },
		{ id: 's2', source: 'triage', target: 'reply', label: 'да' },
		{ id: 's3', source: 'triage', target: 'handoff', kind: 'escalate', label: 'нет' },
		{ id: 's4', source: 'handoff', target: 'fix', kind: 'escalate' },
		{ id: 's5', source: 'fix', target: 'verify' },
		{ id: 's6', source: 'reply', target: 'closed' },
		{ id: 's7', source: 'verify', target: 'closed' },
	],
}
