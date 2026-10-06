import type { Box3 } from 'three'
import type { ImageMap3DCamera } from '../../types/BaseImageMap3D.types'
import { MathUtils, OrthographicCamera, PerspectiveCamera, Spherical, Vector3 } from 'three'
import type {
	CameraPose,
	ImageMap3DViewCamera,
	SceneFrame,
	SceneFraming,
	SceneRimPoint,
	ScreenSize,
} from '../../types/internal/imageMap3dInternal.types'

export const CAMERA_LIMITS = {
	minPolar: MathUtils.degToRad(5),
	maxPolar: MathUtils.degToRad(75),
	minZoom: 0.5,
	maxZoom: 8,
}

const ISO_AZIMUTH = Math.PI / 4
const ISO_POLAR = MathUtils.degToRad(90 - 35)
const PERSPECTIVE_FOV = 35
const MIN_FOV = 10
const MAX_FOV = 60
const REFERENCE_ASPECT = 1.5
const MIN_ASPECT = 0.1
const ORTHO_DISTANCE = 3
const ORTHO_DEPTH = 2.2
const PERSPECTIVE_NEAR = 0.002
const PERSPECTIVE_FAR = 4
const RIM_STEPS = 72
const OBJECT_SHARE = 3
const FRAME_MARGIN = 1.08
const PAN_MARGIN = 0.1
const NEAR = 0.1
const FAR = 1_000_000

export function createViewCamera(kind: ImageMap3DCamera): ImageMap3DViewCamera {
	if (kind === 'perspective') return new PerspectiveCamera(PERSPECTIVE_FOV, 1, NEAR, FAR)
	return new OrthographicCamera(-1, 1, 1, -1, NEAR, FAR)
}

function frameRange({ frame, mode }: SceneFraming): number {
	return mode === 'single' ? frame.floorHalf : frame.stackHalf
}

export function frameHalf(framing: SceneFraming, aspect: number): number {
	const { radius } = framing.frame
	const vertical = radius * Math.cos(ISO_POLAR) + frameRange(framing) * Math.sin(ISO_POLAR)
	return Math.max(vertical, radius / Math.max(aspect, MIN_ASPECT)) * FRAME_MARGIN
}

function rimPoints(framing: SceneFraming): SceneRimPoint[] {
	const { radius } = framing.frame
	const range = frameRange(framing)
	const [sin, cos] = [Math.sin(ISO_POLAR), Math.cos(ISO_POLAR)]
	return Array.from({ length: RIM_STEPS * 2 }, (_, index) => {
		const angle = (Math.floor(index / 2) / RIM_STEPS) * 2 * Math.PI
		const height = index % 2 === 0 ? -range : range
		return {
			sideways: Math.abs(radius * Math.sin(angle)),
			up: Math.abs(height * sin - radius * Math.cos(angle) * cos),
			toward: radius * Math.cos(angle) * sin + height * cos,
		}
	})
}

function spread(point: SceneRimPoint, aspect: number): number {
	return Math.max(point.up, point.sideways / Math.max(aspect, MIN_ASPECT))
}

function perspectiveDistance(framing: SceneFraming, aspect: number, fov: number): number {
	const slope = Math.tan(MathUtils.degToRad(fov / 2))
	return Math.max(...rimPoints(framing).map(point => point.toward + (spread(point, aspect) * FRAME_MARGIN) / slope))
}

function perspectiveFov(framing: SceneFraming, distance: number, aspect: number): number {
	const slope = Math.max(...rimPoints(framing).map(point => spread(point, aspect) / (distance - point.toward)))
	return MathUtils.clamp(MathUtils.radToDeg(2 * Math.atan(slope * FRAME_MARGIN)), MIN_FOV, MAX_FOV)
}

export function baseDistance(camera: ImageMap3DViewCamera, framing: SceneFraming): number {
	if (camera instanceof OrthographicCamera) return Math.hypot(framing.frame.radius, frameRange(framing)) * ORTHO_DISTANCE
	return Math.max(perspectiveDistance(framing, REFERENCE_ASPECT, PERSPECTIVE_FOV), perspectiveDistance(framing, camera.aspect, MAX_FOV))
}

