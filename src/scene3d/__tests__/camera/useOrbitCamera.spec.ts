import { render } from '@testing-library/vue'
import { Box3, MathUtils, Vector3 } from 'three'
import type { Scene3DRenderer } from '../../types/scene3d.types'
import { defineComponent, h, nextTick, ref, shallowRef } from 'vue'
import { isSamePose, useOrbitCamera } from '../../camera/useOrbitCamera'
import { createViewCamera, fitViewCamera } from '../../camera/cameraPose'
import type { CameraFraming, Scene3DCameraPose, Scene3DViewCamera } from '../../types/internal/scene3dInternal.types'

const HOME: Scene3DCameraPose = [0, 0, 0, Math.PI / 4, MathUtils.degToRad(55), 1]

function framingOf(radius: number): CameraFraming {
	return { bounds: new Box3(new Vector3(-radius, 0, -radius), new Vector3(radius, 2, radius)), radius, halfHeight: 1, elevation: 35 }
}

function fakeRenderer(canvas: HTMLCanvasElement): Scene3DRenderer {
	return { domElement: canvas, setPixelRatio: vi.fn(), setSize: vi.fn(), render: vi.fn(), dispose: vi.fn(), forceContextLoss: vi.fn() }
}

function mountOrbit(kind: 'isometric' | 'perspective' = 'isometric') {
	const camera = shallowRef<Scene3DViewCamera>(createViewCamera(kind))
	const renderer = shallowRef<Scene3DRenderer | null>(null)
	const canvasRef = ref<HTMLCanvasElement | null>(null)
	const fitted = shallowRef(0)
	const hasOrbit = ref(true)
	const framing = ref(framingOf(5))
	const invalidate = vi.fn()
	fitViewCamera(camera.value, { width: 300, height: 200 }, framing.value)
	let api!: ReturnType<typeof useOrbitCamera>
	const view = render(
		defineComponent({
			setup() {
				api = useOrbitCamera({
					camera,
					renderer,
					canvasRef,
					fitted,
					invalidate,
					getFraming: () => framing.value,
					getHomePose: () => HOME,
					getHasOrbit: () => hasOrbit.value,
				})
				return () => h('div')
			},
		}),
	)
	const canvas = document.createElement('canvas')
	async function open() {
		document.body.append(canvas)
		canvasRef.value = canvas
		renderer.value = fakeRenderer(canvas)
		await nextTick()
		await nextTick()
	}
	return { api, view, camera, renderer, canvas, canvasRef, fitted, hasOrbit, framing, invalidate, open }
}

const settle = async () => {
	for (let step = 0; step < 4; step += 1) await nextTick()
}

const pose = (value: ReturnType<typeof mountOrbit>) => value.api.state.current()

beforeEach(() => document.documentElement.setAttribute('data-rise-motion', 'none'))
afterEach(() => {
	document.documentElement.removeAttribute('data-rise-motion')
	document.querySelectorAll('canvas').forEach(canvas => canvas.remove())
})

describe('isSamePose', () => {
	it('сравнивает положения с допуском', () => {
		expect(isSamePose(HOME, [...HOME])).toBe(true)
		expect(isSamePose(HOME, [0, 0, 0, Math.PI / 4 + 1e-9, HOME[4], 1])).toBe(true)
		expect(isSamePose(HOME, [0, 0, 0, Math.PI / 4 + 0.01, HOME[4], 1])).toBe(false)
	})
})

