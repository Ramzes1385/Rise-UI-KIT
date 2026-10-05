import '@testing-library/jest-dom/vitest'
import type { Camera, Scene } from 'three'
import BaseImageMap3D from '../ui/BaseImageMap3D.vue'
import { defineComponent, h, nextTick, ref } from 'vue'
import type { ImageMap3DData } from '../types/imageMap3dData.types'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { createFakeRenderer, mockWebGL } from './imageMap3d.test-utils'
import type { BaseImageMap3DExpose } from '../types/BaseImageMap3D.types'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { MathUtils, OrthographicCamera, PerspectiveCamera, Spherical, Vector3 } from 'three'

const DATA: ImageMap3DData = {
	layers: [
		{ id: 'f1', title: 'Этаж 1', width: 800, height: 400 },
		{ id: 'f2', title: 'Этаж 2', width: 800, height: 400, elevation: 300 },
	],
	objects: [{ id: 'shop', type: 'rect', title: 'Магазин', x: 0.5, y: 0.5, width: 0.25, height: 0.25, layer: 'f1', height3d: 20 }],
}

class TestResizeObserver {
	observe = vi.fn()
	unobserve = vi.fn()
	disconnect = vi.fn()
}

let frames: FrameRequestCallback[] = []
let now = 0

function flushFrames(advance = 0): void {
	now += advance
	const queue = frames
	frames = []
	queue.forEach(callback => callback(now))
}

beforeEach(() => {
	frames = []
	now = 0
	vi.stubGlobal('ResizeObserver', TestResizeObserver)
	vi.stubGlobal(
		'requestAnimationFrame',
		vi.fn((callback: FrameRequestCallback) => frames.push(callback)),
	)
	vi.stubGlobal('cancelAnimationFrame', vi.fn())
	vi.spyOn(performance, 'now').mockImplementation(() => now)
	mockWebGL(true)
})

afterEach(() => {
	vi.restoreAllMocks()
	vi.unstubAllGlobals()
	document.documentElement.removeAttribute('data-rise-motion')
})

async function renderCamera(props: Record<string, unknown> = {}, container?: HTMLElement) {
	const renderer = createFakeRenderer()
	const exposed = ref<BaseImageMap3DExpose | null>(null)
	const connect = vi.spyOn(OrbitControls.prototype, 'connect')
	const Host = defineComponent({
		setup:
			(_, { attrs }) =>
			() =>
				h(BaseImageMap3D, { data: DATA, rendererFactory: () => renderer, ...attrs, ref: exposed }),
	})
	const result = render(Host, { attrs: props, ...(container ? { container } : {}) })
	await waitFor(() => expect(connect).toHaveBeenCalled())
	const controls = (): OrbitControls => connect.mock.contexts.at(-1) as OrbitControls
	const camera = (): Camera => {
		flushFrames()
		return renderer.render.mock.calls.at(-1)?.[1] as Camera
	}
	return { ...result, renderer, exposed, controls, camera, scene: () => renderer.render.mock.calls.at(-1)?.[0] as Scene }
}

function azimuth(camera: Camera, target: Vector3): number {
	return new Spherical().setFromVector3(camera.position.clone().sub(target)).theta
}

