import { useImageZoom } from '../useImageZoom'
import { enableAutoUnmount, mount } from '@vue/test-utils'

enableAutoUnmount(afterEach)

function withSetup<T>(composable: () => T): T {
	let result: T
	mount({
		setup() {
			result = composable()
			return () => null
		},
	})
	return result!
}

function createImg(natural: { width: number; height: number }, offset: { width: number; height: number }): HTMLImageElement {
	const img = document.createElement('img')
	Object.defineProperty(img, 'naturalWidth', { value: natural.width, configurable: true })
	Object.defineProperty(img, 'naturalHeight', { value: natural.height, configurable: true })
	Object.defineProperty(img, 'offsetWidth', { value: offset.width, configurable: true })
	Object.defineProperty(img, 'offsetHeight', { value: offset.height, configurable: true })
	return img
}

function setup(overrides: Record<string, unknown> = {}) {
	const img = createImg({ width: 7680, height: 4320 }, { width: 3840, height: 2160 })
	const zoom = withSetup(() =>
		useImageZoom({
			initialScale: () => 1,
			zoomStep: () => 0.25,
			minScale: () => 0.5,
			maxScale: () => 5,
			closeOnOverlay: () => true,
			getZoomImgEl: () => img,
			onArrowLeft: vi.fn<() => void>(),
			onArrowRight: vi.fn<() => void>(),
			...overrides,
		}),
	)
	zoom.openZoom()
	zoom.syncSizes()
	return { zoom, img }
}

function key(name: string): KeyboardEvent {
	return new KeyboardEvent('keydown', { key: name, cancelable: true })
}

function fire(area: HTMLElement, type: string, init: PointerEventInit): void {
	area.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerType: 'touch', button: 0, ...init }))
}

function attach(zoom: ReturnType<typeof setup>['zoom']): HTMLElement {
	const area = document.createElement('div')
	area.addEventListener('pointerdown', zoom.handlePointerDown)
	area.addEventListener('pointermove', zoom.handlePointerMove)
	area.addEventListener('pointerup', zoom.handlePointerEnd)
	return area
}

