import type { Box3 } from 'three'
import { MathUtils, OrthographicCamera, PerspectiveCamera, Spherical, Vector3 } from 'three'
import type {
	CameraFraming,
	Scene3DPanFrame,
	Scene3DCameraKind,
	Scene3DCameraPose,
	Scene3DRimPoint,
	Scene3DScreenSize,
	Scene3DViewCamera,
} from '../types/internal/scene3dInternal.types'

export const CAMERA_LIMITS = {
	minPolar: MathUtils.degToRad(5),
	maxPolar: MathUtils.degToRad(75),
	minZoom: 0.5,
	maxZoom: 8,
}

const ISO_AZIMUTH = Math.PI / 4
/** Возвышение камеры карты, градусы; флоу и роадмап передают 35,264 */
export const MAP_ELEVATION = 35
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

export function createViewCamera(kind: Scene3DCameraKind): Scene3DViewCamera {
	if (kind === 'perspective') return new PerspectiveCamera(PERSPECTIVE_FOV, 1, NEAR, FAR)
	return new OrthographicCamera(-1, 1, 1, -1, NEAR, FAR)
}

function polarOf(framing: CameraFraming): number {
	return MathUtils.degToRad(90 - framing.elevation)
}

export function frameHalf(framing: CameraFraming, aspect: number): number {
	const { radius, halfHeight } = framing
	const polar = polarOf(framing)
	const vertical = radius * Math.cos(polar) + halfHeight * Math.sin(polar)
	return Math.max(vertical, radius / Math.max(aspect, MIN_ASPECT)) * FRAME_MARGIN
}

function rimPoints(framing: CameraFraming): Scene3DRimPoint[] {
	const { radius, halfHeight: range } = framing
	const [sin, cos] = [Math.sin(polarOf(framing)), Math.cos(polarOf(framing))]
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

function spread(point: Scene3DRimPoint, aspect: number): number {
	return Math.max(point.up, point.sideways / Math.max(aspect, MIN_ASPECT))
}

function perspectiveDistance(framing: CameraFraming, aspect: number, fov: number): number {
	const slope = Math.tan(MathUtils.degToRad(fov / 2))
	return Math.max(...rimPoints(framing).map(point => point.toward + (spread(point, aspect) * FRAME_MARGIN) / slope))
}

function perspectiveFov(framing: CameraFraming, distance: number, aspect: number): number {
	const slope = Math.max(...rimPoints(framing).map(point => spread(point, aspect) / (distance - point.toward)))
	return MathUtils.clamp(MathUtils.radToDeg(2 * Math.atan(slope * FRAME_MARGIN)), MIN_FOV, MAX_FOV)
}

export function baseDistance(camera: Scene3DViewCamera, framing: CameraFraming): number {
	if (camera instanceof OrthographicCamera) return Math.hypot(framing.radius, framing.halfHeight) * ORTHO_DISTANCE
	return Math.max(perspectiveDistance(framing, REFERENCE_ASPECT, PERSPECTIVE_FOV), perspectiveDistance(framing, camera.aspect, MAX_FOV))
}

function fitPerspective(camera: PerspectiveCamera, aspect: number, framing: CameraFraming): void {
	camera.aspect = aspect
	const distance = baseDistance(camera, framing)
	camera.fov = perspectiveFov(framing, distance, aspect)
	camera.near = distance * PERSPECTIVE_NEAR
	camera.far = distance * PERSPECTIVE_FAR
}

function fitOrthographic(camera: OrthographicCamera, aspect: number, framing: CameraFraming): void {
	const half = frameHalf(framing, aspect)
	const distance = baseDistance(camera, framing)
	const reach = Math.hypot(framing.radius, framing.halfHeight) * ORTHO_DEPTH
	Object.assign(camera, { left: -half * aspect, right: half * aspect, top: half, bottom: -half })
	camera.near = Math.max(distance - reach, distance * PERSPECTIVE_NEAR)
	camera.far = distance + reach
}

export function fitViewCamera(camera: Scene3DViewCamera, size: Scene3DScreenSize, framing: CameraFraming): void {
	const aspect = size.width / Math.max(size.height, 1)
	if (camera instanceof PerspectiveCamera) fitPerspective(camera, aspect, framing)
	else fitOrthographic(camera, aspect, framing)
	camera.updateProjectionMatrix()
}

export function panBounds(frame: Scene3DPanFrame): Box3 {
	return frame.bounds.clone().expandByScalar(frame.radius * PAN_MARGIN)
}

export function limitTarget(target: Vector3, frame: Scene3DPanFrame): Vector3 {
	const { min, max } = panBounds(frame)
	return target.clone().clamp(min, max)
}

export function clampPose(pose: Scene3DCameraPose, frame?: Scene3DPanFrame): Scene3DCameraPose {
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

export function defaultPose(center: Vector3, elevation: number = MAP_ELEVATION): Scene3DCameraPose {
	return [center.x, center.y, center.z, ISO_AZIMUTH, MathUtils.degToRad(90 - elevation), 1]
}

export function readPose(camera: Scene3DViewCamera, target: Vector3, distance: number): Scene3DCameraPose {
	const spherical = new Spherical().setFromVector3(camera.position.clone().sub(target))
	const zoom = camera instanceof OrthographicCamera ? camera.zoom : distance / Math.max(spherical.radius, NEAR)
	return [target.x, target.y, target.z, spherical.theta, spherical.phi, zoom]
}

export function applyPose(camera: Scene3DViewCamera, pose: Scene3DCameraPose, distance: number): Vector3 {
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

export function visibleHalf(camera: Scene3DViewCamera, distance: number): { half: number; aspect: number } {
	if (camera instanceof OrthographicCamera) return { half: camera.top, aspect: camera.right / camera.top }
	return { half: distance * Math.tan(MathUtils.degToRad(camera.fov / 2)), aspect: camera.aspect }
}

export function objectPose(box: Box3, pose: Scene3DCameraPose, view: { half: number; aspect: number }): Scene3DCameraPose {
	const center = box.getCenter(new Vector3())
	const size = box.getSize(new Vector3())
	const footprint = Math.max(Math.hypot(size.x, size.z), 1)
	const visible = 2 * Math.min(view.half, view.half * view.aspect)
	return clampPose([center.x, center.y, center.z, pose[3], pose[4], visible / (OBJECT_SHARE * footprint)])
}

export function easeInOutCubic(progress: number): number {
	return progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2
}
