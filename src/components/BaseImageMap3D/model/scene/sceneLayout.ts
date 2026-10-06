import { sceneExtent } from './sceneCamera'
import type { SceneSettings } from '../../types/internal/imageMap3dInternal.types'
import type { ImageMap3DData, ImageMap3DLayer, ImageMap3DObject } from '../../types/imageMap3dData.types'

const FLOOR_GAP_RATIO = 0.25
const OBJECT_HEIGHT_RATIO = 0.03
const FLOOR_THICKNESS = 4

function pickNumber(value: unknown, isValid: (value: number) => boolean, fallback: number): number {
	return typeof value === 'number' && Number.isFinite(value) && isValid(value) ? value : fallback
}

export function sceneSettings(data: ImageMap3DData): SceneSettings {
	const extent = sceneExtent(data)
	const scene3d: Partial<Record<keyof SceneSettings, unknown>> =
		typeof data.scene3d === 'object' && data.scene3d !== null ? data.scene3d : {}
	return {
		extent,
		floorGap: pickNumber(scene3d.floorGap, value => value >= 0, extent * FLOOR_GAP_RATIO),
		floorThickness: pickNumber(scene3d.floorThickness, value => value > 0, FLOOR_THICKNESS),
		objectHeight: pickNumber(scene3d.objectHeight, value => value >= 0, extent * OBJECT_HEIGHT_RATIO),
	}
}

export function layerElevation(layer: ImageMap3DLayer, index: number, settings: SceneSettings): number {
	return pickNumber(layer.elevation, () => true, index * settings.floorGap)
}

export function objectHeight(object: ImageMap3DObject, settings: SceneSettings): number {
	return pickNumber(object.height3d, value => value >= 0, settings.objectHeight)
}

export function objectLayerId(object: ImageMap3DObject, data: ImageMap3DData): string | undefined {
	return object.layer ?? data.layers[0]?.id
}

export function objectMeshName(object: ImageMap3DObject): string {
	const name = typeof object.meshName === 'string' ? object.meshName.trim() : ''
	return name || object.id
}
