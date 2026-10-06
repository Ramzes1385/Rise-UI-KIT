import '@testing-library/jest-dom/vitest'
import type { Camera, Scene } from 'three'
import BaseImageMap3D from '../ui/BaseImageMap3D.vue'
import { defineComponent, h, nextTick, ref } from 'vue'
import type { ImageMap3DData } from '../types/imageMap3dData.types'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { createFakeRenderer, mockWebGL } from './imageMap3d.test-utils'
import type { BaseImageMap3DExpose } from '../types/BaseImageMap3D.types'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { BoxGeometry, Group, MathUtils, Mesh, MeshBasicMaterial, OrthographicCamera, PerspectiveCamera, Spherical, Vector3 } from 'three'

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
	vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(800)
	vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(400)
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
		expect(controls().target).toEqual(new Vector3(400, 148, 200))
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
		expect((camera() as OrthographicCamera).zoom).toBeCloseTo(1.2268, 3)
		exposed.value?.zoomToObject('nope')
		expect(controls().target.x).toBeCloseTo(500)
		exposed.value?.rotate(90)
		exposed.value?.zoomIn()
		exposed.value?.zoomOut()
		exposed.value?.resetCamera()
		await nextTick()
		camera()
		expect(controls().target).toEqual(new Vector3(400, 148, 200))
	})

	it('смена этажа на обзорном масштабе не двигает камеру: стопка этажей остаётся в кадре целиком', async () => {
		const { controls, camera } = await renderCamera()
		await fireEvent.click(screen.getByRole('radio', { name: 'Этаж 2' }))
		camera()
		expect(controls().target).toEqual(new Vector3(400, 148, 200))
	})

	it('смена этажа при увеличении ведёт камеру на высоту этажа; на обзорном масштабе — к центру стопки', async () => {
		const { controls, camera } = await renderCamera()
		await fireEvent.click(screen.getByRole('button', { name: 'Увеличить' }))
		await fireEvent.click(screen.getByRole('radio', { name: 'Этаж 2' }))
		camera()
		expect(controls().target.y).toBe(300)
		await fireEvent.click(screen.getByRole('button', { name: 'Уменьшить' }))
		await fireEvent.click(screen.getByRole('radio', { name: 'Этаж 1' }))
		camera()
		expect(controls().target.y).toBe(148)
	})

	it('один этаж: камера на высоте активного этажа; смена режима возвращает вид к обзору нового режима', async () => {
		const { controls, camera, rerender } = await renderCamera({ layerMode: 'single' })
		expect(controls().target).toEqual(new Vector3(400, 0, 200))
		await fireEvent.click(screen.getByRole('radio', { name: 'Этаж 2' }))
		camera()
		expect(controls().target).toEqual(new Vector3(400, 300, 200))
		await rerender({ layerMode: 'stack' })
		camera()
		expect(controls().target).toEqual(new Vector3(400, 148, 200))
		await rerender({ layerMode: 'single' })
		camera()
		expect(controls().target).toEqual(new Vector3(400, 300, 200))
	})

	it('панорамирование ограничено стопкой этажей с запасом: цель и камера смещаются вместе, вид не меняется', async () => {
		const { controls, camera } = await renderCamera()
		const view = camera()
		const offset = view.position.clone().sub(controls().target)
		controls().target.set(5000, -900, -5000)
		view.position.copy(controls().target).add(offset)
		controls().dispatchEvent({ type: 'change' })
		const margin = Math.hypot(800, 400) / 2 / 10
		expect(controls().target.x).toBeCloseTo(800 + margin)
		expect(controls().target.y).toBeCloseTo(-4 - margin)
		expect(controls().target.z).toBeCloseTo(-margin)
		expect(view.position.clone().sub(controls().target).distanceTo(offset)).toBeLessThan(1e-6)
		controls().target.set(100, 10, 100)
		controls().dispatchEvent({ type: 'change' })
		expect(controls().target).toEqual(new Vector3(100, 10, 100))
	})

	it('перспектива: пределы расстояния OrbitControls следуют за размером сцены', async () => {
		const { controls, rerender } = await renderCamera({ camera: 'perspective' })
		const before = controls().maxDistance
		expect(controls().minDistance).toBeCloseTo(before / 16)
		await rerender({ data: { ...DATA, layers: [{ id: 'f1', title: 'Этаж 1', width: 8000, height: 4000 }] } })
		await waitFor(() => expect(controls().maxDistance).toBeGreaterThan(before * 5))
		expect(controls().minDistance).toBeCloseTo(controls().maxDistance / 16)
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
		await waitFor(() => expect(controls().target).toEqual(new Vector3(50, -2, 50)))
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
		const second = await renderCamera()
		const controls = second.controls()
		expect(dispose).toHaveBeenCalledOnce()
		second.unmount()
		expect(dispose).toHaveBeenCalledTimes(2)
		expect(dispose.mock.contexts.at(-1)).toBe(controls)
	})

	it('касание: при hasOrbit — touch-action none, без него — pan-x pan-y (палец прокручивает страницу)', async () => {
		const { container, rerender, exposed } = await renderCamera({ hasOrbit: false })
		const canvas = container.querySelector('canvas') as HTMLCanvasElement
		expect(canvas.style.touchAction).toBe('pan-x pan-y')
		await rerender({ hasOrbit: true })
		expect(canvas.style.touchAction).toBe('none')
		await rerender({ hasOrbit: false })
		expect(canvas.style.touchAction).toBe('pan-x pan-y')
		exposed.value?.setView('2d')
		await nextTick()
		await nextTick()
		await rerender({ hasOrbit: true })
		expect(container.querySelector('canvas')).toBeNull()
	})

	it('щипок двумя пальцами меняет масштаб, как Ctrl и колесо; один палец и мышь — нет', async () => {
		const { camera, container } = await renderCamera()
		const region = container.querySelector('.base-image-map-3d__viewport') as HTMLElement
		const zoom = () => (camera() as OrthographicCamera).zoom
		await fireEvent.pointerDown(region, { pointerType: 'mouse', pointerId: 9, clientX: 0, clientY: 0 })
		await fireEvent.pointerDown(region, { pointerType: 'touch', pointerId: 1, clientX: 100, clientY: 100 })
		await fireEvent.pointerMove(region, { pointerType: 'touch', pointerId: 1, clientX: 150, clientY: 100 })
		await fireEvent.pointerMove(region, { pointerType: 'mouse', pointerId: 9, clientX: 300, clientY: 0 })
		expect(zoom()).toBe(1)
		await fireEvent.pointerDown(region, { pointerType: 'touch', pointerId: 2, clientX: 250, clientY: 100 })
		await fireEvent.pointerMove(region, { pointerType: 'touch', pointerId: 2, clientX: 350, clientY: 100 })
		expect(zoom()).toBeCloseTo(2)
		await fireEvent.pointerMove(region, { pointerType: 'touch', pointerId: 1, clientX: 250, clientY: 100 })
		expect(zoom()).toBeCloseTo(1)
		await fireEvent.pointerMove(region, { pointerType: 'touch', pointerId: 2, clientX: 250, clientY: 100 })
		expect(zoom()).toBeCloseTo(1)
		await fireEvent.pointerMove(region, { pointerType: 'touch', pointerId: 2, clientX: 2000, clientY: 100 })
		expect(zoom()).toBeCloseTo(1)
		await fireEvent.pointerUp(region, { pointerType: 'touch', pointerId: 2 })
		await fireEvent.pointerCancel(region, { pointerType: 'touch', pointerId: 1 })
		await fireEvent.pointerMove(region, { pointerType: 'touch', pointerId: 1, clientX: 900, clientY: 100 })
		expect(zoom()).toBeCloseTo(1)
		await fireEvent.pointerDown(region, { pointerType: 'touch', pointerId: 3, clientX: 100, clientY: 100 })
		await fireEvent.pointerDown(region, { pointerType: 'touch', pointerId: 4, clientX: 200, clientY: 100 })
		await fireEvent.pointerMove(region, { pointerType: 'touch', pointerId: 4, clientX: 300, clientY: 100 })
		expect(zoom()).toBeCloseTo(2)
	})

	it.each(['isometric', 'perspective'] as const)(
		'модель этажа выше объектов: после загрузки кадр и near/far расширяются по ней (%s)',
		async kind => {
			const tower = new Mesh(new BoxGeometry(100, 900, 100), new MeshBasicMaterial())
			tower.position.set(400, 450, 200)
			const model = new Group()
			model.add(tower)
			let resolveModel: (value: unknown) => void = () => undefined
			const configureLoader = (loader: { loadAsync: unknown }) => {
				loader.loadAsync = () => new Promise(resolve => (resolveModel = resolve))
			}
			const data: ImageMap3DData = {
				layers: [{ id: 'm', title: 'M', width: 800, height: 400, model: { url: 'm.glb' } }],
				objects: [],
			}
			const { camera } = await renderCamera({ data, configureLoader, camera: kind })
			const corners = [-1, 1].flatMap(x => [0, 900].flatMap(y => [-1, 1].map(z => new Vector3(400 + x * 50, y, 200 + z * 50))))
			const reach = (view: Camera) => {
				view.updateMatrixWorld(true)
				return Math.max(...corners.map(point => Math.max(...point.clone().project(view).toArray().map(Math.abs))))
			}
			expect(reach(camera())).toBeGreaterThan(1)
			resolveModel({ scene: model })
			await waitFor(() => expect(reach(camera())).toBeLessThanOrEqual(1))
		},
	)

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

	it('смена этажа во время поворота не теряет поворот: переход от цели, а не от промежуточного положения', async () => {
		const { camera, controls } = await renderCamera({ layerMode: 'single' })
		await fireEvent.click(screen.getByRole('button', { name: 'Повернуть вправо' }))
		flushFrames(10)
		await nextTick()
		await fireEvent.click(screen.getByRole('radio', { name: 'Этаж 2' }))
		flushFrames(10)
		flushFrames(1000)
		await nextTick()
		expect(MathUtils.radToDeg(azimuth(camera(), controls().target))).toBeCloseTo(60)
		expect(controls().target.y).toBe(300)
	})

	it('без движения (motion none) два шага в одном тике — два шага: масштаб 2,25, поворот на два шага', async () => {
		const wrapper = document.body.appendChild(document.createElement('section'))
		wrapper.setAttribute('data-rise-motion', 'none')
		const { camera, controls, exposed } = await renderCamera({}, wrapper.appendChild(document.createElement('div')))
		const start = MathUtils.radToDeg(azimuth(camera(), controls().target))
		exposed.value?.zoomIn()
		exposed.value?.zoomIn()
		await nextTick()
		expect((camera() as OrthographicCamera).zoom).toBeCloseTo(2.25)
		exposed.value?.rotate(15)
		exposed.value?.rotate(15)
		await nextTick()
		expect(MathUtils.radToDeg(azimuth(camera(), controls().target)) - start).toBeCloseTo(30)
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
