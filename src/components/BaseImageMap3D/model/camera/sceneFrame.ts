import { Box3, Vector3 } from 'three'
import type { ImageMap3DData, ImageMap3DLayer } from '../../types/imageMap3dData.types'
import type { SceneFrame, SceneSettings } from '../../types/internal/imageMap3dInternal.types'
import { layerElevation, objectLayerId, objectTop, sceneSettings } from '../scene/sceneLayout'

const isSize = (value: number): boolean => Number.isFinite(value) && value > 0

function bodyHeight(data: ImageMap3DData, layer: ImageMap3DLayer, settings: SceneSettings): number {
	return data.objects.reduce((height, object) => {
		const isBody = object.type !== 'point' && objectLayerId(object, data) === layer.id
		return isBody ? Math.max(height, objectTop(object, settings)) : height
	}, 0)
}

export function sceneFrame(data: ImageMap3DData): SceneFrame {
	const settings = sceneSettings(data)
	const bounds = new Box3()
	let floorHalf = settings.floorThickness
	data.layers.forEach((layer, index) => {
		const elevation = layerElevation(layer, index, settings)
		const body = bodyHeight(data, layer, settings)
		floorHalf = Math.max(floorHalf, body)
		bounds.expandByPoint(new Vector3(0, elevation - settings.floorThickness, 0))
		bounds.expandByPoint(new Vector3(isSize(layer.width) ? layer.width : 0, elevation + body, isSize(layer.height) ? layer.height : 0))
	})
	if (bounds.isEmpty()) bounds.set(new Vector3(), new Vector3(settings.extent, 0, settings.extent))
	const size = bounds.getSize(new Vector3())
	return { bounds, radius: Math.hypot(size.x, size.z) / 2, stackHalf: size.y / 2, floorHalf }
}
