import type { Box3 } from 'three'
import type { ImageMap3DCamera } from '../../types/BaseImageMap3D.types'
import { MathUtils, OrthographicCamera, PerspectiveCamera, Spherical, Vector3 } from 'three'
import type { CameraPose, ImageMap3DViewCamera } from '../../types/internal/imageMap3dInternal.types'

export const CAMERA_LIMITS = {
	minPolar: MathUtils.degToRad(5),
	maxPolar: MathUtils.degToRad(75),
	minZoom: 0.5,
	maxZoom: 8,
}

const ISO_AZIMUTH = Math.PI / 4
const ISO_POLAR = MathUtils.degToRad(90 - 35)
const PERSPECTIVE_FOV = 35
const ORTHO_DISTANCE = 2
const PERSPECTIVE_MARGIN = 1.4
const OBJECT_SHARE = 3
const NEAR = 0.1
const FAR = 1_000_000

export function createViewCamera(kind: ImageMap3DCamera): ImageMap3DViewCamera {
	if (kind === 'perspective') return new PerspectiveCamera(PERSPECTIVE_FOV, 1, NEAR, FAR)
	return new OrthographicCamera(-1, 1, 1, -1, NEAR, FAR)
}

export function baseDistance(camera: ImageMap3DViewCamera, extent: number): number {
	if (camera instanceof OrthographicCamera) return extent * ORTHO_DISTANCE
	return (extent / 2 / Math.tan(MathUtils.degToRad(camera.fov / 2))) * PERSPECTIVE_MARGIN
}

export function fitViewCamera(camera: ImageMap3DViewCamera, size: { width: number; height: number }, extent: number): void {
	const aspect = size.width / Math.max(size.height, 1)
	if (camera instanceof PerspectiveCamera) camera.aspect = aspect
	else {
		const half = extent / 2
		camera.left = -half * aspect
		camera.right = half * aspect
		camera.top = half
		camera.bottom = -half
	}
	camera.updateProjectionMatrix()
}

export function clampPose(pose: CameraPose): CameraPose {
	const [x, y, z, azimuth, polar, zoom] = pose
	return [
		x,
		y,
		z,
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

export function objectPose(box: Box3, pose: CameraPose, extent: number): CameraPose {
	const center = box.getCenter(new Vector3())
	const size = box.getSize(new Vector3())
	const footprint = Math.max(size.x, size.z, 1)
	return clampPose([center.x, center.y, center.z, pose[3], pose[4], extent / (OBJECT_SHARE * footprint)])
}

export function easeInOutCubic(progress: number): number {
	return progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2
}
