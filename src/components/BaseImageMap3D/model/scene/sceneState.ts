import { objectLayerId } from './sceneLayout'
import { parseSvgPaths, svgElementShapes } from './geometry/svgShapes'
import { paintObject, setObjectState } from './materials/sceneObjects'
import type { ImageMap3DLayerMode } from '../../types/BaseImageMap3D.types'
import { addShapeObject, fadeFloor, objectColors, paintFloor } from './buildScene'
import type { ImageMap3DData, ImageMap3DObject } from '../../types/imageMap3dData.types'
import type { ImageMapSvgObject } from '@components/BaseImageMap/types/imageMapData.types'
import type { SceneColorResolver, SceneContent } from '../../types/internal/imageMap3dInternal.types'

export const INACTIVE_LAYER_OPACITY = 0.25

export function applyLayerMode(content: SceneContent, activeLayerId: string | undefined, mode: ImageMap3DLayerMode): void {
	content.layers.forEach(layer => {
		const isActive = layer.id === activeLayerId
		layer.group.visible = mode === 'stack' || isActive
		layer.group.userData.isActive = isActive
		layer.opacity = mode === 'stack' && !isActive ? INACTIVE_LAYER_OPACITY : 1
		fadeFloor(layer)
	})
	content.objects.forEach(entry => paintObject(entry, content.layers.get(entry.layerId)?.opacity ?? 1))
}

export function applyObjectStates(
	content: SceneContent,
	state: { hover: string | null; active: string | null; hidden: ReadonlySet<string> },
): void {
	content.objects.forEach(entry => {
		setObjectState(content, entry.id, 'base')
		entry.meshes.forEach(mesh => {
			mesh.visible = !state.hidden.has(entry.id)
		})
	})
	if (state.hover) setObjectState(content, state.hover, 'hover')
	if (state.active) setObjectState(content, state.active, 'active')
}

export function recolorScene(content: SceneContent, data: ImageMap3DData, resolve: SceneColorResolver): void {
	content.layers.forEach(layer => paintFloor(layer, resolve))
	const objects = new Map(data.objects.map(object => [object.id, object]))
	content.objects.forEach(entry => {
		const object = objects.get(entry.id)
		if (object) entry.colors = objectColors(object, data, resolve)
		paintObject(entry, content.layers.get(entry.layerId)?.opacity ?? 1)
	})
}

export function addSvgObjects(
	content: SceneContent,
	source: { data: ImageMap3DData; layerId: string; markup: string },
	resolve: SceneColorResolver,
): number {
	const { data, layerId, markup } = source
	const svgObjects = data.objects.filter(
		(object): object is ImageMap3DObject & ImageMapSvgObject =>
			object.type === 'svg' && objectLayerId(object, data) === layerId && !content.objects.has(object.id),
	)
	const layer = data.layers.find(entry => entry.id === layerId)
	const paths = svgObjects.length && layer ? parseSvgPaths(markup, layer) : []
	return svgObjects.filter(object => {
		const shapes = svgElementShapes(paths, object.elementId)
		return addShapeObject(content, { object, layerId, colors: objectColors(object, data, resolve) }, shapes)
	}).length
}
