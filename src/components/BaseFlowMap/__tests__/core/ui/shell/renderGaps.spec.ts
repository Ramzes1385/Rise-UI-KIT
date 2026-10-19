import '@testing-library/jest-dom/vitest'
import { UI_FLOW_EDITOR } from '@/locales/messages'
import { mapData, mountMap, stubFrame } from '../flowUi'
import { fireEvent, screen, waitFor } from '@testing-library/vue'
import { flowServices } from '../../../../model/notations/services'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { FlowNotation } from '../../../../types/api/flowNotation.types'
import type { FlowMapPlugin } from '../../../../types/api/flowController.types'

afterEach(() => vi.restoreAllMocks())

const rect = (x: number) => ({ x, y: 0, width: 100, height: 40 })

describe('сетка в режиме «Правка» (useBaseFlowMap.editClasses)', () => {
	it('в широком виде выключатель «Сетка» добавляет и убирает класс без сетки, в просмотре классов нет', async () => {
		stubFrame(1200)
		const { container } = mountMap({ mode: 'edit' })
		const stage = container.querySelector('.base-flow-map__stage') as HTMLElement
		expect(stage).toHaveClass('base-flow-map__stage--edit')
		expect(stage).not.toHaveClass('base-flow-map__stage--no-grid')
		const grid = screen.getByRole('switch', { name: UI_FLOW_EDITOR.GRID })
		await fireEvent.click(grid)
		expect(stage).toHaveClass('base-flow-map__stage--no-grid')
		await fireEvent.click(grid)
		expect(stage).not.toHaveClass('base-flow-map__stage--no-grid')
	})

	it('без режима правки и в узком виде класса правки нет', async () => {
		stubFrame(1200)
		const view = mountMap()
		expect(view.container.querySelector('.base-flow-map__stage--edit')).toBeNull()
		view.unmount()
		vi.restoreAllMocks()
		stubFrame(400)
		const compact = mountMap({ mode: 'edit' })
		await waitFor(() => expect(compact.container.querySelector('.base-flow-map--compact')).not.toBeNull())
		expect(compact.container.querySelector('.base-flow-map__stage--edit')).toBeNull()
		expect(compact.container.querySelector('.base-flow-map__stage--no-grid')).toBeNull()
	})
})

describe('вид без необязательных полей и раскладка с лишними и пропущенными узлами', () => {
	beforeEach(() => stubFrame(1200))

	const bare: FlowNotation = {
		...flowServices,
		id: 'bare',
		groupKinds: { plain: { label: () => 'Простая', layout: 'box' } },
		edgeKinds: { plain: { label: () => 'Простая', stroke: 'solid' } },
		defaultEdgeKind: 'plain',
	}

	it('группа без header и border получает верхний заголовок и сплошную рамку, связь без маркера — без стрелки', () => {
		const { container } = mountMap({
			notations: [bare],
			data: mapData({
				notation: 'bare',
				groups: [{ id: 'g', kind: 'plain', label: 'Группа' }],
				nodes: mapData().nodes.map(item => (item.id === 'a' ? { ...item, group: 'g' } : item)),
			}),
		})
		const group = container.querySelector('[data-flow-entity="group"]') as HTMLElement
		expect(group).toHaveClass('base-flow-map__group--header-top', 'base-flow-map__group--solid')
		expect(container.querySelector('[data-flow-entity="edge"] path[marker-end]')).toBeNull()
	})

	const odd: FlowMapPlugin = {
		name: 'odd',
		layouts: [
			{
				id: 'odd',
				run: () => ({
					nodes: { a: rect(0), b: rect(300), phantom: rect(600) },
					groups: {},
					bounds: { x: 0, y: 0, width: 700, height: 40 },
				}),
			},
		],
	}

	it('узел без места в раскладке не рисуется, связи на узел вне данных и от него рисуются и подписаны по id', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const data = mapData({
			layout: { algorithm: 'odd' },
			edges: [
				{ id: 'e1', source: 'a', target: 'b', label: 'заказ' },
				{ id: 'e3', source: 'a', target: 'phantom' },
				{ id: 'e4', source: 'phantom', target: 'b' },
			],
		})
		const { container } = mountMap({ plugins: [odd], data })
		expect(screen.queryByRole('graphics-object', { name: /^Gamma/ })).toBeNull()
		expect(screen.getByRole('graphics-object', { name: /^Alpha/ })).toBeInTheDocument()
		const labels = [...container.querySelectorAll('[data-flow-entity="edge"]')].map(item => item.getAttribute('aria-label'))
		expect(labels.filter(label => label?.includes('phantom'))).toEqual(['Вызов: Alpha → phantom', 'Вызов: phantom → Beta'])
		warn.mockRestore()
	})
})
