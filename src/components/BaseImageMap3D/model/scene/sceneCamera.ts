import type { ImageMap3DData } from '../../types/imageMap3dData.types'

const DEFAULT_EXTENT = 1000

export function sceneExtent(data: ImageMap3DData): number {
	const sizes = data.layers.flatMap(layer => [layer.width, layer.height]).filter(size => Number.isFinite(size) && size > 0)
	return sizes.length ? Math.max(...sizes) : DEFAULT_EXTENT
}