describe('BaseImageMap3D: камера', () => {
	beforeEach(() => {
		document.documentElement.setAttribute('data-rise-motion', 'none')
	})

	it('по умолчанию — изометрия: ортографическая камера, поворот 45°, масштаб 1, OrbitControls на холсте', async () => {
		const { camera, controls, container } = await renderCamera()
		const view = camera() as OrthographicCamera
		expect(view).toBeInstanceOf(OrthographicCamera)
		expect(view.zoom).toBe(1)
		expect(controls().target).toEqual(new Vector3(400, 0, 200))
		expect(MathUtils.radToDeg(azimuth(view, controls().target))).toBeCloseTo(45)
		expect(controls().domElement).toBe(container.querySelector('canvas'))
		expect(controls().enableRotate).toBe(true)
		const region = screen.getByRole('group', { name: 'Этаж 1' })
		expect(region).toHaveAccessibleDescription(expect.stringContaining('Shift и стрелки — поворот и наклон'))
	})

	it('кнопки камеры подписаны; масштаб, поворот и сброс', async () => {
		const { camera, controls } = await renderCamera()
		const group = screen.getByRole('group', { name: 'Камера' })
		expect(group).toBeInTheDocument()
		await fireEvent.click(screen.getByRole('button', { name: 'Увеличить' }))
		expect((camera() as OrthographicCamera).zoom).toBeCloseTo(1.5)
		await fireEvent.click(screen.getByRole('button', { name: 'Уменьшить' }))
		await fireEvent.click(screen.getByRole('button', { name: 'Уменьшить' }))
		expect((camera() as OrthographicCamera).zoom).toBeCloseTo(1 / 1.5)
		await fireEvent.click(screen.getByRole('button', { name: 'Повернуть вправо' }))
		expect(MathUtils.radToDeg(azimuth(camera(), controls().target))).toBeCloseTo(60)
		await fireEvent.click(screen.getByRole('button', { name: 'Повернуть влево' }))
		await fireEvent.click(screen.getByRole('button', { name: 'Повернуть влево' }))
		expect(MathUtils.radToDeg(azimuth(camera(), controls().target))).toBeCloseTo(30)
		await fireEvent.click(screen.getByRole('button', { name: 'Сбросить вид' }))
		expect((camera() as OrthographicCamera).zoom).toBe(1)
		expect(MathUtils.radToDeg(azimuth(camera(), controls().target))).toBeCloseTo(45)
	})

	it('предел масштаба: кнопка отключена, но в фокусе (aria-disabled)', async () => {
		await renderCamera()
		const zoomIn = screen.getByRole('button', { name: 'Увеличить' })
		for (let step = 0; step < 7; step++) await fireEvent.click(zoomIn)
		await waitFor(() => expect(zoomIn).toHaveAttribute('aria-disabled', 'true'))
		const zoomOut = screen.getByRole('button', { name: 'Уменьшить' })
		for (let step = 0; step < 9; step++) await fireEvent.click(zoomOut)
		await waitFor(() => expect(zoomOut).toHaveAttribute('aria-disabled', 'true'))
	})

	it('клавиши в области карты: Shift+стрелки, +, −, 0; чужие клавиши не перехватываются', async () => {
		const { camera, controls } = await renderCamera()
		const region = screen.getByRole('group', { name: 'Этаж 1' })
		await fireEvent.keyDown(region, { key: 'ArrowRight', shiftKey: true })
		expect(MathUtils.radToDeg(azimuth(camera(), controls().target))).toBeCloseTo(60)
		const polar = () => new Spherical().setFromVector3(camera().position.clone().sub(controls().target)).phi
		const before = polar()
		await fireEvent.keyDown(region, { key: 'ArrowUp', shiftKey: true })
		expect(MathUtils.radToDeg(before - polar())).toBeCloseTo(10)
		await fireEvent.keyDown(region, { key: '+', shiftKey: true })
		expect((camera() as OrthographicCamera).zoom).toBeCloseTo(1.5)
		await fireEvent.keyDown(region, { key: '-' })
		expect((camera() as OrthographicCamera).zoom).toBeCloseTo(1)
		await fireEvent.keyDown(region, { key: '0' })
		expect(MathUtils.radToDeg(azimuth(camera(), controls().target))).toBeCloseTo(45)
		const event = new KeyboardEvent('keydown', { key: 'F2', bubbles: true, cancelable: true })
		region.dispatchEvent(event)
		expect(event.defaultPrevented).toBe(false)
	})

	it('zoomToObject: камера смотрит на центр объекта; неизвестный id — без движения', async () => {
		const { exposed, controls, camera } = await renderCamera()
		exposed.value?.zoomToObject('shop')
		await nextTick()
		await nextTick()
		camera()
		expect(controls().target.x).toBeCloseTo(500)
		expect(controls().target.z).toBeCloseTo(250)
		expect((camera() as OrthographicCamera).zoom).toBeCloseTo(800 / 600)
		exposed.value?.zoomToObject('nope')
		expect(controls().target.x).toBeCloseTo(500)
		exposed.value?.rotate(90)
		exposed.value?.zoomIn()
		exposed.value?.zoomOut()
		exposed.value?.resetCamera()
		await nextTick()
		camera()
		expect(controls().target).toEqual(new Vector3(400, 0, 200))
	})

	it('смена этажа ведёт камеру на его высоту', async () => {
		const { controls, camera } = await renderCamera()
		await fireEvent.click(screen.getByRole('radio', { name: 'Этаж 2' }))
		camera()
		expect(controls().target.y).toBe(300)
	})

	it('перспектива: своя камера, масштаб — расстояние до цели', async () => {
		const { camera, controls, rerender } = await renderCamera({ camera: 'perspective' })
		const view = camera()
		expect(view).toBeInstanceOf(PerspectiveCamera)
		const distance = view.position.distanceTo(controls().target)
		await fireEvent.click(screen.getByRole('button', { name: 'Увеличить' }))
		expect(camera().position.distanceTo(controls().target)).toBeCloseTo(distance / 1.5)
		await rerender({ camera: 'isometric' })
		await waitFor(() => expect(camera()).toBeInstanceOf(OrthographicCamera))
		expect((camera() as OrthographicCamera).zoom).toBeCloseTo(1.5)
	})

	it('hasOrbit: false — без вращения указателем; масштаб OrbitControls выключен всегда', async () => {
		const { controls, rerender } = await renderCamera({ hasOrbit: false })
		expect(controls().enableRotate).toBe(false)
		expect(controls().enableZoom).toBe(false)
		await rerender({ hasOrbit: true })
		expect(controls().enableRotate).toBe(true)
		expect(controls().enableZoom).toBe(false)
	})

	it('колесо без Ctrl и ⌘ не масштабирует и не мешает прокрутке; с Ctrl или ⌘ — масштаб по знаку deltaY', async () => {
		const { camera, container } = await renderCamera()
		const canvas = container.querySelector('canvas') as HTMLCanvasElement
		const wheel = async (init: WheelEventInit) => {
			const event = new WheelEvent('wheel', { bubbles: true, cancelable: true, ...init })
			canvas.dispatchEvent(event)
			await nextTick()
			return event
		}
		const zoom = () => (camera() as OrthographicCamera).zoom
		expect((await wheel({ deltaY: -100 })).defaultPrevented).toBe(false)
		expect((await wheel({ deltaY: 100, shiftKey: true })).defaultPrevented).toBe(false)
		await Promise.resolve()
		expect((await wheel({ deltaY: -100 })).defaultPrevented).toBe(false)
		expect(zoom()).toBe(1)
		expect((await wheel({ deltaY: -300, ctrlKey: true })).defaultPrevented).toBe(true)
		expect(zoom()).toBeCloseTo(1.5)
		expect((await wheel({ deltaY: 300, metaKey: true })).defaultPrevented).toBe(true)
		expect(zoom()).toBeCloseTo(1)
		expect((await wheel({ deltaY: -5, ctrlKey: true })).defaultPrevented).toBe(true)
		expect(zoom()).toBeCloseTo(Math.exp(0.02))
		expect((await wheel({ deltaY: 1, deltaMode: 1, ctrlKey: true })).defaultPrevented).toBe(true)
		expect(zoom()).toBeCloseTo(Math.exp(0.02 - 0.064))
		expect((await wheel({ deltaY: 0, ctrlKey: true })).defaultPrevented).toBe(false)
		expect((await wheel({ deltaY: -1, deltaMode: 2, ctrlKey: true })).defaultPrevented).toBe(true)
		expect(zoom()).toBeCloseTo(Math.exp(0.02 - 0.064) * 1.5)
	})

	it('жест OrbitControls останавливает переход и запоминает положение; новые данные — исходный вид', async () => {
		const { controls, camera, rerender } = await renderCamera()
		const view = camera() as OrthographicCamera
		view.zoom = 3
		controls().dispatchEvent({ type: 'start' })
		controls().dispatchEvent({ type: 'change' })
		await nextTick()
		expect(screen.getByRole('button', { name: 'Увеличить' })).not.toHaveAttribute('aria-disabled')
		await rerender({ data: { ...DATA, layers: [{ id: 'x', title: 'X', width: 100, height: 100 }] } })
		await waitFor(() => expect(controls().target).toEqual(new Vector3(50, 0, 50)))
		expect((camera() as OrthographicCamera).zoom).toBe(1)
	})

	it('уход в 2D и размонтирование освобождают OrbitControls; без рендерера методы не ломаются', async () => {
		const dispose = vi.spyOn(OrbitControls.prototype, 'dispose')
		const { exposed, unmount } = await renderCamera()
		exposed.value?.setView('2d')
		await waitFor(() => expect(dispose).toHaveBeenCalledOnce())
		exposed.value?.zoomIn()
		const region = document.querySelector('.base-image-map')
		expect(region).toBeInTheDocument()
		unmount()
	})

	it('без кнопок масштаба (hasZoomControls: false) и с одним этажом — без панели', async () => {
		await renderCamera({ hasZoomControls: false, data: { ...DATA, layers: [DATA.layers[0]] } })
		expect(screen.queryByRole('group', { name: 'Камера' })).toBeNull()
		expect(document.querySelector('.base-image-map-3d__toolbar')).toBeNull()
	})
})