describe('useOrbitCamera: запуск', () => {
	it('без рендерера управления нет', () => {
		const orbit = mountOrbit()
		expect(orbit.api.state.controls.value).toBeNull()
		expect(orbit.api.framing.value.radius).toBe(5)
	})

	it('положение до запуска управления — домашнее, после снятия — последнее показанное', async () => {
		const orbit = mountOrbit()
		pose(orbit).forEach((value, index) => expect(value).toBeCloseTo(HOME[index], 5))
		await orbit.open()
		orbit.api.rotateRight()
		await settle()
		const turned = pose(orbit)
		orbit.renderer.value = null
		await settle()
		pose(orbit).forEach((value, index) => expect(value).toBeCloseTo(turned[index], 5))
	})

	it('с рендерером и холстом: OrbitControls, камера на домашнем положении, кадр запрошен', async () => {
		const orbit = mountOrbit()
		await orbit.open()
		const controls = orbit.api.state.controls.value
		expect(controls).not.toBeNull()
		expect(controls?.enableRotate).toBe(true)
		expect(controls?.enableZoom).toBe(false)
		expect(orbit.canvas.style.touchAction).toBe('none')
		pose(orbit).forEach((value, index) => expect(value).toBeCloseTo(HOME[index], 5))
		expect(orbit.api.state.zoom.value).toBe(1)
		expect(orbit.invalidate).toHaveBeenCalled()
	})

	it('перспективная камера: масштаб держится в положении, а не в zoom камеры', async () => {
		const orbit = mountOrbit('perspective')
		await orbit.open()
		expect(pose(orbit)[5]).toBeCloseTo(1)
		orbit.api.zoomIn()
		await settle()
		expect(pose(orbit)[5]).toBeCloseTo(1.5)
		expect(orbit.camera.value.zoom).toBe(1)
	})

	it('вращение указателем выключается и включается на лету, вместе с touch-action', async () => {
		const orbit = mountOrbit()
		await orbit.open()
		orbit.hasOrbit.value = false
		await settle()
		expect(orbit.api.state.controls.value?.enableRotate).toBe(false)
		expect(orbit.canvas.style.touchAction).toBe('pan-x pan-y')
		orbit.hasOrbit.value = true
		await settle()
		expect(orbit.canvas.style.touchAction).toBe('none')
	})

	it('смена вращения до появления управления ничего не ломает', async () => {
		const orbit = mountOrbit()
		orbit.hasOrbit.value = false
		await settle()
		expect(orbit.api.state.controls.value).toBeNull()
	})

	it('рендерер пропал — управление снято; вернулся — снова, с прежним положением', async () => {
		const orbit = mountOrbit()
		await orbit.open()
		orbit.api.rotateRight()
		await settle()
		const turned = pose(orbit)[3]
		const controls = orbit.api.state.controls.value
		const dispose = vi.spyOn(controls as NonNullable<typeof controls>, 'dispose')
		orbit.renderer.value = null
		await settle()
		expect(dispose).toHaveBeenCalled()
		expect(orbit.api.state.controls.value).toBeNull()
		orbit.renderer.value = fakeRenderer(orbit.canvas)
		await settle()
		expect(pose(orbit)[3]).toBeCloseTo(turned, 5)
	})

	it('размонтирование снимает управление', async () => {
		const orbit = mountOrbit()
		await orbit.open()
		orbit.view.unmount()
		expect(orbit.api.state.controls.value).toBeNull()
	})
})

