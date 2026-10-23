import '@testing-library/jest-dom/vitest'
import { fireEvent, screen } from '@testing-library/vue'
import { mountMap, stubFrame } from '../fixtures/flow2Ui'
import { flowServices } from '../../../model/notations/services'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { FlowNotation } from '../../../types/api/flowNotation.types'
import { edge, map, node, tree, zoomNotation } from '../fixtures/flow2Data'

beforeEach(() => stubFrame(1000))

afterEach(() => {
	vi.restoreAllMocks()
	vi.useRealTimers()
})

async function mountSettled(props = {}) {
	vi.useFakeTimers()
	const view = mountMap(props)
	await vi.advanceTimersByTimeAsync(1000)
	return view
}

describe('смысловой зум по масштабу вида', () => {
	it('уровень меняется только после паузы 150 мс', async () => {
		const view = await mountSettled()
		const controller = view.controllerOf()
		controller.setViewport({ x: 0, y: 0, zoom: 0.9 })
		await vi.advanceTimersByTimeAsync(200)
		expect(controller.getLevel().index).toBe(0)
		await vi.advanceTimersByTimeAsync(1000)
		controller.setViewport({ x: 0, y: 0, zoom: 2.5 })
		await vi.advanceTimersByTimeAsync(100)
		expect(controller.getLevel().index).toBe(0)
		await vi.advanceTimersByTimeAsync(60)
		expect(controller.getLevel().index).toBe(2)
	})

	it('дребезг: из нескольких быстрых изменений масштаба действует последнее', async () => {
		const view = await mountSettled()
		const controller = view.controllerOf()
		controller.setViewport({ x: 0, y: 0, zoom: 0.9 })
		await vi.advanceTimersByTimeAsync(1200)
		controller.setViewport({ x: 0, y: 0, zoom: 2.5 })
		await vi.advanceTimersByTimeAsync(100)
		controller.setViewport({ x: 0, y: 0, zoom: 0.7 })
		await vi.advanceTimersByTimeAsync(100)
		expect(controller.getLevel().index).toBe(0)
		await vi.advanceTimersByTimeAsync(100)
		expect(controller.getLevel().index).toBe(1)
	})

	it('явное переключение уровня держится, пока масштаб не уйдёт заметно после 700 мс', async () => {
		const view = await mountSettled()
		const controller = view.controllerOf()
		controller.setLevel(1)
		await vi.advanceTimersByTimeAsync(300)
		expect(controller.getLevel().index).toBe(1)
		await vi.advanceTimersByTimeAsync(1000)
		controller.setViewport({ x: 0, y: 0, zoom: 3 })
		await vi.advanceTimersByTimeAsync(200)
		expect(controller.getLevel().index).toBe(2)
	})

	it('isSemanticZoom=false: масштаб не меняет группы и уровней нет', async () => {
		const view = await mountSettled({ isSemanticZoom: false })
		const controller = view.controllerOf()
		controller.setViewport({ x: 0, y: 0, zoom: 3 })
		await vi.advanceTimersByTimeAsync(400)
		expect(controller.getLevel().count).toBe(0)
		expect(controller.getCollapsed()).toEqual([])
	})

	it('размонтирование отменяет отложенное изменение масштаба', async () => {
		const view = await mountSettled()
		view.controllerOf().setViewport({ x: 0, y: 0, zoom: 2.5 })
		view.unmount()
		await expect(vi.advanceTimersByTimeAsync(500)).resolves.toBeDefined()
	})

	it('морфинг вешает класс на корень на время перестроения', async () => {
		const view = await mountSettled()
		const root = view.container.querySelector('.base-flow-map') as HTMLElement
		expect(root).not.toHaveClass('base-flow-map--morph')
		view.controllerOf().setLevel(2)
		await vi.advanceTimersByTimeAsync(10)
		expect(root).toHaveClass('base-flow-map--morph')
		await vi.advanceTimersByTimeAsync(400)
		expect(root).not.toHaveClass('base-flow-map--morph')
	})
})

