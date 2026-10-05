import { cameraKeyAction } from '../../../model/camera/cameraKeys'
import type { CameraPose } from '../../../types/internal/imageMap3dInternal.types'
import { Box3, MathUtils, OrthographicCamera, PerspectiveCamera, Vector3 } from 'three'
import {
	CAMERA_LIMITS,
	applyPose,
	baseDistance,
	clampPose,
	createViewCamera,
	defaultPose,
	easeInOutCubic,
	fitViewCamera,
	objectPose,
	readPose,
} from '../../../model/camera/cameraPose'

describe('положение камеры', () => {
	it('createViewCamera: изометрия — ортографическая, перспектива — 35°', () => {
		expect(createViewCamera('isometric')).toBeInstanceOf(OrthographicCamera)
		const perspective = createViewCamera('perspective') as PerspectiveCamera
		expect(perspective).toBeInstanceOf(PerspectiveCamera)
		expect(perspective.fov).toBe(35)
	})

	it('baseDistance и fitViewCamera: кадр вмещает сцену', () => {
		const ortho = createViewCamera('isometric') as OrthographicCamera
		expect(baseDistance(ortho, 1000)).toBe(2000)
		fitViewCamera(ortho, { width: 400, height: 200 }, 100)
		expect([ortho.left, ortho.right, ortho.top, ortho.bottom]).toEqual([-130, 130, 65, -65])
		fitViewCamera(ortho, { width: 100, height: 0 }, 2)
		expect(ortho.right).toBeCloseTo(130)
		const perspective = createViewCamera('perspective') as PerspectiveCamera
		expect(baseDistance(perspective, 1000)).toBeCloseTo((500 / Math.tan(MathUtils.degToRad(17.5))) * 1.4)
		fitViewCamera(perspective, { width: 300, height: 100 }, 1000)
		expect(perspective.aspect).toBe(3)
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

	it('objectPose: цель — центр объекта, объект занимает около трети сцены', () => {
		const box = new Box3(new Vector3(100, 0, 100), new Vector3(200, 20, 150))
		const pose = objectPose(box, [0, 0, 0, 1, 0.9, 1], 1000)
		expect(pose.slice(0, 3)).toEqual([150, 10, 125])
		expect(pose[3]).toBe(1)
		expect(pose[5]).toBeCloseTo(1000 / 300)
		const tiny = objectPose(new Box3(new Vector3(), new Vector3()), [0, 0, 0, 1, 0.9, 1], 1000)
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
