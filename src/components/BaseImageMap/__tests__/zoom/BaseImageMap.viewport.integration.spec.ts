import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import userEvent from '@testing-library/user-event'
import BaseImageMap from '../../ui/BaseImageMap.vue'
import type { TestRect } from '../imageMap.test-utils'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { ImageMapData } from '../../types/imageMapData.types'
import { mockRects, mockViewport, objectElement, pointer, SIMPLE_DATA, stageTransform } from '../imageMap.test-utils'

const BASE_PROPS = { hasFullscreen: false }
const FULL = { width: 800, height: 500 }
const PANNED = 'translate(-150px, -95px) scale(1.5)'

function stubResizeObserver() {
	const original = globalThis.ResizeObserver
	const callbacks = new Set<() => void>()
	class FakeResizeObserver {
		private readonly callback: () => void
		constructor(callback: () => void) {
			this.callback = callback
			callbacks.add(callback)
		}
		observe = vi.fn()
		unobserve = vi.fn()
		disconnect = (): void => {
			callbacks.delete(this.callback)
		}
	}
	Reflect.set(globalThis, 'ResizeObserver', FakeResizeObserver)
	return {
		notify: (): void => callbacks.forEach(callback => callback()),
		restore: (): void => {
			Reflect.set(globalThis, 'ResizeObserver', original)
		},
	}
}

async function renderMap(props: Record<string, unknown> = {}, size = { ...FULL }, viewportRect?: TestRect) {
	mockViewport(size)
	mockRects({}, undefined, viewportRect)
	const result = render(BaseImageMap, { props: { data: SIMPLE_DATA, ...BASE_PROPS, ...props } })
	await nextTick()
	return {
		...result,
		size,
		viewport: result.container.querySelector('.base-image-map__viewport') as HTMLElement,
		stage: result.container.querySelector('.base-image-map__stage') as HTMLElement,
	}
}

describe('BaseImageMap — размер окна', () => {
	let observer: ReturnType<typeof stubResizeObserver>

	beforeEach(() => {
		observer = stubResizeObserver()
	})

	afterEach(() => {
		observer.restore()
	})

	async function resize(size: { width: number; height: number }, width: number, height: number): Promise<void> {
		size.width = width
		size.height = height
		observer.notify()
		await nextTick()
	}

	async function panZoomed(viewport: HTMLElement): Promise<void> {
		await userEvent.setup().click(screen.getByRole('button', { name: 'Увеличить' }))
		await pointer(viewport, 'pointerDown', { clientX: 100, clientY: 100 })
		await pointer(viewport, 'pointerMove', { clientX: 150, clientY: 130 })
		await pointer(viewport, 'pointerUp', {})
	}

	it('изменение размера окна сохраняет масштаб и точку карты в центре, а не сбрасывает вид', async () => {
		const { container, stage, viewport, size } = await renderMap()
		await panZoomed(viewport)
		expect(stageTransform(container)).toBe(PANNED)
		await resize(size, 400, 250)
		expect(stage.style.width).toBe('400px')
		expect(stage.style.height).toBe('250px')
		expect(stageTransform(container)).toBe('translate(-75px, -47.5px) scale(1.5)')
		await resize(size, 800, 500)
		expect(stageTransform(container)).toBe(PANNED)
	})

	it('при другой пропорции окна вид остаётся в границах: узкая сцена центрируется по горизонтали', async () => {
		const { container, viewport, size } = await renderMap()
		await panZoomed(viewport)
		await resize(size, 800, 250)
		expect(container.querySelector<HTMLElement>('.base-image-map__stage')?.style.width).toBe('400px')
		expect(stageTransform(container)).toBe('translate(100px, -47.5px) scale(1.5)')
	})

	it('замена данных с тем же слоем не сбрасывает вид', async () => {
		const { container, rerender } = await renderMap()
		await userEvent.setup().click(screen.getByRole('button', { name: 'Увеличить' }))
		const next: ImageMapData = {
			...SIMPLE_DATA,
			objects: [...SIMPLE_DATA.objects, { id: 'c', type: 'point', title: 'Точка В', x: 0.5, y: 0.5 }],
		}
		await rerender({ data: next, ...BASE_PROPS })
		expect(objectElement(container, 'c')).not.toBeNull()
		expect(stageTransform(container)).toBe('translate(-200px, -125px) scale(1.5)')
	})

	it('замена данных с тем же слоем и размером во время плавного перехода не обрывает его', async () => {
		const { container, rerender } = await renderMap()
		await userEvent.setup().click(screen.getByRole('button', { name: 'Увеличить' }))
		const stage = container.querySelector('.base-image-map__stage') as HTMLElement
		expect(stage).toHaveClass('base-image-map__stage--animated')
		await rerender({ data: { ...SIMPLE_DATA, layers: SIMPLE_DATA.layers.map(layer => ({ ...layer })) }, ...BASE_PROPS })
		await nextTick()
		expect(stage).toHaveClass('base-image-map__stage--animated')
		expect(stageTransform(container)).toBe('translate(-200px, -125px) scale(1.5)')
	})

	it('смена слоя: план другой пропорции сбрасывает вид, план того же размера — сохраняет', async () => {
		const data: ImageMapData = {
			layers: [
				{ id: 'one', title: 'Один', image: 'a.png', width: 800, height: 500 },
				{ id: 'same', title: 'Тот же размер', image: 'b.png', width: 1600, height: 1000 },
				{ id: 'other', title: 'Другой', image: 'c.png', width: 800, height: 800 },
			],
			objects: [],
		}
		const { container, rerender } = await renderMap({ data, hasZoomControls: true })
		await userEvent.setup().click(screen.getByRole('button', { name: 'Увеличить' }))
		const zoomed = stageTransform(container)
		expect(zoomed).toBe('translate(-200px, -125px) scale(1.5)')
		await rerender({ data, ...BASE_PROPS, layer: 'same' })
		expect(stageTransform(container)).toBe(zoomed)
		await rerender({ data, ...BASE_PROPS, layer: 'other' })
		expect(stageTransform(container)).toBe('translate(150px, 0px) scale(1)')
	})

	it('окно, которое было скрыто с нулевым размером, при появлении получает начальный вид', async () => {
		const area = { x: 0.5, y: 0.5, width: 0.25, height: 0.25 }
		const { container, stage, size } = await renderMap({ initArea: area }, { width: 0, height: 0 })
		expect(stage.style.width).toBe('0px')
		await resize(size, 800, 500)
		expect(stage.style.width).toBe('800px')
		expect(stageTransform(container)).toBe('translate(-1600px, -1000px) scale(4)')
	})

	it('сжатие окна до нуля и возврат возвращают начальный вид, а не ломают размеры', async () => {
		const { container, stage, viewport, size } = await renderMap()
		await panZoomed(viewport)
		await resize(size, 0, 0)
		expect(stage.style.width).toBe('0px')
		await resize(size, 800, 500)
		expect(stage.style.width).toBe('800px')
		expect(stageTransform(container)).toBe('translate(0px, 0px) scale(1)')
	})
})

