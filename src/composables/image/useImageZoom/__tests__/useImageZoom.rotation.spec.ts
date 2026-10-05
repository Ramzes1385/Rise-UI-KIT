import { nextTick } from 'vue'
import { useImageZoom } from '../useImageZoom'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { isQuarterTurn, nearestFullTurn, rotatedFit, rotatedSize } from '../zoomGeometry'

enableAutoUnmount(afterEach)
afterEach(() => vi.restoreAllMocks())

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

function createContainer(client: { width: number; height: number }, padding = '10px'): HTMLDivElement {
	const container = document.createElement('div')
	container.style.padding = padding
	Object.defineProperty(container, 'clientWidth', { value: client.width, configurable: true })
	Object.defineProperty(container, 'clientHeight', { value: client.height, configurable: true })
	return container
}

function createZoom(overrides: Record<string, unknown> = {}) {
	return withSetup(() =>
		useImageZoom({
			initialScale: () => 1,
			zoomStep: () => 0.25,
			minScale: () => 0.5,
			maxScale: () => 5,
			closeOnOverlay: () => true,
			onZoom: vi.fn(),
			...overrides,
		}),
	)
}

function createMeasuredZoom() {
	const zoomImg = createImg({ width: 1600, height: 900 }, { width: 800, height: 450 })
	createContainer({ width: 820, height: 470 }).append(zoomImg)
	const minimapImg = createImg({ width: 1600, height: 900 }, { width: 200, height: 150 })
	const zoom = createZoom({ getZoomImgEl: () => zoomImg, getMinimapImgEl: () => minimapImg })
	vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(800)
	vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(450)
	zoom.syncSizes()
	return zoom
}

function scaleOf(transform: string): number {
	return Number(/scale\(([^)]+)\)/.exec(transform)![1])
}

describe('zoomGeometry: поворот', () => {
	it('isQuarterTurn — 90° и 270° с любым числом оборотов', () => {
		expect([90, 270, -90, -270, 450, 630].every(isQuarterTurn)).toBe(true)
		expect([0, 180, 360, -180, -360, 720].some(isQuarterTurn)).toBe(false)
	})

	it('nearestFullTurn — к ближайшему обороту, без −0', () => {
		expect(nearestFullTurn(270)).toBe(360)
		expect(nearestFullTurn(90)).toBe(0)
		expect(nearestFullTurn(-90)).toBe(0)
		expect(Object.is(nearestFullTurn(-90), -0)).toBe(false)
		expect(nearestFullTurn(-270)).toBe(-360)
		expect(nearestFullTurn(630)).toBe(720)
	})

	it('rotatedSize — ширина и высота меняются местами только на четверти', () => {
		expect(rotatedSize({ width: 4, height: 3 }, 90)).toEqual({ width: 3, height: 4 })
		expect(rotatedSize({ width: 4, height: 3 }, 180)).toEqual({ width: 4, height: 3 })
	})

	it('rotatedFit — множитель ≤ 1, без замера и без четверти — 1', () => {
		expect(rotatedFit({ width: 800, height: 450 }, { width: 800, height: 450 }, 90)).toBe(0.5625)
		expect(rotatedFit({ width: 800, height: 450 }, { width: 800, height: 450 }, 180)).toBe(1)
		expect(rotatedFit({ width: 100, height: 100 }, { width: 800, height: 450 }, 90)).toBe(1)
		expect(rotatedFit({ width: 0, height: 450 }, { width: 800, height: 450 }, 90)).toBe(1)
		expect(rotatedFit({ width: 800, height: 0 }, { width: 800, height: 450 }, 90)).toBe(1)
		expect(rotatedFit({ width: 800, height: 450 }, { width: 0, height: 450 }, 90)).toBe(1)
		expect(rotatedFit({ width: 800, height: 450 }, { width: 800, height: 0 }, 90)).toBe(1)
	})
})

