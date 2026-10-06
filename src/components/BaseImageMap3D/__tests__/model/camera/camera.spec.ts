import { sceneFrame } from '../../../model/camera/sceneFrame'
import { cameraKeyAction } from '../../../model/camera/cameraKeys'
import type { ImageMap3DData } from '../../../types/imageMap3dData.types'
import { Box3, MathUtils, OrthographicCamera, PerspectiveCamera, Vector3 } from 'three'
import type { CameraPose, ImageMap3DViewCamera, SceneFraming } from '../../../types/internal/imageMap3dInternal.types'
import {
	CAMERA_LIMITS,
	applyPose,
	baseDistance,
	clampPose,
	createViewCamera,
	defaultPose,
	easeInOutCubic,
	fitViewCamera,
	frameHalf,
	limitTarget,
	objectPose,
	panBounds,
	readPose,
	visibleHalf,
} from '../../../model/camera/cameraPose'

const STACK_DATA: ImageMap3DData = {
	layers: [
		{ id: 'f1', title: '1', width: 1000, height: 600 },
		{ id: 'f2', title: '2', width: 1000, height: 600 },
		{ id: 'f3', title: '3', width: 1000, height: 600 },
	],
	objects: [{ id: 'a', title: 'A', type: 'rect', x: 0.1, y: 0.1, width: 0.2, height: 0.2, layer: 'f3', height3d: 40 }],
}

const FRAME = sceneFrame(STACK_DATA)
const STACK: SceneFraming = { frame: FRAME, mode: 'stack' }
const SINGLE: SceneFraming = { frame: FRAME, mode: 'single' }
const HOME_POLAR = MathUtils.degToRad(55)

function corners(box: Box3): Vector3[] {
	const { min, max } = box
	return [min.x, max.x].flatMap(x => [min.y, max.y].flatMap(y => [min.z, max.z].map(z => new Vector3(x, y, z))))
}

function placeAtHome(camera: ImageMap3DViewCamera, framing: SceneFraming, azimuth: number): void {
	const target = framing.frame.bounds.getCenter(new Vector3())
	if (framing.mode === 'single') target.y = 0
	applyPose(camera, [target.x, target.y, target.z, azimuth, HOME_POLAR, 1], baseDistance(camera, framing))
}

function maxNdc(camera: ImageMap3DViewCamera, points: Vector3[]): number {
	camera.updateMatrixWorld(true)
	return Math.max(...points.flatMap(point => point.clone().project(camera).toArray().slice(0, 2).map(Math.abs)))
}