describe('useOrbitCamera: переходы', () => {
	it('rotateLeft / rotateRight / rotate: азимут меняется на 15° и произвольный угол', async () => {
		const orbit = mountOrbit()
		await orbit.open()
		orbit.api.rotateRight()
		await settle()
		expect(pose(orbit)[3]).toBeCloseTo(HOME[3] + MathUtils.degToRad(15), 5)
		orbit.api.rotateLeft()
		orbit.api.rotateLeft()
		await settle()
		expect(pose(orbit)[3]).toBeCloseTo(HOME[3] - MathUtils.degToRad(15), 5)
		orbit.api.rotate(90)
		await settle()
		expect(pose(orbit)[3]).toBeCloseTo(HOME[3] - MathUtils.degToRad(15) + Math.PI / 2, 5)
	})

	it('нажатия копятся, пока переход не показан', async () => {
		const orbit = mountOrbit()
		await orbit.open()
		orbit.api.rotateRight()
		orbit.api.rotateRight()
		orbit.api.rotateRight()
		await settle()
		expect(pose(orbit)[3]).toBeCloseTo(HOME[3] + MathUtils.degToRad(45), 5)
	})

	it('tilt ограничен допустимым наклоном', async () => {
		const orbit = mountOrbit()
		await orbit.open()
		orbit.api.tilt(10)
		await settle()
		expect(pose(orbit)[4]).toBeCloseTo(MathUtils.degToRad(65), 5)
		orbit.api.tilt(90)
		await settle()
		expect(pose(orbit)[4]).toBeCloseTo(MathUtils.degToRad(75), 5)
		orbit.api.tilt(-180)
		await settle()
		expect(pose(orbit)[4]).toBeCloseTo(MathUtils.degToRad(5), 5)
	})

	it('zoomIn / zoomOut ×1,5 в пределах 0,5–8; признаки крайних значений', async () => {
		const orbit = mountOrbit()
		await orbit.open()
		expect([orbit.api.isMaxZoom.value, orbit.api.isMinZoom.value]).toEqual([false, false])
		orbit.api.zoomIn()
		await settle()
		expect(orbit.api.state.zoom.value).toBeCloseTo(1.5, 5)
		for (let step = 0; step < 6; step += 1) orbit.api.zoomIn()
		await settle()
		expect(orbit.api.isMaxZoom.value).toBe(true)
		expect(orbit.api.state.zoom.value).toBe(8)
		for (let step = 0; step < 12; step += 1) orbit.api.zoomOut()
		await settle()
		expect(orbit.api.isMinZoom.value).toBe(true)
		expect(orbit.api.state.zoom.value).toBe(0.5)
	})

	it('reset возвращает домашнее положение', async () => {
		const orbit = mountOrbit()
		await orbit.open()
		orbit.api.rotate(90)
		orbit.api.zoomIn()
		await settle()
		orbit.api.reset()
		await settle()
		pose(orbit).forEach((value, index) => expect(value).toBeCloseTo(HOME[index], 5))
	})

	it('zoomToBox подводит камеру к коробке: цель в её центре, масштаб больше 1', async () => {
		const orbit = mountOrbit()
		await orbit.open()
		orbit.api.zoomToBox(new Box3(new Vector3(1, 0, 1), new Vector3(2, 1, 2)))
		await settle()
		const [x, , z, , , zoom] = pose(orbit)
		expect([x, z]).toEqual([expect.closeTo(1.5, 4), expect.closeTo(1.5, 4)])
		expect(zoom).toBeGreaterThan(1)
	})
})

describe('useOrbitCamera: жесты', () => {
	const wheel = (init: WheelEventInit) => new WheelEvent('wheel', { cancelable: true, ...init })

	it('колесо с Ctrl или Meta масштабирует и гасит событие; приближение — вверх колесом', async () => {
		const orbit = mountOrbit()
		await orbit.open()
		const event = wheel({ deltaY: -100, ctrlKey: true })
		orbit.api.wheelZoom(event)
		await settle()
		expect(event.defaultPrevented).toBe(true)
		expect(orbit.api.state.zoom.value).toBeGreaterThan(1)
		const before = orbit.api.state.zoom.value
		orbit.api.wheelZoom(wheel({ deltaY: 100, metaKey: true }))
		await settle()
		expect(orbit.api.state.zoom.value).toBeLessThan(before)
	})

	it('шаг колеса зависит от deltaMode и ограничен 1,5', async () => {
		const orbit = mountOrbit()
		await orbit.open()
		orbit.api.wheelZoom(wheel({ deltaY: -1, ctrlKey: true, deltaMode: 1 }))
		await settle()
		const line = orbit.api.state.zoom.value
		expect(line).toBeCloseTo(Math.exp(16 * 0.004), 4)
		orbit.api.reset()
		await settle()
		orbit.api.wheelZoom(wheel({ deltaY: -1, ctrlKey: true, deltaMode: 2 }))
		await settle()
		expect(orbit.api.state.zoom.value).toBeCloseTo(1.5, 4)
		orbit.api.reset()
		await settle()
		orbit.api.wheelZoom(wheel({ deltaY: -10, ctrlKey: true, deltaMode: 7 }))
		await settle()
		expect(orbit.api.state.zoom.value).toBeCloseTo(Math.exp(10 * 0.004), 4)
	})

	it('колесо без Ctrl, с нулевым шагом или до запуска управления ничего не делает', async () => {
		const orbit = mountOrbit()
		const early = wheel({ deltaY: -100, ctrlKey: true })
		orbit.api.wheelZoom(early)
		expect(early.defaultPrevented).toBe(false)
		await orbit.open()
		const plain = wheel({ deltaY: -100 })
		orbit.api.wheelZoom(plain)
		orbit.api.wheelZoom(wheel({ deltaY: 0, ctrlKey: true }))
		await settle()
		expect(plain.defaultPrevented).toBe(false)
		expect(orbit.api.state.zoom.value).toBe(1)
	})

	it('pinchZoom меняет масштаб сразу; до запуска управления — нет', async () => {
		const orbit = mountOrbit()
		orbit.api.pinchZoom(2)
		expect(orbit.api.state.zoom.value).toBe(1)
		await orbit.open()
		orbit.api.pinchZoom(2)
		expect(orbit.api.state.zoom.value).toBe(2)
	})

	it('начало жеста останавливает переход', async () => {
		const orbit = mountOrbit()
		await orbit.open()
		const stop = vi.spyOn(orbit.api.state.tween, 'stop')
		orbit.api.state.controls.value?.dispatchEvent({ type: 'start' } as never)
		expect(stop).toHaveBeenCalled()
	})

	it('изменение от жеста: масштаб запоминается, кадр запрашивается, сдвиг за рамку возвращается', async () => {
		const orbit = mountOrbit()
		await orbit.open()
		const controls = orbit.api.state.controls.value as NonNullable<typeof orbit.api.state.controls.value>
		orbit.invalidate.mockClear()
		controls.dispatchEvent({ type: 'change' } as never)
		expect(orbit.invalidate).toHaveBeenCalledTimes(1)
		const offset = orbit.camera.value.position.clone().sub(controls.target)
		controls.target.set(100, 0, 100)
		orbit.camera.value.position.copy(controls.target).add(offset)
		controls.dispatchEvent({ type: 'change' } as never)
		expect(controls.target.x).toBeCloseTo(5.5, 5)
		expect(controls.target.z).toBeCloseTo(5.5, 5)
		expect(orbit.camera.value.position.clone().sub(controls.target).distanceTo(offset)).toBeCloseTo(0, 5)
	})
})