describe('BaseImageMap — щипок и колесо', () => {
	it('щипок упирается в maxZoom без дрейфа: точка под центром щипка остаётся на месте', async () => {
		const { container, viewport } = await renderMap()
		await pointer(viewport, 'pointerDown', { pointerType: 'touch', pointerId: 1, clientX: 100, clientY: 100 })
		await pointer(viewport, 'pointerDown', { pointerType: 'touch', pointerId: 2, clientX: 200, clientY: 100 })
		await pointer(viewport, 'pointerMove', { pointerType: 'touch', pointerId: 2, clientX: 500, clientY: 100 })
		expect(stageTransform(container)).toBe('translate(-300px, -300px) scale(4)')
		await pointer(viewport, 'pointerMove', { pointerType: 'touch', pointerId: 2, clientX: 700, clientY: 100 })
		expect(stageTransform(container)).toBe('translate(-200px, -300px) scale(4)')
	})

	it('щипок внутрь на минимальном масштабе не сдвигает и не уменьшает карту', async () => {
		const { container, viewport } = await renderMap()
		await pointer(viewport, 'pointerDown', { pointerType: 'touch', pointerId: 1, clientX: 100, clientY: 100 })
		await pointer(viewport, 'pointerDown', { pointerType: 'touch', pointerId: 2, clientX: 200, clientY: 100 })
		await pointer(viewport, 'pointerMove', { pointerType: 'touch', pointerId: 2, clientX: 150, clientY: 100 })
		expect(stageTransform(container)).toBe('translate(0px, 0px) scale(1)')
	})

	it.each([
		['строках', { deltaY: -3, deltaMode: 1 }, /scale\(1\.1007/],
		['страницах', { deltaY: -0.5, deltaMode: 2 }, /scale\(1\.4918/],
		['пикселях', { deltaY: -100, deltaMode: 0 }, /scale\(1\.2214/],
	])('колесо в %s переводит шаг в пиксели (строка — 16, страница — 400) и масштабирует по нему', async (_name, init, expected) => {
		const { container, viewport } = await renderMap({ wheelZoom: 'always', maxZoom: 8 })
		viewport.dispatchEvent(new WheelEvent('wheel', init))
		await nextTick()
		expect(stageTransform(container)).toMatch(expected)
	})

	it('один тик колеса меняет масштаб не больше чем в 4 раза', async () => {
		const { container, viewport } = await renderMap({ wheelZoom: 'always', maxZoom: 8 })
		viewport.dispatchEvent(new WheelEvent('wheel', { deltaY: -5000 }))
		await nextTick()
		expect(stageTransform(container)).toContain('scale(4)')
		viewport.dispatchEvent(new WheelEvent('wheel', { deltaY: 5000 }))
		await nextTick()
		expect(stageTransform(container)).toContain('scale(1)')
	})
})

describe('BaseImageMap — окно с CSS-масштабом предка', () => {
	const SCALED: TestRect = { left: 100, top: 50, width: 400, height: 250 }

	it('колесо масштабирует вокруг точки под указателем, а не вокруг сдвинутой', async () => {
		const { container, viewport } = await renderMap({ wheelZoom: 'always' }, { ...FULL }, SCALED)
		viewport.dispatchEvent(new WheelEvent('wheel', { deltaY: -500, clientX: 300, clientY: 50 }))
		await nextTick()
		expect(stageTransform(container)).toMatch(/^translate\(-687\.31\d*px, 0px\) scale\(2\.718\d*\)$/)
	})

	it('«+» на объекте масштабирует вокруг центра объекта в пикселях окна', async () => {
		const { container } = await renderMap({}, { ...FULL }, SCALED)
		mockRects({ a: { left: 295, top: 170, width: 10, height: 10 } }, undefined, SCALED)
		await fireEvent.keyDown(objectElement(container, 'a'), { key: '+' })
		expect(stageTransform(container)).toBe('translate(-200px, -125px) scale(1.5)')
	})

	it('фокус на объекте за краем окна сдвигает карту на расстояние в пикселях окна', async () => {
		const { container } = await renderMap({}, { ...FULL }, SCALED)
		await userEvent.setup().click(screen.getByRole('button', { name: 'Увеличить' }))
		mockRects({ a: { left: 80, top: 100, width: 10, height: 10 } }, undefined, SCALED)
		objectElement(container, 'a').focus()
		await nextTick()
		expect(stageTransform(container)).toBe('translate(-128px, -125px) scale(1.5)')
	})
})
