import '@testing-library/jest-dom/vitest'
import { h } from 'vue'
import { mapData, mountMap, stubFrame } from '../flowUi'
import { fireEvent, screen } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const scenarioData = () =>
	mapData({
		scenarios: [
			{
				id: 's',
				label: 'Заказ',
				steps: [
					{ id: 'one', edge: 'e1', label: 'Создать' },
					{ id: 'two', edge: 'e2', label: 'Оплатить' },
				],
			},
		],
	})

const nodeOf = (name: RegExp) => screen.getByRole('graphics-object', { name })

afterEach(() => vi.restoreAllMocks())

describe('слоты панелей проходят через BaseFlowMap: широкий вид', () => {
	beforeEach(() => stubFrame(1200))

	it('tooltip получает цель и узел при наведении', async () => {
		mountMap({}, { slots: { tooltip: (slot: { node?: { label: string } }) => h('i', `подсказка ${slot.node?.label}`) } })
		await fireEvent.pointerEnter(nodeOf(/^Alpha/))
		expect(await screen.findByText('подсказка Alpha')).toBeInTheDocument()
	})

	it('legend получает строки легенды', () => {
		mountMap({}, { slots: { legend: (slot: { items: unknown[] }) => h('i', `легенда ${slot.items.length > 0}`) } })
		expect(screen.getByText('легенда true')).toBeInTheDocument()
	})

	it('scenario-step рисует каждый шаг сценария', async () => {
		mountMap(
			{ data: scenarioData(), scenario: 's' },
			{ slots: { 'scenario-step': (slot: { index: number }) => h('i', `шаг ${slot.index}`) } },
		)
		expect(await screen.findByText('шаг 0')).toBeInTheDocument()
		expect(screen.getByText('шаг 1')).toBeInTheDocument()
	})

	it('details заменяет подробности выбранного узла', async () => {
		mountMap({}, { slots: { details: (slot: { node?: { label: string } }) => h('i', `подробно ${slot.node?.label}`) } })
		await fireEvent.click(nodeOf(/^Alpha/))
		expect(await screen.findByText('подробно Alpha')).toBeInTheDocument()
	})

	it('inspector-end дописывает инспектор «Правки» для выбранного узла', async () => {
		mountMap(
			{ mode: 'edit' },
			{ slots: { 'inspector-end': (slot: { target: { id: string } }) => h('i', `инспектор ${slot.target.id}`) } },
		)
		await fireEvent.click(nodeOf(/^Alpha/))
		expect(await screen.findByText('инспектор a')).toBeInTheDocument()
	})
})

describe('слоты панелей проходят через BaseFlowMap: компактный вид', () => {
	beforeEach(() => stubFrame(400))

	it('details открывается в шторке', async () => {
		mountMap({}, { slots: { details: (slot: { node?: { label: string } }) => h('i', `подробно ${slot.node?.label}`) } })
		await fireEvent.click(nodeOf(/^Alpha/))
		expect(await screen.findByText('подробно Alpha')).toBeInTheDocument()
	})

	it('inspector-end дописывает шторку инспектора', async () => {
		mountMap(
			{ mode: 'edit' },
			{ slots: { 'inspector-end': (slot: { target: { id: string } }) => h('i', `инспектор ${slot.target.id}`) } },
		)
		await fireEvent.click(nodeOf(/^Alpha/))
		expect(await screen.findByText('инспектор a')).toBeInTheDocument()
	})
})
