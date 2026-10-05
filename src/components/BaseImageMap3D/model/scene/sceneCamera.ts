import { Vector3 } from 'three'
import type { ImageMap3DData } from '../../types/imageMap3dData.types'

const DEFAULT_EXTENT = 1000

export function sceneExtent(data: ImageMap3DData): number {
	const sizes = data.layers.flatMap(layer => [layer.width, layer.height]).filter(size => Number.isFinite(size) && size > 0)
	return sizes.length ? Math.max(...sizes) : DEFAULT_EXTENT
}

export function sceneCenter(data: ImageMap3DData): Vector3 {
	const layer = data.layers[0]
	return layer ? new Vector3(layer.width / 2, 0, layer.height / 2) : new Vector3()
}