function fitPerspective(camera: PerspectiveCamera, aspect: number, framing: SceneFraming): void {
	camera.aspect = aspect
	const distance = baseDistance(camera, framing)
	camera.fov = perspectiveFov(framing, distance, aspect)
	camera.near = distance * PERSPECTIVE_NEAR
	camera.far = distance * PERSPECTIVE_FAR
}

function fitOrthographic(camera: OrthographicCamera, aspect: number, framing: SceneFraming): void {
	const half = frameHalf(framing, aspect)
	const distance = baseDistance(camera, framing)
	const reach = Math.hypot(framing.frame.radius, frameRange(framing)) * ORTHO_DEPTH
	Object.assign(camera, { left: -half * aspect, right: half * aspect, top: half, bottom: -half })
	camera.near = Math.max(distance - reach, distance * PERSPECTIVE_NEAR)
	camera.far = distance + reach
}

export function fitViewCamera(camera: ImageMap3DViewCamera, size: ScreenSize, framing: SceneFraming): void {
	const aspect = size.width / Math.max(size.height, 1)
	if (camera instanceof PerspectiveCamera) fitPerspective(camera, aspect, framing)
	else fitOrthographic(camera, aspect, framing)
	camera.updateProjectionMatrix()
}

export function panBounds(frame: SceneFrame): Box3 {
	return frame.bounds.clone().expandByScalar(frame.radius * PAN_MARGIN)
}

export function limitTarget(target: Vector3, frame: SceneFrame): Vector3 {
	const { min, max } = panBounds(frame)
	return target.clone().clamp(min, max)
}

export function clampPose(pose: CameraPose, frame?: SceneFrame): CameraPose {
	const [x, y, z, azimuth, polar, zoom] = pose
	const target = frame ? limitTarget(new Vector3(x, y, z), frame) : new Vector3(x, y, z)
	return [
		target.x,
		target.y,
		target.z,
		azimuth,
		MathUtils.clamp(polar, CAMERA_LIMITS.minPolar, CAMERA_LIMITS.maxPolar),
		MathUtils.clamp(zoom, CAMERA_LIMITS.minZoom, CAMERA_LIMITS.maxZoom),
	]
}

export function defaultPose(center: Vector3): CameraPose {
	return [center.x, center.y, center.z, ISO_AZIMUTH, ISO_POLAR, 1]
}

export function readPose(camera: ImageMap3DViewCamera, target: Vector3, distance: number): CameraPose {
	const spherical = new Spherical().setFromVector3(camera.position.clone().sub(target))
	const zoom = camera instanceof OrthographicCamera ? camera.zoom : distance / Math.max(spherical.radius, NEAR)
	return [target.x, target.y, target.z, spherical.theta, spherical.phi, zoom]
}

export function applyPose(camera: ImageMap3DViewCamera, pose: CameraPose, distance: number): Vector3 {
	const [x, y, z, azimuth, polar, zoom] = pose
	const target = new Vector3(x, y, z)
	const isOrtho = camera instanceof OrthographicCamera
	const radius = isOrtho ? distance : distance / zoom
	camera.position.copy(target).add(new Vector3().setFromSpherical(new Spherical(radius, polar, azimuth)))
	camera.lookAt(target)
	camera.zoom = isOrtho ? zoom : 1
	camera.updateProjectionMatrix()
	return target
}

export function visibleHalf(camera: ImageMap3DViewCamera, distance: number): { half: number; aspect: number } {
	if (camera instanceof OrthographicCamera) return { half: camera.top, aspect: camera.right / camera.top }
	return { half: distance * Math.tan(MathUtils.degToRad(camera.fov / 2)), aspect: camera.aspect }
}

export function objectPose(box: Box3, pose: CameraPose, view: { half: number; aspect: number }): CameraPose {
	const center = box.getCenter(new Vector3())
	const size = box.getSize(new Vector3())
	const footprint = Math.max(Math.hypot(size.x, size.z), 1)
	const visible = 2 * Math.min(view.half, view.half * view.aspect)
	return clampPose([center.x, center.y, center.z, pose[3], pose[4], visible / (OBJECT_SHARE * footprint)])
}

export function easeInOutCubic(progress: number): number {
	return progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2
}