describe('useImageZoom: поворот', () => {
	it('П1: вправо ×4 — 360°, без отката к 0°', () => {
		const zoom = createZoom()
		for (let i = 0; i < 4; i++) zoom.rotateRight()
		expect(zoom.rotation.value).toBe(360)
		expect(zoom.zoomImageStyle.value.transform).toContain('rotate(360deg)')
		zoom.rotateRight()
		expect(zoom.rotation.value).toBe(450)
	})

	it('П1: влево копится в минус', () => {
		const zoom = createZoom()
		for (let i = 0; i < 4; i++) zoom.rotateLeft()
		expect(zoom.rotation.value).toBe(-360)
		expect(zoom.zoomImageStyle.value.transform).toContain('rotate(-360deg)')
	})

	it('П2: «Сбросить масштаб» после 270° — к 360°, коротким путём', () => {
		const zoom = createZoom()
		for (let i = 0; i < 3; i++) zoom.rotateRight()
		zoom.zoomIn()
		zoom.resetZoom()
		expect(zoom.rotation.value).toBe(360)
		expect(zoom.currentScale.value).toBe(1)
	})

	it('П2: клавиша «0» после 90° — к 0°, после −270° — к −360°', () => {
		const zoom = createZoom()
		zoom.isZoomOpen.value = true
		zoom.rotateRight()
		zoom.handleKeydown(new KeyboardEvent('keydown', { key: '0' }))
		expect(zoom.rotation.value).toBe(0)
		for (let i = 0; i < 3; i++) zoom.rotateLeft()
		zoom.handleKeydown(new KeyboardEvent('keydown', { key: '0' }))
		expect(zoom.rotation.value).toBe(-360)
	})

	it('П3: открытие и закрытие — ровно 0°', async () => {
		const zoom = createZoom()
		zoom.openZoom()
		for (let i = 0; i < 3; i++) zoom.rotateRight()
		zoom.closeZoom()
		expect(zoom.rotation.value).toBe(0)
		for (let i = 0; i < 5; i++) zoom.rotateRight()
		zoom.openZoom()
		await nextTick()
		expect(zoom.rotation.value).toBe(0)
	})

	it('П3: resetView — 0°, масштаб и сдвиг начальные, onZoom только при смене масштаба', () => {
		const onZoom = vi.fn()
		const zoom = createZoom({ onZoom })
		zoom.rotateRight()
		zoom.resetView()
		expect(onZoom).not.toHaveBeenCalled()
		zoom.zoomIn()
		zoom.rotateRight()
		zoom.resetView()
		expect(zoom.rotation.value).toBe(0)
		expect(zoom.currentScale.value).toBe(1)
		expect(onZoom).toHaveBeenLastCalledWith(1)
	})

	it('П4: на 90° и 270° изображение вписано (1600×900 в 800×450 → 0.5625), процент — без множителя', () => {
		const zoom = createMeasuredZoom()
		expect(scaleOf(zoom.zoomImageStyle.value.transform)).toBe(1)
		zoom.rotateRight()
		expect(scaleOf(zoom.zoomImageStyle.value.transform)).toBe(0.5625)
		expect(zoom.scalePercent.value).toBe(100)
		zoom.rotateRight()
		expect(scaleOf(zoom.zoomImageStyle.value.transform)).toBe(1)
		zoom.rotateRight()
		zoom.zoomIn()
		expect(scaleOf(zoom.zoomImageStyle.value.transform)).toBeCloseTo(1.25 * 0.5625)
		expect(zoom.scalePercent.value).toBe(125)
	})

	it('П4: замер места без контейнера и без отступов', () => {
		const zoomImg = createImg({ width: 1600, height: 900 }, { width: 800, height: 450 })
		const zoom = createZoom({ getZoomImgEl: () => zoomImg })
		zoom.syncSizes()
		zoom.rotateRight()
		expect(scaleOf(zoom.zoomImageStyle.value.transform)).toBe(1)

		const bare = createImg({ width: 1600, height: 900 }, { width: 800, height: 450 })
		createContainer({ width: 800, height: 450 }, '').append(bare)
		const zoomBare = createZoom({ getZoomImgEl: () => bare })
		zoomBare.syncSizes()
		zoomBare.rotateRight()
		expect(scaleOf(zoomBare.zoomImageStyle.value.transform)).toBe(0.5625)

		const tiny = createImg({ width: 1600, height: 900 }, { width: 800, height: 450 })
		createContainer({ width: 10, height: 10 }, '20px').append(tiny)
		const zoomTiny = createZoom({ getZoomImgEl: () => tiny })
		zoomTiny.syncSizes()
		zoomTiny.rotateRight()
		expect(scaleOf(zoomTiny.zoomImageStyle.value.transform)).toBe(1)
	})

	it('П5: сдвиг ограничен повёрнутыми размерами', () => {
		const zoom = createMeasuredZoom()
		for (let i = 0; i < 12; i++) zoom.zoomIn()
		zoom.rotateRight()
		const scale = 4 * 0.5625
		zoom.translateX.value = 10_000
		zoom.translateY.value = 10_000
		zoom.syncSizes()
		expect(zoom.translateX.value).toBeCloseTo((450 * scale - 800) / 2)
		expect(zoom.translateY.value).toBeCloseTo((800 * scale - 450) / 2)
	})

	it('П5: поворот возвращает сдвиг в границы', () => {
		const zoom = createMeasuredZoom()
		zoom.zoomIn()
		zoom.zoomIn()
		zoom.translateX.value = 100
		zoom.syncSizes()
		expect(zoom.translateX.value).toBe(100)
		zoom.rotateRight()
		expect(zoom.translateX.value).toBe(0)
	})

	it('П5: миникарта на 90° — изображение вписано в рамку, рамка видимой области в повёрнутых координатах', () => {
		const zoom = createMeasuredZoom()
		expect(zoom.minimapImageStyle.value.transform).toBe('scale(1) rotate(0deg)')
		zoom.rotateRight()
		expect(zoom.minimapImageStyle.value.transform).toBe('scale(0.75) rotate(90deg)')
		zoom.zoomIn()
		zoom.zoomIn()
		const style = zoom.minimapViewportStyle.value
		expect(Number.parseFloat(style.width)).toBeCloseTo(84.375)
		expect(Number.parseFloat(style.height)).toBeCloseTo(100)
	})

	it('П5: клик и перетаскивание по миникарте на 90° — в повёрнутых координатах', () => {
		const zoom = createMeasuredZoom()
		zoom.rotateRight()
		for (let i = 0; i < 12; i++) zoom.zoomIn()
		const target = document.createElement('div')
		target.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 150 }) as DOMRect
		const click = new MouseEvent('click', { clientX: 100, clientY: 0 })
		Object.defineProperty(click, 'currentTarget', { value: target })
		zoom.handleMinimapClick(click)
		expect(zoom.translateX.value).toBe(0)
		expect(zoom.translateY.value).toBeGreaterThan(0)

		zoom.translateY.value = 0
		zoom.handleMinimapDragStart(new MouseEvent('mousedown', { clientX: 0, clientY: 0 }))
		zoom.handleMinimapDragMove(new MouseEvent('mousemove', { clientX: 0, clientY: 10 }))
		const ratio = (800 * 0.5625) / 150
		expect(zoom.translateY.value).toBeCloseTo(-10 * ratio * 4)
		zoom.handleMinimapDragEnd()
	})

	it('П6: перетаскивание рамки миникарты выключает переходы', () => {
		const zoom = createZoom()
		expect(zoom.isZoomAnimated.value).toBe(true)
		zoom.handleMinimapDragStart(new MouseEvent('mousedown'))
		expect(zoom.isZoomAnimated.value).toBe(false)
		zoom.handleMinimapDragEnd()
		expect(zoom.isZoomAnimated.value).toBe(true)
	})

	it('П6: «уменьшить движение» выключает переходы', async () => {
		const original = window.matchMedia
		window.matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })
		const zoom = createZoom()
		await nextTick()
		expect(zoom.isZoomAnimated.value).toBe(false)
		window.matchMedia = original
	})
})