describe('BaseImageMap3D: плавные переходы камеры', () => {
	it('переход идёт кадрами по токену длительности и приходит в цель', async () => {
		const { camera } = await renderCamera()
		await fireEvent.click(screen.getByRole('button', { name: 'Увеличить' }))
		flushFrames(10)
		await nextTick()
		const middle = (camera() as OrthographicCamera).zoom
		expect(middle).toBeGreaterThanOrEqual(1)
		expect(middle).toBeLessThan(1.5)
		flushFrames(1000)
		await nextTick()
		expect((camera() as OrthographicCamera).zoom).toBeCloseTo(1.5)
	})

	it('пресет движения берётся у предка карты: data-rise-motion="none" на обёртке — переход сразу', async () => {
		const wrapper = document.body.appendChild(document.createElement('section'))
		wrapper.setAttribute('data-rise-motion', 'none')
		const { camera } = await renderCamera({}, wrapper.appendChild(document.createElement('div')))
		expect(document.documentElement).not.toHaveAttribute('data-rise-motion')
		await fireEvent.click(screen.getByRole('button', { name: 'Увеличить' }))
		expect((camera() as OrthographicCamera).zoom).toBeCloseTo(1.5)
		wrapper.remove()
	})

	it('нажатия во время перехода копятся: два «Увеличить» — 2,25', async () => {
		const { camera } = await renderCamera()
		await fireEvent.click(screen.getByRole('button', { name: 'Увеличить' }))
		flushFrames(10)
		await nextTick()
		await fireEvent.click(screen.getByRole('button', { name: 'Увеличить' }))
		flushFrames(10)
		flushFrames(1000)
		await nextTick()
		expect((camera() as OrthographicCamera).zoom).toBeCloseTo(2.25)
	})
})