describe('useImageZoom: сдвиг (IMG-6)', () => {
	describe('panBy и zoomAround', () => {
		it('при масштабе 1 сдвигать некуда', () => {
			const { zoom } = setup()

			expect(zoom.panBy(30, 0)).toBe(false)
			expect(zoom.translateX.value).toBe(0)
		})

		it('при увеличении сдвигает и не выпускает изображение за край', () => {
			const { zoom } = setup()
			zoom.zoomAround(2, { x: 0, y: 0 })

			expect(zoom.panBy(30, -20)).toBe(true)
			expect(zoom.translateX.value).toBe(30)
			expect(zoom.translateY.value).toBe(-20)

			expect(zoom.panBy(100000, 0)).toBe(true)
			expect(zoom.translateX.value).toBe((3840 * 2 - window.innerWidth) / 2)
			expect(zoom.panBy(100000, 0)).toBe(false)
		})

		it('zoomAround держит точку на месте, ограничивает масштаб и не вызывает onZoom без перемены', () => {
			const onZoom = vi.fn<(scale: number) => void>()
			const { zoom } = setup({ onZoom })

			zoom.zoomAround(2, { x: 100, y: 50 })
			expect(zoom.scalePercent.value).toBe(200)
			expect(zoom.translateX.value).toBe(-100)
			expect(zoom.translateY.value).toBe(-50)
			expect(onZoom).toHaveBeenCalledWith(2)

			zoom.zoomAround(50, { x: 0, y: 0 })
			expect(zoom.scalePercent.value).toBe(500)

			onZoom.mockClear()
			zoom.zoomAround(50, { x: 0, y: 0 })
			expect(onZoom).not.toHaveBeenCalled()
		})
	})

	describe('стрелки', () => {
		it('при увеличении стрелки двигают изображение и не листают галерею', () => {
			const onArrowLeft = vi.fn<() => void>()
			const { zoom } = setup({ onArrowLeft })
			zoom.zoomAround(2, { x: 0, y: 0 })

			const left = key('ArrowLeft')
			zoom.handleKeydown(left)
			zoom.handleKeydown(key('ArrowUp'))

			expect(left.defaultPrevented).toBe(true)
			expect(zoom.translateX.value).toBe(80)
			expect(zoom.translateY.value).toBe(80)
			zoom.handleKeydown(key('ArrowRight'))
			zoom.handleKeydown(key('ArrowDown'))
			expect(zoom.translateX.value).toBe(0)
			expect(zoom.translateY.value).toBe(0)
			expect(onArrowLeft).not.toHaveBeenCalled()
		})

		it('у края изображения стрелка уходит в галерею', () => {
			const onArrowRight = vi.fn<() => void>()
			const { zoom } = setup({ onArrowRight })
			zoom.zoomAround(2, { x: 0, y: 0 })
			zoom.panBy(-100000, 0)

			const right = key('ArrowRight')
			zoom.handleKeydown(right)

			expect(onArrowRight).toHaveBeenCalledOnce()
			expect(right.defaultPrevented).toBe(false)
		})

		it('без увеличения стрелки листают галерею, а вверх и вниз ничего не делают', () => {
			const onArrowLeft = vi.fn<() => void>()
			const { zoom } = setup({ onArrowLeft })

			zoom.handleKeydown(key('ArrowLeft'))
			zoom.handleKeydown(key('ArrowUp'))

			expect(onArrowLeft).toHaveBeenCalledOnce()
			expect(zoom.translateY.value).toBe(0)
		})
	})

	describe('жесты', () => {
		it('палец двигает увеличенное изображение, переходы на время жеста выключены, клик после сдвига не закрывает окно', () => {
			const { zoom } = setup()
			zoom.zoomAround(2, { x: 0, y: 0 })
			const area = attach(zoom)

			fire(area, 'pointerdown', { pointerId: 1, clientX: 0, clientY: 0 })
			expect(zoom.isPanning.value).toBe(true)
			expect(zoom.isZoomAnimated.value).toBe(false)
			fire(area, 'pointermove', { pointerId: 1, clientX: 40, clientY: 30 })
			fire(area, 'pointerup', { pointerId: 1, clientX: 40, clientY: 30 })

			expect(zoom.translateX.value).toBe(40)
			expect(zoom.translateY.value).toBe(30)
			zoom.handleOverlayClick()
			expect(zoom.isZoomOpen.value).toBe(true)
			zoom.handleOverlayClick()
			expect(zoom.isZoomOpen.value).toBe(false)
		})

		it('щипок увеличивает масштаб с масштаба 1', () => {
			const { zoom } = setup()
			const area = attach(zoom)

			fire(area, 'pointerdown', { pointerId: 1, clientX: 100, clientY: 100 })
			fire(area, 'pointerdown', { pointerId: 2, clientX: 140, clientY: 100 })
			fire(area, 'pointermove', { pointerId: 2, clientX: 180, clientY: 100 })

			expect(zoom.scalePercent.value).toBe(200)
		})

		it('щипок без элемента изображения не падает: масштаб вокруг середины пальцев', () => {
			const { zoom } = setup({ getZoomImgEl: undefined })
			const area = attach(zoom)

			fire(area, 'pointerdown', { pointerId: 1, clientX: 100, clientY: 100 })
			fire(area, 'pointerdown', { pointerId: 2, clientX: 140, clientY: 100 })
			fire(area, 'pointermove', { pointerId: 2, clientX: 180, clientY: 100 })

			expect(zoom.scalePercent.value).toBe(200)
		})

		it('закрытие окна сбрасывает жест', () => {
			const { zoom } = setup()
			zoom.zoomAround(2, { x: 0, y: 0 })
			const area = attach(zoom)
			fire(area, 'pointerdown', { pointerId: 1, clientX: 0, clientY: 0 })

			zoom.closeZoom()

			expect(zoom.isPanning.value).toBe(false)
		})
	})
})
