import { presetPose } from '@/scene3d/camera/cameraPresets'
import { snapshotOf } from '../../fixtures/model.test-utils'
import { OrthographicCamera, PerspectiveCamera, Vector3 } from 'three'
import { applyPose, baseDistance, fitViewCamera } from '@/scene3d/camera/cameraPose'
import { allowedScale, fitPoints, solveFitZoom } from '../../../model/camera/roadmap3dFit'
import { frameCenter, roadmapFrame, toFraming } from '../../../model/scene/roadmap3dSpace'

const SIZE = { width: 1000, height: 500 }

function setup(camera: OrthographicCamera | PerspectiveCamera) {
	const snapshot = snapshotOf()
	const frame = roadmapFrame(snapshot.island.bounds)
	const framing = toFraming(frame)
	const pose = presetPose('iso', frameCenter(frame))
	return { snapshot, framing, pose, zoom: solveFitZoom({ camera, size: SIZE, framing, pose, snapshot }) }
}

function projected(camera: OrthographicCamera | PerspectiveCamera, zoom: number) {
	const { snapshot, framing, pose } = setup(camera)
	const probe = camera.clone()
	fitViewCamera(probe, SIZE, framing)
	applyPose(probe, [pose[0], pose[1], pose[2], pose[3], pose[4], zoom], baseDistance(probe, framing))
	probe.updateMatrixWorld(true)
	return { points: fitPoints(snapshot), probe }
}

describe('solveFitZoom', () => {
	it.each([
		['ортографическая', new OrthographicCamera(-1, 1, 1, -1, 0.1, 1000)],
		['перспективная', new PerspectiveCamera(35, 2, 0.1, 1000)],
	])('%s камера: остров и подписи по краям влезают с отступом и занимают почти весь кадр', (_name, camera) => {
		const { zoom } = setup(camera)
		expect(zoom).toBeGreaterThan(0.5)
		expect(zoom).toBeLessThanOrEqual(3)
		const { points, probe } = projected(camera, zoom)
		expect(allowedScale(points, probe, SIZE)).toBeGreaterThan(0.97)
		expect(allowedScale(points, probe, SIZE)).toBeLessThan(1.05)
	})

	it('на крошечном холсте отступы урезаются, зум не падает ниже 0,5', () => {
		const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 1000)
		const snapshot = snapshotOf({ version: 1, title: 'Один', stages: [{ id: 'a', title: 'A', topics: [] }] }, undefined)
		const framing = toFraming(roadmapFrame(snapshot.island.bounds))
		const pose = presetPose('iso', new Vector3())
		expect(solveFitZoom({ camera, size: { width: 60, height: 40 }, framing, pose, snapshot })).toBeGreaterThanOrEqual(0.5)
	})
})
