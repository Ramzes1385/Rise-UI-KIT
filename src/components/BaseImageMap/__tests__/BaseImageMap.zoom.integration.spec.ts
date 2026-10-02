import '@testing-library/jest-dom/vitest'
import BaseImageMap from '../ui/BaseImageMap.vue'
import { defineComponent, h, nextTick } from 'vue'
import userEvent from '@testing-library/user-event'
import type { BaseImageMapExpose } from '../types/BaseImageMap.types'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { IMAGE_MAP_FLOORS, IMAGE_MAP_HOTSPOTS } from '../stories/fixtures'
import { mockRects, mockViewport, objectElement, pointer, SIMPLE_DATA, stageTransform } from './imageMap.test-utils'

const BASE_PROPS = { hasFullscreen: false }
const ZOOMED = 'translate(-200px, -125px) scale(1.5)'

function parts(container: Element) {
	return {
		viewport: container.querySelector('.base-image-map__viewport') as HTMLElement,
		stage: container.querySelector('.base-image-map__stage') as HTMLElement,
	}
}

async function renderMap(props: Record<string, unknown> = {}) {
	mockViewport()
	mockRects({})
	const result = render(BaseImageMap, { props: { data: SIMPLE_DATA, ...BASE_PROPS, ...props } })
	await nextTick()
	return { ...result, ...parts(result.container) }
}

async function renderExposed(props: Record<string, unknown> = {}) {
	mockViewport()
	mockRects({})
	const onLayerChange = vi.fn()
	let exposed: BaseImageMapExpose | undefined
	const Host = defineComponent({
		setup: () => () =>
			h(BaseImageMap, {
				data: SIMPLE_DATA,
				...BASE_PROPS,
				...props,
				onLayerChange,
				ref: (instance: unknown) => {
					exposed = (instance as BaseImageMapExpose | null) ?? exposed
				},
			}),
	})
	const result = render(Host)
	await nextTick()
	return { ...result, onLayerChange, expose: () => exposed as BaseImageMapExpose }
}

