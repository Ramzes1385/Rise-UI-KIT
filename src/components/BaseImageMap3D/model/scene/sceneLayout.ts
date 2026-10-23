import type { ScenePartSpec, SceneSettings } from '../../types/internal/imageMap3dInternal.types'
import type { ImageMap3DData, ImageMap3DLayer, ImageMap3DObject } from '../../types/imageMap3dData.types'

const DEFAULT_EXTENT = 1000
const FLOOR_GAP_RATIO = 0.25
const OBJECT_HEIGHT_RATIO = 0.03
const FLOOR_THICKNESS = 4
const BEVEL_RATIO = 0.002

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)

export function sceneExtent(data: ImageMap3DData): number {
	const sizes = data.layers.flatMap(layer => [layer.width, layer.height]).filter(size => Number.isFinite(size) && size > 0)
	return sizes.length ? Math.max(...sizes) : DEFAULT_EXTENT
}

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
		bevel: pickNumber(scene3d.bevel, value => value >= 0, extent * BEVEL_RATIO),
		outline: typeof scene3d.outline === 'boolean' ? scene3d.outline : true,
		modelOutline: scene3d.outline === true,
	}
}

export function layerElevation(layer: ImageMap3DLayer, index: number, settings: SceneSettings): number {
	return pickNumber(layer.elevation, () => true, index * settings.floorGap)
}

export function objectHeight(object: ImageMap3DObject, settings: SceneSettings): number {
	return pickNumber(object.height3d, value => value >= 0, settings.objectHeight)
}

export function svgPartSpecs(object: ImageMap3DObject, settings: SceneSettings): ScenePartSpec[] {
	const parts: unknown = object.parts
	if (!Array.isArray(parts)) return []
	const height = objectHeight(object, settings)
	return parts
		.filter(isRecord)
		.filter(part => typeof part.elementId === 'string' && part.elementId.trim() !== '')
		.map(part => ({
			elementId: String(part.elementId),
			height: pickNumber(part.height3d, value => value >= 0, height),
			base: pickNumber(part.base3d, value => value >= 0, 0),
		}))
}

export function objectTop(object: ImageMap3DObject, settings: SceneSettings): number {
	const specs = object.type === 'svg' ? svgPartSpecs(object, settings) : []
	return specs.length ? Math.max(...specs.map(spec => spec.base + spec.height)) : objectHeight(object, settings)
}

export function objectLayerId(object: ImageMap3DObject, data: ImageMap3DData): string | undefined {
	return object.layer ?? data.layers[0]?.id
}

export function objectMeshName(object: ImageMap3DObject): string {
	const name = typeof object.meshName === 'string' ? object.meshName.trim() : ''
	return name || object.id
}
