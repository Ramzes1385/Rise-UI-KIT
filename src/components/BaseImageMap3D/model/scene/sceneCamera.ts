import { OrthographicCamera, Vector3 } from 'three'
import type { ImageMap3DData } from '../../types/imageMap3dData.types'

const ISO_ROTATION = Math.PI / 4
const ISO_TILT = (35 * Math.PI) / 180
const DISTANCE_FACTOR = 2
const DEFAULT_EXTENT = 1000

export function sceneExtent(data: ImageMap3DData): number {
	const sizes = data.layers.flatMap(layer => [layer.width, layer.height]).filter(size => Number.isFinite(size) && size > 0)
	return sizes.length ? Math.max(...sizes) : DEFAULT_EXTENT
}

export function sceneCenter(data: ImageMap3DData): Vector3 {
	const layer = data.layers[0]
	return layer ? new Vector3(layer.width / 2, 0, layer.height / 2) : new Vector3()
}

export function createCamera(): OrthographicCamera {
	return new OrthographicCamera(-1, 1, 1, -1, 0.1, 1_000_000)
}

export function placeCamera(camera: OrthographicCamera, data: ImageMap3DData): void {
	const target = sceneCenter(data)
	const distance = sceneExtent(data) * DISTANCE_FACTOR
	const horizontal = Math.cos(ISO_TILT) * distance
	camera.position.set(
		target.x + Math.sin(ISO_ROTATION) * horizontal,
		target.y + Math.sin(ISO_TILT) * distance,
		target.z + Math.cos(ISO_ROTATION) * horizontal,
	)
	camera.lookAt(target)
}

export function fitCamera(camera: OrthographicCamera, size: { width: number; height: number }, extent: number): void {
	const aspect = size.width / Math.max(size.height, 1)
	const half = extent / 2
	camera.left = -half * aspect
	camera.right = half * aspect
	camera.top = half
	camera.bottom = -half
	camera.updateProjectionMatrix()
}