describe('BaseImageMap zoom — кнопки и клавиши', () => {
	it('«Увеличить» масштабирует вокруг центра с анимацией, «Уменьшить» и «Сбросить» возвращают', async () => {
		const user = userEvent.setup()
		const { container, stage, viewport } = await renderMap()
		expect(stageTransform(container)).toBe('translate(0px, 0px) scale(1)')
		expect(stage.style.width).toBe('800px')
		expect(stage.style.height).toBe('500px')
		await user.click(screen.getByRole('button', { name: 'Увеличить' }))
		expect(stageTransform(container)).toBe(ZOOMED)
		expect(stage.style.getPropertyValue('--im-scale')).toBe('1.5')
		expect(stage).toHaveClass('base-image-map__stage--animated')
		expect(viewport).toHaveClass('base-image-map__viewport--zoomed')
		expect(screen.getByRole('button', { name: 'Уменьшить' })).toBeEnabled()
		await user.click(screen.getByRole('button', { name: 'Уменьшить' }))
		expect(stageTransform(container)).toBe('translate(0px, 0px) scale(1)')
		await user.click(screen.getByRole('button', { name: 'Увеличить' }))
		await user.click(screen.getByRole('button', { name: 'Сбросить масштаб' }))
		expect(stageTransform(container)).toBe('translate(0px, 0px) scale(1)')
		expect(viewport).not.toHaveClass('base-image-map__viewport--zoomed')
	})

	it('масштаб не превышает maxZoom, «Увеличить» на пределе неактивна', async () => {
		const user = userEvent.setup()
		const { container } = await renderMap({ maxZoom: 2 })
		const zoomIn = screen.getByRole('button', { name: 'Увеличить' })
		await user.click(zoomIn)
		await user.click(zoomIn)
		expect(stageTransform(container)).toContain('scale(2)')
		expect(zoomIn).toBeDisabled()
	})

	it('клавиши +, =, -, 0 в окне карты; с Ctrl, Alt или ⌘ — не трогают масштаб', async () => {
		const { container, viewport } = await renderMap()
		await fireEvent.keyDown(viewport, { key: '+' })
		expect(stageTransform(container)).toBe(ZOOMED)
		await fireEvent.keyDown(viewport, { key: '-' })
		await fireEvent.keyDown(viewport, { key: '=' })
		expect(stageTransform(container)).toBe(ZOOMED)
		await fireEvent.keyDown(viewport, { key: '0' })
		expect(stageTransform(container)).toBe('translate(0px, 0px) scale(1)')
		await fireEvent.keyDown(viewport, { key: '+', ctrlKey: true })
		await fireEvent.keyDown(viewport, { key: '+', metaKey: true })
		await fireEvent.keyDown(viewport, { key: '+', altKey: true })
		await fireEvent.keyDown(viewport, { key: 'a' })
		expect(stageTransform(container)).toBe('translate(0px, 0px) scale(1)')
	})

	it('+ на объекте тоже масштабирует, а стрелка на объекте — нет', async () => {
		const { container } = await renderMap()
		await fireEvent.keyDown(objectElement(container, 'a'), { key: '+' })
		expect(stageTransform(container)).toBe(ZOOMED)
		await fireEvent.keyDown(objectElement(container, 'a'), { key: 'ArrowRight' })
		expect(stageTransform(container)).toBe(ZOOMED)
	})

	it('initArea задаёт начальный вид и цель «Сбросить»', async () => {
		const user = userEvent.setup()
		const { container } = await renderMap({ initArea: { x: 0.5, y: 0.5, width: 0.25, height: 0.25 } })
		await waitFor(() => expect(stageTransform(container)).toBe('translate(-1600px, -1000px) scale(4)'))
		expect(container.querySelector('.base-image-map__stage')).not.toHaveClass('base-image-map__stage--animated')
		await user.click(screen.getByRole('button', { name: 'Уменьшить' }))
		await user.click(screen.getByRole('button', { name: 'Сбросить масштаб' }))
		expect(stageTransform(container)).toBe('translate(-1600px, -1000px) scale(4)')
	})

	it('без ResizeObserver размер окна берётся один раз при монтировании', async () => {
		const original = globalThis.ResizeObserver
		Reflect.set(globalThis, 'ResizeObserver', undefined)
		try {
			const { stage } = await renderMap()
			expect(stage.style.width).toBe('800px')
		} finally {
			globalThis.ResizeObserver = original
		}
	})

	it('смена слоя сбрасывает вид без анимации', async () => {
		const user = userEvent.setup()
		const { container } = await renderMap({ data: IMAGE_MAP_FLOORS })
		await user.click(screen.getByRole('button', { name: 'Увеличить' }))
		await user.click(screen.getByRole('radio', { name: '2' }))
		expect(stageTransform(container)).toBe('translate(0px, 10px) scale(1)')
		expect(container.querySelector('.base-image-map__stage')).not.toHaveClass('base-image-map__stage--animated')
	})
})

