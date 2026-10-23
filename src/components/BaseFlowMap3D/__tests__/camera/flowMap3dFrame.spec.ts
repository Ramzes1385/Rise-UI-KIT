import { Box3, Vector3 } from 'three'
import { OrthographicCamera } from 'three'
import { baseDistance } from '@/scene3d/camera/cameraPose'
import type { FlowMap3DSnapshot } from '../../types/internal/flowMap3dInternal.types'
import type { Scene3DCameraPose } from '@/scene3d/types/internal/scene3dInternal.types'
import {
	frameCenter,
	poseOfViewport,
	sceneFrame,
	toCameraFraming,
	unitOf,
	viewSpec,
	viewportOfPose,
} from '../../model/camera/flowMap3dFrame'

function snapshotOf(extra: Partial<FlowMap3DSnapshot> = {}): FlowMap3DSnapshot {
	return { bounds: { x0: -4, z0: -2, x1: 6, z1: 2 }, height: 3, ...extra } as FlowMap3DSnapshot
}

describe('unitOf', () => {
	it('берёт положительное конечное число, иначе 40', () => {
		expect(unitOf(20)).toBe(20)
		expect(unitOf(undefined)).toBe(40)
		expect(unitOf(0)).toBe(40)
		expect(unitOf(-5)).toBe(40)
		expect(unitOf(Infinity)).toBe(40)
	})
})

describe('sceneFrame, toCameraFraming, frameCenter', () => {
	it('кадр охватывает рамку плана на высоту сцены', () => {
		const frame = sceneFrame(snapshotOf())
		expect(frame.bounds.min.toArray()).toEqual([-4, 0, -2])
		expect(frame.bounds.max.toArray()).toEqual([6, 3, 2])
		expect(frame.radius).toBeCloseTo(Math.hypot(10, 4) / 2)
		expect(frame.halfHeight).toBe(1.5)
	})

	it('высота не меньше 0,5, а радиус не меньше 1', () => {
		const frame = sceneFrame(snapshotOf({ bounds: { x0: 0, z0: 0, x1: 0.2, z1: 0.2 }, height: 0 }))
		expect(frame.halfHeight).toBe(0.25)
		expect(frame.radius).toBe(1)
	})

	it('рамка камеры наследует границы и добавляет угол места', () => {
		const frame = sceneFrame(snapshotOf())
		expect(toCameraFraming(frame)).toMatchObject({ bounds: frame.bounds, radius: frame.radius * 0.86, halfHeight: frame.halfHeight })
		expect(toCameraFraming(frame).elevation).toBeGreaterThan(0)
	})

	it('центр кадра — центр границ сцены', () => {
		expect(frameCenter(sceneFrame(snapshotOf())).toArray()).toEqual([1, 1.5, 0])
	})
})

describe('viewportOfPose и poseOfViewport', () => {
	const camera = new OrthographicCamera(-10, 10, 10, -10)
	const framing = toCameraFraming(sceneFrame(snapshotOf()))
	const spec = viewSpec(camera, framing, { size: { width: 900, height: 560 }, unit: 40, origin: { x: 3, z: 1 } })

	it('спецификация хранит размер, единицу, начало и половину видимой высоты', () => {
		expect(spec.size).toEqual({ width: 900, height: 560 })
		expect(spec.unit).toBe(40)
		expect(spec.origin).toEqual({ x: 3, z: 1 })
		expect(spec.half).toBeGreaterThan(0)
		expect(baseDistance(camera, framing)).toBeGreaterThan(0)
	})

	it('положение и область взаимно обратны', () => {
		const poses: Scene3DCameraPose[] = [
			[1, 0, 2, 0.5, 1, 1],
			[-3.5, 0, 4, 2.2, 0.8, 2.5],
			[0, 0, 0, 0, 1.2, 0.4],
		]
		for (const pose of poses) {
			const viewport = viewportOfPose(pose, spec)
			const back = poseOfViewport(viewport, pose, spec)
			back.forEach((value, index) => expect(value).toBeCloseTo(pose[index], 6))
		}
	})

	it('область переносится в положение и обратно без потерь', () => {
		const pose: Scene3DCameraPose = [2, 0, -1, 1, 1, 1.5]
		const viewport = { x: 120, y: -40, zoom: 1.8 }
		const next = poseOfViewport(viewport, pose, spec)
		const back = viewportOfPose(next, spec)
		expect(back.x).toBeCloseTo(viewport.x, 6)
		expect(back.y).toBeCloseTo(viewport.y, 6)
		expect(back.zoom).toBeCloseTo(viewport.zoom, 6)
		expect([next[1], next[3], next[4]]).toEqual([pose[1], pose[3], pose[4]])
	})

	it('нулевой масштаб области не делит на ноль', () => {
		const pose = poseOfViewport({ x: 0, y: 0, zoom: 0 }, [0, 0, 0, 0, 1, 1], spec)
		expect(Number.isFinite(pose[5])).toBe(true)
	})

	it('Box3 из рамки кадра — это Box3 three', () => {
		expect(sceneFrame(snapshotOf()).bounds).toBeInstanceOf(Box3)
		expect(frameCenter(sceneFrame(snapshotOf()))).toBeInstanceOf(Vector3)
	})
})