describe('клавиатура и поиск при свёрнутых группах', () => {
	it('Home и End идут по видимым узлам, включая блок', async () => {
		const view = mountMap()
		const region = screen.getByRole('graphics-document')
		await fireEvent.keyDown(region, { key: 'End' })
		await vi.waitFor(() => expect(document.activeElement).toHaveAttribute('data-flow-id', 'g1'))
		await fireEvent.keyDown(region, { key: 'Home' })
		await vi.waitFor(() => expect(document.activeElement).toHaveAttribute('data-flow-id', 'd'))
		expect(view.container.querySelector('[data-flow-id="a"]')).toBeNull()
	})

	it('набор букв находит блок по подписи', async () => {
		mountMap()
		const region = screen.getByRole('graphics-document')
		await fireEvent.keyDown(region, { key: 'Ш' })
		await vi.waitFor(() => expect(document.activeElement).toHaveAttribute('data-flow-id', 'g1'))
	})

	it('стрелка выбирает ближайший видимый узел', async () => {
		mountMap()
		const region = screen.getByRole('graphics-document')
		await fireEvent.keyDown(region, { key: 'Home' })
		await vi.waitFor(() => expect(document.activeElement).toHaveAttribute('data-flow-id', 'd'))
		await fireEvent.keyDown(region, { key: 'ArrowLeft' })
		await fireEvent.keyDown(region, { key: 'ArrowUp' })
		await fireEvent.keyDown(region, { key: 'ArrowRight' })
		await fireEvent.keyDown(region, { key: 'ArrowDown' })
		await vi.waitFor(() => expect(document.activeElement).toHaveAttribute('data-flow-id'))
	})

	it('фокус на скрытом узле через контроллер разворачивает группу и ставит фокус на узел', async () => {
		const view = mountMap()
		view.controllerOf().focus('c')
		await vi.waitFor(() => expect(view.controllerOf().getCollapsed()).toEqual([]))
		expect(await screen.findByLabelText(/Gamma/, { selector: '[data-flow-entity="node"]' })).toBeInTheDocument()
	})
})

describe('вид узла: подзаголовок и подпись снизу (v6.1)', () => {
	const notation: FlowNotation = {
		...flowServices,
		id: 'kit',
		nodeKinds: {
			...flowServices.nodeKinds,
			below: {
				...flowServices.nodeKinds.service,
				labelPlacement: 'bottom-start',
				subtitle: item => `вид:${item.label}`,
			},
			plain: { ...flowServices.nodeKinds.service },
		},
	}
	const data = map({
		notation: 'kit',
		nodes: [
			node('n1', { kind: 'below', label: 'Первый', subtitle: 'не будет показан' }),
			node('n2', { kind: 'plain', label: 'Второй', subtitle: 'из данных' }),
			node('n3', { kind: 'plain', label: 'Третий' }),
		],
		edges: [edge('e', ['n1', 'n2'])],
	})

	it('bottom-start ставит класс «подпись снизу», подзаголовок берётся у вида', () => {
		const { container } = mountMap({ data, notations: [notation] })
		const first = container.querySelector('[data-flow-id="n1"]') as HTMLElement
		expect(first).toHaveClass('base-flow-map__node--label-bottom')
		expect(first).toHaveTextContent('вид:Первый')
		expect(first).not.toHaveTextContent('не будет показан')
	})

	it('без функции у вида подзаголовок — из данных узла, а класса нет', () => {
		const { container } = mountMap({ data, notations: [notation] })
		const second = container.querySelector('[data-flow-id="n2"]') as HTMLElement
		expect(second).not.toHaveClass('base-flow-map__node--label-bottom')
		expect(second).toHaveTextContent('из данных')
		expect(container.querySelector('[data-flow-id="n3"] .base-flow-map__node-subtitle')).toBeNull()
	})

	it('блок свёрнутой группы без своей нотации получает подзаголовок «N элементов»', () => {
		mountMap({ data: tree(), notations: [zoomNotation] })
		expect(screen.getByLabelText(/Шлюз/, { selector: '[data-flow-entity="node"]' })).toHaveTextContent(/3/)
	})
})
