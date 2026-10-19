import { Box3, MathUtils, Vector3 } from 'three'
import { ISO_ELEVATION } from '../../camera/cameraPresets'
import type { CameraFraming } from '../../types/internal/scene3dInternal.types'
import {
	MAP_ELEVATION,
	applyPose,
	baseDistance,
	createViewCamera,
	defaultPose,
	fitViewCamera,
	frameHalf,
	readPose,
} from '../../camera/cameraPose'

function framing(elevation: number): CameraFraming {
	return { bounds: new Box3(new Vector3(-8, 0, -6), new Vector3(8, 3, 6)), radius: 10, halfHeight: 2, elevation }
}

describe('cameraPose: возвышение кадра', () => {
	it('defaultPose: по умолчанию 35° карты, флоу и роадмап передают 35,264', () => {
		const center = new Vector3(1, 2, 3)
		expect(MAP_ELEVATION).toBe(35)
		expect(defaultPose(center)[4]).toBeCloseTo(MathUtils.degToRad(55))
		const iso = defaultPose(center, ISO_ELEVATION)
		expect(iso[4]).toBeCloseTo(MathUtils.degToRad(90 - ISO_ELEVATION))
		expect(iso.slice(0, 3)).toEqual([1, 2, 3])
		expect(iso[5]).toBe(1)
	})

	it('frameHalf растёт с радиусом и зависит от возвышения кадра', () => {
		const flat = frameHalf(framing(10), 1.5)
		const steep = frameHalf(framing(80), 1.5)
		expect(flat).not.toBeCloseTo(steep, 3)
		expect(frameHalf({ ...framing(35), radius: 20 }, 1.5)).toBeGreaterThan(frameHalf(framing(35), 1.5))
	})

	it('fitViewCamera подгоняет обе камеры под кадр с любым возвышением: сцена целиком в кадре', () => {
		for (const kind of ['isometric', 'perspective'] as const) {
			const camera = createViewCamera(kind)
			const frame = framing(ISO_ELEVATION)
			fitViewCamera(camera, { width: 600, height: 400 }, frame)
			const target = frame.bounds.getCenter(new Vector3())
			applyPose(camera, defaultPose(target, ISO_ELEVATION), baseDistance(camera, frame))
			camera.updateMatrixWorld(true)
			const { min, max } = frame.bounds
			const corners = [min.x, max.x].flatMap(x => [min.y, max.y].flatMap(y => [min.z, max.z].map(z => new Vector3(x, y, z))))
			const widest = Math.max(
				...corners.map(corner => Math.max(...corner.clone().project(camera).toArray().slice(0, 2).map(Math.abs))),
			)
			expect(widest).toBeLessThanOrEqual(1.0001)
		}
	})

	it('readPose возвращает положение, заданное applyPose, при возвышении флоу', () => {
		const camera = createViewCamera('isometric')
		const frame = framing(ISO_ELEVATION)
		fitViewCamera(camera, { width: 600, height: 400 }, frame)
		const pose = defaultPose(new Vector3(0, 1, 0), ISO_ELEVATION)
		const target = applyPose(camera, pose, baseDistance(camera, frame))
		readPose(camera, target, baseDistance(camera, frame)).forEach((value, index) => expect(value).toBeCloseTo(pose[index], 5))
	})
})
