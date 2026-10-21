import { Vector3 } from 'three'
import { PEDESTAL, SLAB, STEP } from '../scene/roadmap3dSpace'
import { applyPose, baseDistance, fitViewCamera } from '@/scene3d/camera/cameraPose'
import type { Scene3DViewCamera } from '@/scene3d/types/internal/scene3dInternal.types'
import type { Roadmap3DFitPoint, Roadmap3DFitRequest, Roadmap3DSnapshot } from '../../types/internal/roadmap3dInternal.types'

const MIN_FIT = 0.5
const MAX_FIT = 3
const FIT_STEPS = 3
const SHORE_PAD = { x: 14, y: 14 }
const STAGE_PAD = { x: 60, y: 44 }
const GOAL_PAD = { x: 110, y: 44 }
const STAGE_TAG_HEIGHT = PEDESTAL + 2.95
const MOUNTAIN_TOP = 1.6
const GOAL_TAG_LIFT = 1.9

export function fitPoints(snapshot: Roadmap3DSnapshot): Roadmap3DFitPoint[] {
	const { island, stages } = snapshot
	const { layout, mountains, shoreline } = island
	const point = (item: { x: number; z: number }, y: number, pad: { x: number; y: number }): Roadmap3DFitPoint => ({
		x: item.x,
		y,
		z: -item.z,
		padX: pad.x,
		padY: pad.y,
	})
	const peak = mountains.reduce((best, item) => (item.height > best.height ? item : best), {
		height: 0,
		x: layout.goal.x,
		z: layout.goal.z,
	})
	return [
		...shoreline.flatMap(item => [point(item, -SLAB - STEP * 3, SHORE_PAD), point(item, 0, SHORE_PAD)]),
		...mountains.map(item => point(item, item.height + MOUNTAIN_TOP, SHORE_PAD)),
		...stages.map(stage => ({ x: stage.position.x, y: STAGE_TAG_HEIGHT, z: stage.position.z, padX: STAGE_PAD.x, padY: STAGE_PAD.y })),
		point(peak, peak.height + GOAL_TAG_LIFT, GOAL_PAD),
	]
}

export function allowedScale(points: Roadmap3DFitPoint[], camera: Scene3DViewCamera, size: { width: number; height: number }): number {
	const spot = new Vector3()
	let scale = Infinity
	for (const item of points) {
		spot.set(item.x, item.y, item.z).project(camera)
		const sideways = (1 - (item.padX * 2) / size.width) / Math.max(Math.abs(spot.x), 1e-6)
		const up = (1 - (item.padY * 2) / size.height) / Math.max(Math.abs(spot.y), 1e-6)
		scale = Math.min(scale, sideways, up)
	}
	return scale
}

export function solveFitZoom(request: Roadmap3DFitRequest): number {
	const { camera, size, framing, pose, snapshot } = request
	const probe = camera.clone() as Scene3DViewCamera
	fitViewCamera(probe, size, framing)
	const points = fitPoints(snapshot)
	const distance = baseDistance(probe, framing)
	let zoom = 1
	for (let step = 0; step < FIT_STEPS; step++) {
		applyPose(probe, [pose[0], pose[1], pose[2], pose[3], pose[4], zoom], distance)
		probe.updateMatrixWorld(true)
		zoom *= allowedScale(points, probe, size)
	}
	return Math.min(Math.max(zoom, MIN_FIT), MAX_FIT)
}