describe('BaseImageMap zoom — колесо', () => {
	it('wheelZoom=ctrl: без Ctrl — подсказка на 1,5 с и прокрутка страницы, с Ctrl — масштаб вокруг указателя', async () => {
		vi.useFakeTimers()
		const { container, viewport } = await renderMap()
		const plain = new WheelEvent('wheel', { deltaY: -100, cancelable: true })
		viewport.dispatchEvent(plain)
		await nextTick()
		expect(plain.defaultPrevented).toBe(false)
		expect(screen.getByText('Чтобы изменить масштаб, прокручивайте с нажатой клавишей Ctrl')).toHaveAttribute('aria-hidden', 'true')
		viewport.dispatchEvent(new WheelEvent('wheel', { deltaY: -100 }))
		await vi.advanceTimersByTimeAsync(1500)
		expect(container.querySelector('.base-image-map__hint')).toBeNull()
		const zoomed = new WheelEvent('wheel', { deltaY: -500, ctrlKey: true, cancelable: true })
		viewport.dispatchEvent(zoomed)
		await nextTick()
		expect(zoomed.defaultPrevented).toBe(true)
		expect(stageTransform(container)).toMatch(/scale\(2\.71/)
		expect(container.querySelector('.base-image-map__stage')).not.toHaveClass('base-image-map__stage--animated')
		viewport.dispatchEvent(new WheelEvent('wheel', { deltaY: 500, metaKey: true }))
		await nextTick()
		expect(stageTransform(container)).toBe('translate(0px, 0px) scale(1)')
		vi.useRealTimers()
	})

	it('wheelZoom=always масштабирует без Ctrl, none — никогда', async () => {
		const first = await renderMap({ wheelZoom: 'always' })
		first.viewport.dispatchEvent(new WheelEvent('wheel', { deltaY: -500 }))
		await nextTick()
		expect(stageTransform(first.container)).toMatch(/scale\(2\.71/)
		first.unmount()
		const second = await renderMap({ wheelZoom: 'none' })
		second.viewport.dispatchEvent(new WheelEvent('wheel', { deltaY: -500, ctrlKey: true }))
		await nextTick()
		expect(stageTransform(second.container)).toBe('translate(0px, 0px) scale(1)')
		expect(second.container.querySelector('.base-image-map__hint')).toBeNull()
	})

	it('на macOS подсказка про ⌘', async () => {
		vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')
		const { viewport } = await renderMap()
		viewport.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }))
		expect(await screen.findByText('Чтобы изменить масштаб, прокручивайте с нажатой клавишей ⌘')).toBeInTheDocument()
	})

	it('масштаб колесом скрывает подсказку объекта', async () => {
		const { container, viewport } = await renderMap({ wheelZoom: 'always' })
		await fireEvent.pointerOver(objectElement(container, 'a'), { pointerType: 'mouse' })
		expect(document.querySelector('.base-image-map__tooltip')).not.toBeNull()
		viewport.dispatchEvent(new WheelEvent('wheel', { deltaY: -100 }))
		await nextTick()
		expect(document.querySelector('.base-image-map__tooltip')).toBeNull()
	})
})

