import '@testing-library/jest-dom/vitest'
import { h } from 'vue'
import { screen, waitFor } from '@testing-library/vue'
import { useFlowMap3DEnvironment } from '../helpers/flowMap3d.test-utils'
import type { FlowMapData } from '@components/BaseFlowMap/types/data/flowData.types'

const env = useFlowMap3DEnvironment()

const DATA: FlowMapData = {
	version: 1,
	title: 'Слоты',
	nodes: [
		{ id: 'a', label: 'Первый', kind: 'service', group: 'g', position: { x: 0, y: 0 }, isPinned: true },
		{ id: 'b', label: 'Второй', kind: 'service', group: 'g', position: { x: 300, y: 0 }, isPinned: true },
	],
	edges: [{ id: 'e', source: 'a', target: 'b', label: 'вызов' }],
	groups: [{ id: 'g', kind: 'zone', label: 'Зона' }],
	scenarios: [{ id: 's', label: 'Сценарий', steps: [{ id: 's1', edge: 'e', label: 'Шаг' }] }],
}

const SLOTS = [
	'node',
	'edge-label',
	'group-label',
	'tooltip',
	'details',
	'toolbar',
	'level',
	'legend',
	'scenario-step',
	'inspector-end',
	'empty',
]

function slotSet(): Record<string, (props: never) => ReturnType<typeof h>> {
	return Object.fromEntries(SLOTS.map(name => [name, () => h('span', { 'data-slot': name }, name)]))
}

describe('BaseFlowMap3D: слоты 2D-вида', () => {
	it('слоты ядра карты передаются во вложенную 2D-карту и рисуются в ней', async () => {
		const { container } = await env.renderMap({ data: DATA, view: '2d', isAutoplay: false }, slotSet() as never, { isRenderer: false })
		await waitFor(() => expect(container.querySelector('.base-flow-map')).toBeInTheDocument())
		await waitFor(() => expect(container.querySelectorAll('[data-slot]').length).toBeGreaterThan(0), { timeout: 10_000 })
		expect(screen.getAllByRole('region', { name: 'Слоты' })).not.toHaveLength(0)
	}, 30_000)

	it('пустая карта показывает слот `empty` во вложенной 2D-карте', async () => {
		const { container } = await env.renderMap(
			{ data: { version: 1, title: 'Пусто', nodes: [], edges: [] }, view: '2d' },
			{ empty: () => h('span', { 'data-slot': 'empty' }, 'пусто') } as never,
			{ isRenderer: false },
		)
		await waitFor(() => expect(container.querySelector('[data-slot="empty"]')).toBeInTheDocument(), { timeout: 10_000 })
	}, 30_000)
})