describe('положение камеры', () => {
	it('createViewCamera: изометрия — ортографическая, перспектива — 35°', () => {
		expect(createViewCamera('isometric')).toBeInstanceOf(OrthographicCamera)
		const perspective = createViewCamera('perspective') as PerspectiveCamera
		expect(perspective).toBeInstanceOf(PerspectiveCamera)
		expect(perspective.fov).toBe(35)
	})

	it('frameHalf: высота кадра берётся по вертикали сцены или по ширине плана — что больше', () => {
		const range = FRAME.stackHalf
		const vertical = FRAME.radius * Math.cos(HOME_POLAR) + range * Math.sin(HOME_POLAR)
		expect(frameHalf(STACK, 2)).toBeCloseTo(vertical * 1.08)
		expect(frameHalf(STACK, 0.5)).toBeCloseTo((FRAME.radius / 0.5) * 1.08)
		expect(frameHalf(STACK, 0)).toBeCloseTo((FRAME.radius / 0.1) * 1.08)
		expect(frameHalf(SINGLE, 2)).toBeLessThan(frameHalf(STACK, 2))
	})

	it('baseDistance: ортографическая — три радиуса сцены; перспективная — расстояние, с которого кадр 35° вмещает сцену', () => {
		const ortho = createViewCamera('isometric')
		expect(baseDistance(ortho, STACK)).toBeCloseTo(Math.hypot(FRAME.radius, FRAME.stackHalf) * 3)
		expect(baseDistance(ortho, SINGLE)).toBeCloseTo(Math.hypot(FRAME.radius, FRAME.floorHalf) * 3)
		const perspective = createViewCamera('perspective') as PerspectiveCamera
		expect(baseDistance(perspective, STACK)).toBeGreaterThan(baseDistance(perspective, SINGLE))
		expect(baseDistance(perspective, SINGLE)).toBeGreaterThan(FRAME.radius)
		;[STACK, SINGLE].forEach(framing => {
			fitViewCamera(perspective, { width: 600, height: 400 }, framing)
			expect(perspective.fov).toBeCloseTo(35, 6)
		})
	})

	it('fitViewCamera, изометрия: кадр подстраивается под пропорции области, near и far охватывают сцену', () => {
		const ortho = createViewCamera('isometric') as OrthographicCamera
		fitViewCamera(ortho, { width: 400, height: 200 }, STACK)
		const half = frameHalf(STACK, 2)
		expect([ortho.left, ortho.right, ortho.top, ortho.bottom]).toEqual([-half * 2, half * 2, half, -half])
		fitViewCamera(ortho, { width: 100, height: 0 }, STACK)
		expect(ortho.right / ortho.top).toBe(100)
		fitViewCamera(ortho, { width: 200, height: 400 }, STACK)
		expect(ortho.top).toBeCloseTo(frameHalf(STACK, 0.5))
		const distance = baseDistance(ortho, STACK)
		expect(ortho.near).toBeGreaterThan(0)
		expect(ortho.near).toBeLessThan(distance - Math.hypot(FRAME.radius, FRAME.stackHalf))
		expect(ortho.far).toBeGreaterThan(distance + Math.hypot(FRAME.radius, FRAME.stackHalf))
	})

	it('sceneFrame: границы загруженных моделей расширяют рамку и высоту этажа; пустая граница не мешает', () => {
		const tall = new Box3(new Vector3(100, -50, 100), new Vector3(300, 1500, 200))
		const frame = sceneFrame(STACK_DATA, [tall, new Box3()])
		expect(frame.bounds.max.y).toBe(1500)
		expect(frame.bounds.min.y).toBe(-50)
		expect(frame.stackHalf).toBeGreaterThan(FRAME.stackHalf)
		expect(frame.floorHalf).toBe(1550)
		expect(frame.radius).toBe(FRAME.radius)
		expect(sceneFrame(STACK_DATA, [])).toEqual(FRAME)
	})

	it('fitViewCamera, перспектива: угол обзора подстраивается под пропорции и ограничен, near и far от расстояния', () => {
		const perspective = createViewCamera('perspective') as PerspectiveCamera
		fitViewCamera(perspective, { width: 300, height: 100 }, STACK)
		expect(perspective.aspect).toBe(3)
		const wide = perspective.fov
		fitViewCamera(perspective, { width: 100, height: 300 }, STACK)
		expect(perspective.fov).toBeGreaterThan(wide)
		const portrait = baseDistance(perspective, STACK)
		fitViewCamera(perspective, { width: 1, height: 3000 }, STACK)
		expect(perspective.fov).toBeCloseTo(60, 5)
		expect(baseDistance(perspective, STACK)).toBeGreaterThan(portrait)
		fitViewCamera(perspective, { width: 3000, height: 1 }, STACK)
		expect(perspective.fov).toBeCloseTo(wide)
		expect(perspective.fov).toBeGreaterThanOrEqual(10)
		const distance = baseDistance(perspective, STACK)
		fitViewCamera(perspective, { width: 600, height: 400 }, STACK)
		expect(perspective.near).toBeCloseTo(distance * 0.002)
		expect(perspective.far).toBeCloseTo(distance * 4)
	})

	it.each([
		{ name: 'изометрия, широкая область', kind: 'isometric', aspect: 1.6, mode: 'stack' },
		{ name: 'изометрия, квадрат', kind: 'isometric', aspect: 1, mode: 'stack' },
		{ name: 'изометрия, портрет', kind: 'isometric', aspect: 0.5, mode: 'stack' },
		{ name: 'изометрия, один этаж', kind: 'isometric', aspect: 1.6, mode: 'single' },
		{ name: 'перспектива, широкая область', kind: 'perspective', aspect: 1.6, mode: 'stack' },
		{ name: 'перспектива, портрет', kind: 'perspective', aspect: 0.5, mode: 'stack' },
		{ name: 'перспектива, узкий портрет 0,33', kind: 'perspective', aspect: 0.33, mode: 'stack' },
	] as const)('кадр вмещает всю сцену при любом повороте: $name', ({ kind, aspect, mode }) => {
		const framing: SceneFraming = { frame: FRAME, mode }
		const camera = createViewCamera(kind)
		fitViewCamera(camera, { width: aspect * 400, height: 400 }, framing)
		if (camera instanceof PerspectiveCamera) expect(camera.fov).toBeLessThanOrEqual(60)
		const box = mode === 'stack' ? FRAME.bounds : new Box3(new Vector3(0, -4, 0), new Vector3(1000, 40, 600))
		for (let degrees = 0; degrees < 360; degrees += 15) {
			placeAtHome(camera, framing, MathUtils.degToRad(degrees))
			expect(maxNdc(camera, corners(box))).toBeLessThanOrEqual(1.0001)
		}
	})

	it.each([
		{ name: 'изометрия', kind: 'isometric', aspect: 1.6 },
		{ name: 'изометрия, портрет', kind: 'isometric', aspect: 0.5 },
		{ name: 'перспектива', kind: 'perspective', aspect: 1.6 },
		{ name: 'перспектива, портрет', kind: 'perspective', aspect: 0.5 },
	] as const)('кадр плотный: при некотором повороте сцена занимает не меньше 90% кадра: $name', ({ kind, aspect }) => {
		const camera = createViewCamera(kind)
		fitViewCamera(camera, { width: aspect * 400, height: 400 }, STACK)
		const fill = Array.from({ length: 24 }, (_, step) => {
			placeAtHome(camera, STACK, MathUtils.degToRad(step * 15))
			return maxNdc(camera, corners(FRAME.bounds))
		})
		expect(Math.max(...fill)).toBeGreaterThan(0.9)
	})

	it('изометрия по умолчанию: поворот 45°, наклон 35° от горизонта, масштаб 1', () => {
		const pose = defaultPose(new Vector3(500, 60, 300))
		expect(pose.slice(0, 3)).toEqual([500, 60, 300])
		expect(pose[3]).toBeCloseTo(Math.PI / 4)
		expect(90 - MathUtils.radToDeg(pose[4])).toBeCloseTo(35)
		expect(pose[5]).toBe(1)
	})

	it('clampPose: наклон 5–75° от вертикали, масштаб 0,5–8; азимут без ограничений', () => {
		expect(clampPose([0, 0, 0, 10, 0, 100])).toEqual([0, 0, 0, 10, CAMERA_LIMITS.minPolar, 8])
		expect(clampPose([0, 0, 0, -3, 3, 0.01])).toEqual([0, 0, 0, -3, CAMERA_LIMITS.maxPolar, 0.5])
	})

	it('цель камеры не выходит за стопку этажей с запасом 10% радиуса; внутри — без изменений', () => {
		const { min, max } = panBounds(FRAME)
		expect(min.x).toBeCloseTo(-FRAME.radius * 0.1)
		expect(max.z).toBeCloseTo(600 + FRAME.radius * 0.1)
		expect(limitTarget(new Vector3(500, 100, 300), FRAME)).toEqual(new Vector3(500, 100, 300))
		expect(limitTarget(new Vector3(5000, -900, -5000), FRAME)).toEqual(new Vector3(max.x, min.y, min.z))
		expect(clampPose([5000, 0, 300, 1, 1, 1], FRAME)[0]).toBeCloseTo(max.x)
		expect(clampPose([5000, 0, 300, 1, 1, 1])[0]).toBe(5000)
	})

	it('applyPose и readPose — взаимно обратны для обеих камер', () => {
		const pose: CameraPose = [100, 20, 50, 1, 0.8, 2]
		const ortho = createViewCamera('isometric')
		const target = applyPose(ortho, pose, 2000)
		expect(target).toEqual(new Vector3(100, 20, 50))
		expect(ortho.zoom).toBe(2)
		expect(ortho.position.distanceTo(target)).toBeCloseTo(2000)
		readPose(ortho, target, 2000).forEach((value, index) => expect(value).toBeCloseTo(pose[index]))
		const perspective = createViewCamera('perspective')
		applyPose(perspective, pose, 2000)
		expect(perspective.zoom).toBe(1)
		expect(perspective.position.distanceTo(target)).toBeCloseTo(1000)
		readPose(perspective, target, 2000).forEach((value, index) => expect(value).toBeCloseTo(pose[index]))
		perspective.position.copy(target)
		expect(readPose(perspective, target, 2000)[5]).toBeCloseTo(20000)
	})

	it('visibleHalf: полувысота кадра при масштабе 1 для обеих камер', () => {
		const ortho = createViewCamera('isometric') as OrthographicCamera
		fitViewCamera(ortho, { width: 800, height: 400 }, STACK)
		expect(visibleHalf(ortho, 0)).toEqual({ half: frameHalf(STACK, 2), aspect: 2 })
		const perspective = createViewCamera('perspective') as PerspectiveCamera
		fitViewCamera(perspective, { width: 800, height: 400 }, STACK)
		const distance = baseDistance(perspective, STACK)
		const view = visibleHalf(perspective, distance)
		expect(view.aspect).toBe(2)
		expect(view.half).toBeCloseTo(distance * Math.tan(MathUtils.degToRad(perspective.fov / 2)))
	})

	it('objectPose: цель — центр объекта, диагональ плана объекта — около трети меньшей стороны кадра', () => {
		const box = new Box3(new Vector3(100, 0, 100), new Vector3(200, 20, 150))
		const wide = objectPose(box, [0, 0, 0, 1, 0.9, 1], { half: 600, aspect: 2 })
		expect(wide.slice(0, 3)).toEqual([150, 10, 125])
		expect(wide[3]).toBe(1)
		expect(wide[5]).toBeCloseTo(1200 / (3 * Math.hypot(100, 50)))
		const portrait = objectPose(box, [0, 0, 0, 1, 0.9, 1], { half: 600, aspect: 0.5 })
		expect(portrait[5]).toBeCloseTo(600 / (3 * Math.hypot(100, 50)))
		const tiny = objectPose(new Box3(new Vector3(), new Vector3()), [0, 0, 0, 1, 0.9, 1], { half: 600, aspect: 2 })
		expect(tiny[5]).toBe(8)
	})

	it('easeInOutCubic: плавный старт и остановка, середина — 0,5', () => {
		expect([easeInOutCubic(0), easeInOutCubic(0.5), easeInOutCubic(1)]).toEqual([0, 0.5, 1])
		expect(easeInOutCubic(0.25)).toBeLessThan(0.25)
		expect(easeInOutCubic(0.75)).toBeGreaterThan(0.75)
	})
})

