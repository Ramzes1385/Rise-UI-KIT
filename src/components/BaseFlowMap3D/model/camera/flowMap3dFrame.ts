import { Box3, Vector3 } from 'three'
import { ISO_ELEVATION } from '@/scene3d/camera/cameraPresets'
import { baseDistance, visibleHalf } from '@/scene3d/camera/cameraPose'
import type { FlowViewport } from '@components/BaseFlowMap/types/api/flowController.types'
import type { FlowMap3DFrame, FlowMap3DSnapshot, FlowMap3DViewSpec } from '../../types/internal/flowMap3dInternal.types'
import type { CameraFraming, Scene3DCameraPose, Scene3DViewCamera } from '@/scene3d/types/internal/scene3dInternal.types'

const DEFAULT_UNIT = 40
const FRAME_FILL = 0.86

export function unitOf(value: number | undefined): number {
	return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : DEFAULT_UNIT
}

export function sceneFrame(snapshot: FlowMap3DSnapshot): FlowMap3DFrame {
	const { x0, z0, x1, z1 } = snapshot.bounds
	const height = Math.max(snapshot.height, 0.5)
	const bounds = new Box3(new Vector3(x0, 0, z0), new Vector3(x1, height, z1))
	const size = bounds.getSize(new Vector3())
	return { bounds, radius: Math.max(Math.hypot(size.x, size.z) / 2, 1), halfHeight: height / 2 }
}

export function toCameraFraming(frame: FlowMap3DFrame): CameraFraming {
	return { bounds: frame.bounds, radius: frame.radius * FRAME_FILL, halfHeight: frame.halfHeight, elevation: ISO_ELEVATION }
}

export function frameCenter(frame: FlowMap3DFrame): Vector3 {
	return frame.bounds.getCenter(new Vector3())
}

export function viewSpec(
	camera: Scene3DViewCamera,
	framing: CameraFraming,
	parts: Pick<FlowMap3DViewSpec, 'size' | 'unit' | 'origin'>,
): FlowMap3DViewSpec {
	const { half } = visibleHalf(camera, baseDistance(camera, framing))
	return { ...parts, half }
}

export function viewportOfPose(pose: Scene3DCameraPose, spec: FlowMap3DViewSpec): FlowViewport {
	const { size, unit, half, origin } = spec
	const visible = half / pose[5]
	const zoom = size.height / (2 * visible * unit)
	return { zoom, x: size.width / 2 - (pose[0] + origin.x) * unit * zoom, y: size.height / 2 - (pose[2] + origin.z) * unit * zoom }
}

export function poseOfViewport(viewport: FlowViewport, pose: Scene3DCameraPose, spec: FlowMap3DViewSpec): Scene3DCameraPose {
	const { size, unit, half, origin } = spec
	const zoom = Math.max(viewport.zoom, 1e-6)
	const visible = size.height / (2 * unit * zoom)
	const x = (size.width / 2 - viewport.x) / (unit * zoom) - origin.x
	const z = (size.height / 2 - viewport.y) / (unit * zoom) - origin.z
	return [x, pose[1], z, pose[3], pose[4], half / visible]
}
