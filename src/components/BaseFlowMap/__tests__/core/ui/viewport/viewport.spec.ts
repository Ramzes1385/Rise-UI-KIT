import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { fireEvent, screen } from '@testing-library/vue'
import { controllerOf, mapData, mockMedia, mountMap, pinned, sceneView, stubFrame } from '../flowUi'

async function opened(props: Parameters<typeof mountMap>[0] = {}) {
	stubFrame(800, 400)
	const result = mountMap(props)
	await nextTick()
	await nextTick()
	return { ...result, controller: controllerOf(result as never) }
}

function stubAreaInRoot(width: number, height: number) {
	vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
		return this.classList.contains('base-flow-map') ? 1280 : width
	})
	vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(height)
}

function useClock() {
	vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout', 'clearTimeout'] })
}

describe('BaseFlowMap вид', () => {
	afterEach(() => {
		vi.useRealTimers()
		vi.unstubAllGlobals()
	})

	it('подбирает масштаб под область при открытии и не увеличивает больше 100 %', async () => {
		const { container } = await opened()
		const view = sceneView(container)
		expect(view.zoom).toBeLessThanOrEqual(1)
		expect(view.zoom).toBeGreaterThan(0)
		expect(screen.getByLabelText(/^Масштаб \d+ %$/)).toHaveTextContent(`${Math.round(view.zoom * 100)}%`)
	})

	it('мелкая область не увеличивает карту, а крупная вписывает целиком', async () => {
		const wide = mapData({
			nodes: [
				{ id: 'a', kind: 'service', label: 'A', ...pinned(0, 0) },
				{ id: 'b', kind: 'service', label: 'B', ...pinned(3000, 0) },
			],
			edges: [],
		})
		const { container } = await opened({ data: wide })
		expect(sceneView(container).zoom).toBeLessThan(0.3)
	})

	it('кнопки панели увеличивают и уменьшают в 1,25 раза плавно, событие приходит в конце анимации', async () => {
		useClock()
		const result = await opened()
		const start = sceneView(result.container).zoom
		await fireEvent.click(screen.getByRole('button', { name: 'Увеличить' }))
		await vi.advanceTimersByTimeAsync(100)
		const middle = sceneView(result.container).zoom
		expect(middle).toBeGreaterThan(start)
		expect(middle).toBeLessThan(start * 1.25)
		expect(result.container.querySelector('.base-flow-map__viewport--animating')).toBeInTheDocument()
		const before = result.emitted()['viewport-change']?.length ?? 0
		await vi.advanceTimersByTimeAsync(300)
		expect(sceneView(result.container).zoom).toBeCloseTo(start * 1.25, 5)
		expect(result.container.querySelector('.base-flow-map__viewport--animating')).not.toBeInTheDocument()
		expect(result.emitted()['viewport-change']).toHaveLength(before + 1)
		await fireEvent.click(screen.getByRole('button', { name: 'Уменьшить' }))
		await vi.advanceTimersByTimeAsync(400)
		expect(sceneView(result.container).zoom).toBeCloseTo(start, 5)
	})

	it('новое действие во время анимации прерывает её', async () => {
		useClock()
		const { container } = await opened()
		const start = sceneView(container).zoom
		await fireEvent.click(screen.getByRole('button', { name: 'Увеличить' }))
		await vi.advanceTimersByTimeAsync(50)
		await fireEvent.click(screen.getByRole('button', { name: 'Увеличить' }))
		await vi.advanceTimersByTimeAsync(400)
		expect(sceneView(container).zoom).toBeGreaterThan(start * 1.25)
	})

	it('размонтирование во время анимации её останавливает', async () => {
		useClock()
		const result = await opened()
		await fireEvent.click(screen.getByRole('button', { name: 'Увеличить' }))
		result.unmount()
		await vi.advanceTimersByTimeAsync(400)
		expect(vi.getTimerCount()).toBe(0)
	})

	it('при reduced motion вид меняется сразу, без анимации', async () => {
		mockMedia(true)
		const result = await opened()
		const start = sceneView(result.container).zoom
		await fireEvent.click(screen.getByRole('button', { name: 'Увеличить' }))
		expect(sceneView(result.container).zoom).toBeCloseTo(start * 1.25, 5)
		expect(result.container.querySelector('.base-flow-map__viewport--animating')).not.toBeInTheDocument()
	})

	it('без requestAnimationFrame вид тоже меняется сразу', async () => {
		vi.stubGlobal('requestAnimationFrame', undefined)
		const result = await opened()
		const start = sceneView(result.container).zoom
		await fireEvent.click(screen.getByRole('button', { name: 'Увеличить' }))
		expect(sceneView(result.container).zoom).toBeCloseTo(start * 1.25, 5)
	})

	it('кнопка «Вписать» возвращает вид и снова включает автоподбор при смене размера', async () => {
		stubAreaInRoot(800, 400)
		const sizes: ResizeObserverCallback[] = []
		vi.stubGlobal(
			'ResizeObserver',
			class {
				constructor(callback: ResizeObserverCallback) {
					sizes.push(callback)
				}
				observe() {}
				disconnect() {}
			},
		)
		const result = mountMap()
		await nextTick()
		await nextTick()
		const fitted = sceneView(result.container)
		await fireEvent.wheel(screen.getByRole('graphics-document'), { deltaY: -300, ctrlKey: true })
		expect(sceneView(result.container)).not.toEqual(fitted)
		stubAreaInRoot(200, 100)
		sizes.forEach(callback => callback([], {} as ResizeObserver))
		await nextTick()
		await nextTick()
		expect(sceneView(result.container).zoom).toBeGreaterThan(1.2)
		await fireEvent.click(screen.getByRole('button', { name: 'Вписать в экран' }))
		expect(sceneView(result.container).zoom).toBeLessThan(1)
		stubAreaInRoot(800, 400)
		sizes.forEach(callback => callback([], {} as ResizeObserver))
		await nextTick()
		await nextTick()
		expect(sceneView(result.container)).toEqual(fitted)
	})

	it('контроллер: getViewport и setViewport с ограничением масштаба и событием', async () => {
		const { controller, emitted } = await opened()
		controller.setViewport({ x: 10, y: 20, zoom: 9 })
		expect(controller.getViewport()).toEqual({ x: 10, y: 20, zoom: 3 })
		expect(emitted()['viewport-change'].at(-1)).toEqual([{ x: 10, y: 20, zoom: 3 }])
		controller.setViewport({ x: 0, y: 0, zoom: 0.01 })
		expect(controller.getViewport().zoom).toBe(0.2)
	})

	it('контроллер: zoom числом ограничивается пределами', async () => {
		useClock()
		const { controller, container } = await opened()
		controller.setViewport({ x: 0, y: 0, zoom: 1 })
		controller.zoom(2)
		await vi.advanceTimersByTimeAsync(400)
		expect(controller.getViewport().zoom).toBeCloseTo(2, 5)
		controller.zoom(9)
		await vi.advanceTimersByTimeAsync(400)
		expect(controller.getViewport().zoom).toBe(3)
		expect(sceneView(container).zoom).toBe(3)
	})

	it('контроллер: zoom in и out без анимации при reduced motion', async () => {
		mockMedia(true)
		const { controller } = await opened()
		controller.setViewport({ x: 0, y: 0, zoom: 1 })
		controller.zoom('in')
		expect(controller.getViewport().zoom).toBeCloseTo(1.25, 5)
		controller.zoom('out')
		expect(controller.getViewport().zoom).toBeCloseTo(1, 5)
	})

	it('контроллер: fitView по узлам, с отступом, пределом и анимацией', async () => {
		mockMedia(true)
		const { controller } = await opened()
		controller.fitView({ ids: ['a'], maxZoom: 2, padding: 10 })
		expect(controller.getViewport().zoom).toBe(1)
		controller.fitView({ ids: ['nope'] })
		const all = controller.getViewport()
		controller.fitView({ ids: [] })
		expect(controller.getViewport()).toEqual(all)
		controller.setViewport({ x: 500, y: 500, zoom: 0.5 })
		controller.fitView({ isAnimated: true })
		expect(controller.getViewport()).toEqual(all)
	})

	it('контроллер: focus центрирует узел, переносит фокус и увеличивает при isZoomed', async () => {
		mockMedia(true)
		const { controller } = await opened()
		controller.setViewport({ x: 0, y: 0, zoom: 0.5 })
		controller.focus('missing')
		expect(controller.getViewport()).toEqual({ x: 0, y: 0, zoom: 0.5 })
		controller.focus('b')
		const centered = controller.getViewport()
		expect(centered.zoom).toBe(0.5)
		expect(centered.x).toBeCloseTo(400 - (300 + 80) * 0.5, 0)
		await vi.waitFor(() => expect(screen.getByRole('graphics-object', { name: /^Beta/ })).toHaveFocus())
		controller.focus('c', { isZoomed: true, isAnimated: true })
		expect(controller.getViewport().zoom).toBe(1)
	})

	it('контроллер: focus группы центрирует рамку', async () => {
		mockMedia(true)
		const { controller } = await opened({ data: mapData({ groups: [{ id: 'g', kind: 'zone', label: 'Зона' }] }) })
		controller.focus('g')
		expect(controller.getViewport().zoom).toBeGreaterThan(0)
	})

	it('контроллер: экспорт SVG содержит узлы, связи и подписи, а область «viewport» берёт видимый кусок', async () => {
		const { controller } = await opened()
		const svg = await controller.exportSvg()
		expect(svg).toContain('<svg')
		expect(svg).toContain('Alpha')
		expect(svg).toContain('<path')
		const part = await controller.exportSvg({ area: 'viewport', background: 'transparent' })
		expect(part).toContain('viewBox="')
		expect(part).not.toContain('fill="#f6f6f7"')
	})

	it('контроллер: экспорт PNG пробует собрать картинку из SVG', async () => {
		const { controller } = await opened()
		vi.stubGlobal('URL', { createObjectURL: () => 'blob:x', revokeObjectURL: vi.fn() })
		vi.stubGlobal(
			'Image',
			class {
				onerror: (() => void) | null = null
				set src(_value: string) {
					queueMicrotask(() => this.onerror?.())
				}
			},
		)
		await expect(controller.exportPng()).rejects.toThrow('svg')
	})
})