describe('клавиши камеры', () => {
	const key = (init: KeyboardEventInit) => cameraKeyAction(new KeyboardEvent('keydown', init))

	it('Shift + стрелки — поворот на 15° и наклон на 10°', () => {
		expect(key({ key: 'ArrowLeft', shiftKey: true })).toEqual({ type: 'rotate', degrees: -15 })
		expect(key({ key: 'ArrowRight', shiftKey: true })).toEqual({ type: 'rotate', degrees: 15 })
		expect(key({ key: 'ArrowUp', shiftKey: true })).toEqual({ type: 'tilt', degrees: -10 })
		expect(key({ key: 'ArrowDown', shiftKey: true })).toEqual({ type: 'tilt', degrees: 10 })
	})

	it('+, =, -, _ — масштаб; 0 — сброс; стрелки без Shift и сочетания с Ctrl, ⌘, Alt — не камера', () => {
		expect(key({ key: '+', shiftKey: true })).toEqual({ type: 'zoom', direction: 1 })
		expect(key({ key: '=' })).toEqual({ type: 'zoom', direction: 1 })
		expect(key({ key: '-' })).toEqual({ type: 'zoom', direction: -1 })
		expect(key({ key: '_', shiftKey: true })).toEqual({ type: 'zoom', direction: -1 })
		expect(key({ key: '0' })).toEqual({ type: 'reset' })
		expect(key({ key: 'ArrowLeft' })).toBeNull()
		expect(key({ key: '0', ctrlKey: true })).toBeNull()
		expect(key({ key: '+', metaKey: true })).toBeNull()
		expect(key({ key: '-', altKey: true })).toBeNull()
	})
})