describe('BaseImageMap zoom — перетаскивание и щипок', () => {
	it('перетаскивание сдвигает увеличенную карту после порога 4 px; клик после него не выбирает объект', async () => {
		const user = userEvent.setup()
		const { container, viewport, emitted } = await renderMap({ defaultAction: 'none' })
		await user.click(screen.getByRole('button', { name: 'Увеличить' }))
		await pointer(viewport, 'pointerDown', { clientX: 100, clientY: 100 })
		await pointer(viewport, 'pointerMove', { clientX: 102, clientY: 100 })
		expect(stageTransform(container)).toBe(ZOOMED)
		expect(viewport).not.toHaveClass('base-image-map__viewport--dragging')
		await pointer(viewport, 'pointerMove', { clientX: 150, clientY: 130 })
		expect(stageTransform(container)).toBe('translate(-150px, -95px) scale(1.5)')
		expect(viewport).toHaveClass('base-image-map__viewport--dragging')
		expect(container.querySelector('.base-image-map__stage')).not.toHaveClass('base-image-map__stage--animated')
		await pointer(viewport, 'pointerUp', {})
		expect(viewport).not.toHaveClass('base-image-map__viewport--dragging')
		await fireEvent.click(objectElement(container, 'a'))
		expect(emitted().select).toBeUndefined()
		await fireEvent.click(objectElement(container, 'a'))
		expect(emitted().select).toHaveLength(1)
	})

	it('правая кнопка мыши и движение без нажатия карту не двигают', async () => {
		const user = userEvent.setup()
		const { container, viewport } = await renderMap()
		await user.click(screen.getByRole('button', { name: 'Увеличить' }))
		await pointer(viewport, 'pointerMove', { clientX: 300, clientY: 300 })
		await pointer(viewport, 'pointerDown', { clientX: 100, clientY: 100, button: 2 })
		await pointer(viewport, 'pointerMove', { clientX: 300, clientY: 300 })
		expect(stageTransform(container)).toBe(ZOOMED)
	})

	it('щипок двумя пальцами масштабирует вокруг центра щипка; отмена указателя завершает жест', async () => {
		const { container, viewport } = await renderMap()
		await pointer(viewport, 'pointerDown', { pointerType: 'touch', pointerId: 1, clientX: 100, clientY: 100 })
		await pointer(viewport, 'pointerDown', { pointerType: 'touch', pointerId: 2, clientX: 200, clientY: 100 })
		await pointer(viewport, 'pointerMove', { pointerType: 'touch', pointerId: 2, clientX: 300, clientY: 100 })
		expect(stageTransform(container)).toBe('translate(-100px, -100px) scale(2)')
		await pointer(viewport, 'pointerUp', { pointerType: 'touch', pointerId: 2 })
		expect(viewport).toHaveClass('base-image-map__viewport--dragging')
		await pointer(viewport, 'pointerMove', { pointerType: 'touch', pointerId: 1, clientX: 120, clientY: 100 })
		expect(stageTransform(container)).toBe('translate(-80px, -100px) scale(2)')
		await pointer(viewport, 'pointerCancel', { pointerType: 'touch', pointerId: 1 })
		expect(viewport).not.toHaveClass('base-image-map__viewport--dragging')
	})

	it('перетаскивание скрывает подсказку объекта', async () => {
		const { container, viewport } = await renderMap()
		await fireEvent.pointerOver(objectElement(container, 'a'), { pointerType: 'mouse' })
		await pointer(viewport, 'pointerDown', { clientX: 100, clientY: 100 })
		await pointer(viewport, 'pointerMove', { clientX: 200, clientY: 100 })
		expect(document.querySelector('.base-image-map__tooltip')).toBeNull()
	})
})

describe('BaseImageMap — expose', () => {
	it('zoomIn, zoomOut, resetZoom и setLayer', async () => {
		const { container, expose, onLayerChange } = await renderExposed({ data: IMAGE_MAP_FLOORS })
		expose().zoomIn()
		await nextTick()
		expect(stageTransform(container)).toContain('scale(1.5)')
		expose().zoomOut()
		await nextTick()
		expect(stageTransform(container)).toContain('scale(1)')
		expose().zoomIn()
		expose().resetZoom()
		await nextTick()
		expect(stageTransform(container)).toContain('scale(1)')
		expose().setLayer('floor-3')
		expose().setLayer('floor-3')
		expose().setLayer('cellar')
		expect(onLayerChange.mock.calls).toEqual([['floor-3']])
	})

	it('zoomToObject: точка — масштаб 2, фигура — по размеру, свой zoom объекта; неизвестный id — ничего', async () => {
		const { container, expose } = await renderExposed({ data: IMAGE_MAP_HOTSPOTS })
		await expose().zoomToObject('lake')
		await waitFor(() => expect(stageTransform(container)).toContain('scale(1.38'))
		await expose().zoomToObject('sun')
		await waitFor(() => expect(stageTransform(container)).toContain('scale(2)'))
		await expose().zoomToObject('nope')
		expect(stageTransform(container)).toContain('scale(2)')
		expose().resetZoom()
		const zoomed = { ...IMAGE_MAP_HOTSPOTS, objects: [{ ...IMAGE_MAP_HOTSPOTS.objects[0], zoom: 3 }] }
		const second = await renderExposed({ data: zoomed })
		await second.expose().zoomToObject('peak')
		await waitFor(() => expect(stageTransform(second.container)).toContain('scale(3)'))
	})

	it('zoomToObject для объекта SVG переключает слой и меряет элемент относительно сцены', async () => {
		const { container, expose, onLayerChange } = await renderExposed({ data: IMAGE_MAP_FLOORS })
		mockRects({ 'f2-shop-1': { left: 0, top: 0, width: 80, height: 50 } })
		await expose().zoomToObject('f2-shop-1')
		expect(onLayerChange.mock.calls).toEqual([['floor-2']])
		await waitFor(() => expect(stageTransform(container)).toContain('scale(3.33'))
	})

	it('zoomToObject для SVG без элемента или при нулевой сцене масштаб не меняет', async () => {
		const missing = {
			...IMAGE_MAP_FLOORS,
			objects: [{ id: 'ghost', type: 'svg' as const, title: 'Нет', elementId: 'nope' }, ...IMAGE_MAP_FLOORS.objects],
		}
		const { container, expose } = await renderExposed({ data: missing })
		await expose().zoomToObject('ghost')
		expect(stageTransform(container)).toContain('scale(1)')
		mockRects({}, { left: 0, top: 0, width: 0, height: 0 })
		await expose().zoomToObject('f1-shop-1')
		expect(stageTransform(container)).toContain('scale(1)')
	})
})