describe('useOrbitCamera: подгонка под область', () => {
	it('после fitted положение применяется заново, границы дистанции пересчитываются', async () => {
		const orbit = mountOrbit()
		await orbit.open()
		const controls = orbit.api.state.controls.value as NonNullable<typeof orbit.api.state.controls.value>
		const before = controls.maxDistance
		orbit.framing.value = framingOf(10)
		orbit.camera.value.position.set(50, 50, 50)
		orbit.fitted.value += 1
		await settle()
		expect(controls.maxDistance).toBeGreaterThan(before)
		expect(orbit.camera.value.position.x).not.toBe(50)
	})

	it('fitted до запуска управления — ничего', async () => {
		const orbit = mountOrbit()
		orbit.fitted.value += 1
		await settle()
		expect(orbit.api.state.controls.value).toBeNull()
	})

	it('смена камеры пересоздаёт управление на новой камере с прежним положением', async () => {
		const orbit = mountOrbit()
		await orbit.open()
		orbit.api.rotateRight()
		await settle()
		const turned = pose(orbit)[3]
		const next = createViewCamera('isometric')
		fitViewCamera(next, { width: 300, height: 200 }, orbit.framing.value)
		orbit.camera.value = next
		await settle()
		expect(orbit.api.state.controls.value?.object).toBe(next)
		expect(pose(orbit)[3]).toBeCloseTo(turned, 5)
	})
})

describe('useOrbitCamera: плавный переход', () => {
	it('при включённом движении переход идёт кадрами и во время него fitted положение не трогает', async () => {
		document.documentElement.removeAttribute('data-rise-motion')
		document.documentElement.style.setProperty('--rise-duration-xslow', '200ms')
		const orbit = mountOrbit()
		await orbit.open()
		orbit.api.rotate(90)
		expect(orbit.api.state.tween.isRunning.value).toBe(true)
		expect(orbit.api.state.next()[3]).toBeCloseTo(HOME[3] + Math.PI / 2, 5)
		orbit.fitted.value += 1
		await settle()
		await vi.waitFor(() => expect(orbit.api.state.tween.isRunning.value).toBe(false), { timeout: 2000 })
		expect(pose(orbit)[3]).toBeCloseTo(HOME[3] + Math.PI / 2, 4)
		document.documentElement.style.removeProperty('--rise-duration-xslow')
	})
})
