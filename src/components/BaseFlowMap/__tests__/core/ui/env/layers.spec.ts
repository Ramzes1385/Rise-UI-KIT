import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { UI_FLOW_SCENARIO } from '@/locales/messages'
import { fireEvent, screen } from '@testing-library/vue'
import { controllerOf, mapData, mockMedia, mountMap, stubFrame } from '../flowUi'

const data = () =>
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

describe('BaseFlowMap подключение слоёв и панелей частей B и C', () => {
	it('слой сценария монтируется в холсте и показывает состояние', async () => {
		const result = mountMap({ data: data(), scenario: 's' })
		const layer = result.container.querySelector('.base-flow-map__scenario-layer') as SVGElement
		expect(layer).toHaveAttribute('data-status', 'idle')
		controllerOf(result as never).play('s')
		await nextTick()
		expect(layer).toHaveAttribute('data-status', 'playing')
	})

	it('слои правки и правок на месте и скрыты от скринридера', () => {
		const { container } = mountMap()
		expect(container.querySelector('.base-flow-map__edit-layer')).toHaveAttribute('aria-hidden', 'true')
		expect(container.querySelector('.base-flow-map__review-layer')).toHaveAttribute('aria-hidden', 'true')
	})

	it('панель сценария выводит имя сценария и управляет запуском', async () => {
		const result = mountMap({ data: data(), scenario: 's' })
		expect(screen.getByRole('region', { name: UI_FLOW_SCENARIO.PANEL })).toHaveTextContent('Заказ')
		await fireEvent.click(screen.getByRole('button', { name: UI_FLOW_SCENARIO.PLAY }))
		expect(result.emitted()['scenario-change'].length).toBeGreaterThan(0)
	})

	it('без сценария панели сценария нет, а при выбранном сценарии она появляется', async () => {
		const { rerender } = mountMap()
		expect(screen.queryByRole('region', { name: UI_FLOW_SCENARIO.PANEL })).not.toBeInTheDocument()
		await rerender({ data: data(), scenario: 's' })
		expect(screen.getByRole('region', { name: UI_FLOW_SCENARIO.PANEL })).toBeInTheDocument()
		await rerender({ panels: ['toolbar'] })
		expect(screen.queryByRole('region', { name: UI_FLOW_SCENARIO.PANEL })).not.toBeInTheDocument()
	})

	it('легенда и мини-карта по умолчанию есть, а на пустой карте скрыты', async () => {
		const { container, rerender } = mountMap()
		expect(container.querySelector('.base-flow-map__legend')).toBeInTheDocument()
		expect(container.querySelector('.base-flow-map__minimap')).toBeInTheDocument()
		await rerender({ data: mapData({ nodes: [], edges: [] }) })
		expect(container.querySelector('.base-flow-map__legend')).not.toBeInTheDocument()
		expect(container.querySelector('.base-flow-map__minimap')).not.toBeInTheDocument()
	})

	it('панели можно выбрать списком: без legend и minimap их нет', () => {
		const { container } = mountMap({ panels: ['toolbar'] })
		expect(container.querySelector('.base-flow-map__legend')).not.toBeInTheDocument()
		expect(container.querySelector('.base-flow-map__minimap')).not.toBeInTheDocument()
	})

	it('подробности открываются по выбору элемента и закрываются кнопкой', async () => {
		mountMap()
		await fireEvent.click(screen.getByRole('graphics-object', { name: /^Alpha/ }))
		const panel = await screen.findByRole('region', { name: /Подробности/ })
		expect(panel).toHaveTextContent('Alpha')
		await fireEvent.click(screen.getByRole('button', { name: /Закрыть/ }))
		expect(screen.queryByRole('region', { name: /Подробности/ })).not.toBeInTheDocument()
	})

	it('isAutoplay запускает сценарий сам, при reduced motion — нет', async () => {
		vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout', 'clearTimeout'] })
		const first = mountMap({ data: data(), scenario: 's', isAutoplay: true })
		await nextTick()
		expect(controllerOf(first as never).getScenarioState().status).toBe('playing')
		first.unmount()
		mockMedia(true)
		const second = mountMap({ data: data(), scenario: 's', isAutoplay: true })
		await nextTick()
		expect(controllerOf(second as never).getScenarioState().status).toBe('idle')
		vi.unstubAllGlobals()
		vi.useRealTimers()
	})

	it('время сценария идёт, пока карта видна, и стоит на скрытой вкладке', async () => {
		vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout', 'clearTimeout'] })
		const result = mountMap({ data: data(), scenario: 's' })
		const controller = controllerOf(result as never)
		controller.play('s')
		await vi.advanceTimersByTimeAsync(300)
		const running = controller.getScenarioState().time
		expect(running).toBeGreaterThan(0)
		const state = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
		document.dispatchEvent(new Event('visibilitychange'))
		await vi.advanceTimersByTimeAsync(300)
		expect(controller.getScenarioState().time).toBe(running)
		state.mockReturnValue('visible')
		document.dispatchEvent(new Event('visibilitychange'))
		await vi.advanceTimersByTimeAsync(300)
		expect(controller.getScenarioState().time).toBeGreaterThan(running)
		vi.useRealTimers()
	})
})

describe('легенда и мини-карта в режиме «Правка»', () => {
	afterEach(() => vi.restoreAllMocks())

	it('без compact в «Правке» их нет, в compact остаются', async () => {
		stubFrame(1280)
		const wide = mountMap({ mode: 'edit' })
		await nextTick()
		await nextTick()
		expect(wide.container.querySelector('.base-flow-map__legend')).not.toBeInTheDocument()
		expect(wide.container.querySelector('.base-flow-map__minimap')).not.toBeInTheDocument()
		wide.unmount()
		stubFrame(375)
		const narrow = mountMap({ mode: 'edit' })
		await nextTick()
		await nextTick()
		expect(narrow.container.querySelector('.base-flow-map__legend')).toBeInTheDocument()
	})
})
