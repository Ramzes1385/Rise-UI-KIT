import { Box3, Vector3 } from 'three'
import type { CameraFraming } from '@/scene3d/types/internal/scene3dInternal.types'
import type { ImageMap3DData, ImageMap3DLayer } from '../../types/imageMap3dData.types'
import { layerElevation, objectLayerId, objectTop, sceneSettings } from '../scene/sceneLayout'
import type { Scene3DScreenSize, Scene3DViewCamera } from '@/scene3d/types/internal/scene3dInternal.types'
import type { SceneFrame, SceneFraming, SceneSettings } from '../../types/internal/imageMap3dInternal.types'
import {
	baseDistance as coreBaseDistance,
	fitViewCamera as coreFitViewCamera,
	frameHalf as coreFrameHalf,
	MAP_ELEVATION,
} from '@/scene3d/camera/cameraPose'

const isSize = (value: number): boolean => Number.isFinite(value) && value > 0

function bodyHeight(data: ImageMap3DData, layer: ImageMap3DLayer, settings: SceneSettings): number {
	return data.objects.reduce((height, object) => {
		const isBody = object.type !== 'point' && objectLayerId(object, data) === layer.id
		return isBody ? Math.max(height, objectTop(object, settings)) : height
	}, 0)
}

function modelHeight(models: readonly Box3[]): number {
	return models.reduce((height, box) => Math.max(height, box.isEmpty() ? 0 : box.max.y - box.min.y), 0)
}

export function sceneFrame(data: ImageMap3DData, models: readonly Box3[] = []): SceneFrame {
	const settings = sceneSettings(data)
	const bounds = new Box3()
	let floorHalf = Math.max(settings.floorThickness, modelHeight(models))
	data.layers.forEach((layer, index) => {
		const elevation = layerElevation(layer, index, settings)
		const body = bodyHeight(data, layer, settings)
		floorHalf = Math.max(floorHalf, body)
		bounds.expandByPoint(new Vector3(0, elevation - settings.floorThickness, 0))
		bounds.expandByPoint(new Vector3(isSize(layer.width) ? layer.width : 0, elevation + body, isSize(layer.height) ? layer.height : 0))
	})
	models.forEach(box => bounds.union(box))
	if (bounds.isEmpty()) bounds.set(new Vector3(), new Vector3(settings.extent, 0, settings.extent))
	const size = bounds.getSize(new Vector3())
	return { bounds, radius: Math.hypot(size.x, size.z) / 2, stackHalf: size.y / 2, floorHalf }
}

export function toCameraFraming({ frame, mode }: SceneFraming): CameraFraming {
	return {
		bounds: frame.bounds,
		radius: frame.radius,
		halfHeight: mode === 'single' ? frame.floorHalf : frame.stackHalf,
		elevation: MAP_ELEVATION,
	}
}

export function frameHalf(framing: SceneFraming, aspect: number): number {
	return coreFrameHalf(toCameraFraming(framing), aspect)
}

export function baseDistance(camera: Scene3DViewCamera, framing: SceneFraming): number {
	return coreBaseDistance(camera, toCameraFraming(framing))
}

export function fitViewCamera(camera: Scene3DViewCamera, size: Scene3DScreenSize, framing: SceneFraming): void {
	coreFitViewCamera(camera, size, toCameraFraming(framing))
}
