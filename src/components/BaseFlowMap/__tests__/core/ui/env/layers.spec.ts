import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { UI_FLOW_SCENARIO } from '@/locales/messages'
import { fireEvent, screen, waitFor } from '@testing-library/vue'
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

const layerOf = (result: { container: Element }) => result.container.querySelector('.base-flow-map__scenario-layer')
const loaded = (result: { container: Element }) => waitFor(() => expect(layerOf(result)).not.toBeNull())

describe('BaseFlowMap подключение слоёв и панелей частей B и C', () => {
	it('слой сценария монтируется в холсте и показывает состояние', async () => {
		const result = mountMap({ data: data(), scenario: 's' })
		await loaded(result)
		const layer = layerOf(result) as SVGElement
		expect(layer).toHaveAttribute('data-status', 'idle')
		controllerOf(result as never).play('s')
		await nextTick()
		expect(layer).toHaveAttribute('data-status', 'playing')
	})

	it('слои правки и правок скрыты от скринридера после загрузки частей', async () => {
		const edit = mountMap({ mode: 'edit', modes: ['view', 'edit'] })
		await waitFor(() => expect(edit.container.querySelector('.base-flow-map__edit-layer')).toHaveAttribute('aria-hidden', 'true'))
		edit.unmount()
		const review = mountMap({ mode: 'review', modes: ['view', 'review'] })
		await waitFor(() => expect(review.container.querySelector('.base-flow-map__review-layer')).toHaveAttribute('aria-hidden', 'true'))
	})

	it('в просмотре без правок слоёв правки и правок нет', async () => {
		const { container } = mountMap()
		await new Promise(resolve => setTimeout(resolve, 30))
		expect(container.querySelector('.base-flow-map__edit-layer')).not.toBeInTheDocument()
		expect(container.querySelector('.base-flow-map__review-layer')).not.toBeInTheDocument()
	})

	it('панель сценария выводит имя сценария и управляет запуском', async () => {
		const result = mountMap({ data: data(), scenario: 's' })
		expect(await screen.findByRole('region', { name: UI_FLOW_SCENARIO.PANEL })).toHaveTextContent('Заказ')
		await fireEvent.click(screen.getByRole('button', { name: UI_FLOW_SCENARIO.PLAY }))
		expect(result.emitted()['scenario-change'].length).toBeGreaterThan(0)
	})

	it('без сценария панели сценария нет, а при выбранном сценарии она появляется', async () => {
		const { rerender } = mountMap()
		expect(screen.queryByRole('region', { name: UI_FLOW_SCENARIO.PANEL })).not.toBeInTheDocument()
		await rerender({ data: data(), scenario: 's' })
		expect(await screen.findByRole('region', { name: UI_FLOW_SCENARIO.PANEL })).toBeInTheDocument()
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
		const first = mountMap({ data: data(), scenario: 's', isAutoplay: true })
		await loaded(first)
		expect(controllerOf(first as never).getScenarioState().status).toBe('playing')
		first.unmount()
		mockMedia(true)
		const second = mountMap({ data: data(), scenario: 's', isAutoplay: true })
		await loaded(second)
		expect(controllerOf(second as never).getScenarioState().status).toBe('idle')
		vi.unstubAllGlobals()
	})

	it('время сценария идёт, пока карта видна, и стоит на скрытой вкладке', async () => {
		const result = mountMap({ data: data(), scenario: 's' })
		await loaded(result)
		vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout', 'clearTimeout'] })
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
		await waitFor(() => expect(wide.container.querySelector('.base-flow-map__edit-palette')).not.toBeNull())
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