describe('BaseImageMap — полный экран', () => {
	function mockFullscreen(request: () => Promise<void>) {
		let element: Element | null = null
		const setElement = (next: Element | null): void => {
			element = next
			document.dispatchEvent(new Event('fullscreenchange'))
		}
		vi.spyOn(document, 'fullscreenEnabled', 'get').mockReturnValue(true)
		vi.spyOn(document, 'fullscreenElement', 'get').mockImplementation(() => element)
		HTMLElement.prototype.requestFullscreen = vi.fn(async function (this: HTMLElement) {
			await request()
			setElement(this)
		})
		document.exitFullscreen = vi.fn(async () => setElement(null))
	}

	afterEach(() => {
		Reflect.deleteProperty(HTMLElement.prototype, 'requestFullscreen')
		Reflect.deleteProperty(document, 'exitFullscreen')
	})

	it('кнопка переключает режим: aria-pressed, подпись и класс корня', async () => {
		if (!('fullscreenEnabled' in document))
			Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, get: () => false })
		if (!('fullscreenElement' in document))
			Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => null })
		mockFullscreen(async () => undefined)
		const user = userEvent.setup()
		const { container } = await renderMap({ hasFullscreen: true })
		const button = screen.getByRole('button', { name: 'Во весь экран' })
		expect(button).toHaveAttribute('aria-pressed', 'false')
		await user.click(button)
		await waitFor(() => expect(container.querySelector('.base-image-map')).toHaveClass('base-image-map--fullscreen'))
		const exit = screen.getByRole('button', { name: 'Выйти из полноэкранного режима' })
		expect(exit).toHaveAttribute('aria-pressed', 'true')
		await user.click(exit)
		await waitFor(() => expect(container.querySelector('.base-image-map')).not.toHaveClass('base-image-map--fullscreen'))
	})

	it('отказ браузера оставляет обычный режим; без кнопок масштаба панель с одной кнопкой', async () => {
		if (!('fullscreenEnabled' in document))
			Object.defineProperty(document, 'fullscreenEnabled', { configurable: true, get: () => false })
		if (!('fullscreenElement' in document))
			Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => null })
		mockFullscreen(() => Promise.reject(new Error('denied')))
		const user = userEvent.setup()
		const { container } = await renderMap({ hasFullscreen: true, hasZoomControls: false })
		expect(screen.queryByRole('button', { name: 'Увеличить' })).toBeNull()
		await user.click(screen.getByRole('button', { name: 'Во весь экран' }))
		expect(container.querySelector('.base-image-map')).not.toHaveClass('base-image-map--fullscreen')
	})

	it('без поддержки полноэкранного режима кнопки нет', async () => {
		await renderMap({ hasFullscreen: true })
		expect(screen.queryByRole('button', { name: 'Во весь экран' })).toBeNull()
	})
})
