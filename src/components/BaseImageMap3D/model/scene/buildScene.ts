import { createFloor } from './geometry/floor'
import { objectShapes } from './geometry/objectShapes'
import { extrudeShapes } from './geometry/extrudeShapes'
import { AmbientLight, DirectionalLight, Group } from 'three'
import type { Mesh, MeshStandardMaterial, Shape } from 'three'
import { createShapeEntry, paintObject } from './materials/sceneObjects'
import { resolveObject } from '@components/BaseImageMap/model/data/resolveObject'
import { FLOOR_COLOR, FLOOR_SIDE_COLOR, stateColors } from './materials/sceneColors'
import type { ImageMapData } from '@components/BaseImageMap/types/imageMapData.types'
import { layerElevation, objectHeight, objectLayerId, sceneSettings } from './sceneLayout'
import type { ImageMap3DData, ImageMap3DLayer, ImageMap3DObject } from '../../types/imageMap3dData.types'
import type {
	SceneColorResolver,
	SceneContent,
	SceneLayerEntry,
	SceneObjectEntry,
	SceneObjectState,
	SceneShapeItem,
	SceneStateColor,
} from '../../types/internal/imageMap3dInternal.types'

const AMBIENT_INTENSITY = 1.4
const SUN_INTENSITY = 1.6
const SHAPE_TYPES = new Set(['rect', 'ellipse', 'polygon'])

export function objectColors(
	object: ImageMap3DObject,
	data: ImageMap3DData,
	resolve: SceneColorResolver,
): Record<SceneObjectState, SceneStateColor> {
	return stateColors(resolveObject(object, data as ImageMapData, 'none').style, resolve)
}

function createLights(extent: number): Group {
	const lights = new Group()
	lights.name = 'rise-lights'
	const sun = new DirectionalLight(0xffffff, SUN_INTENSITY)
	sun.position.set(extent * 0.6, extent * 1.5, extent)
	lights.add(new AmbientLight(0xffffff, AMBIENT_INTENSITY), sun)
	return lights
}

export function fadeFloor(entry: SceneLayerEntry): void {
	entry.floorMaterials.forEach(material => {
		material.opacity = entry.opacity
		material.transparent = entry.opacity < 1
		material.depthWrite = entry.opacity >= 1
		material.needsUpdate = true
	})
	entry.modelMaterials.forEach(material => {
		material.opacity = Number(material.userData.baseOpacity ?? 1) * entry.opacity
		material.depthWrite = material.opacity >= 1
	})
}

export function paintFloor(entry: SceneLayerEntry, resolve: SceneColorResolver): void {
	const [slab, top] = entry.floorMaterials
	if (!slab || !top) return
	slab.color.copy(resolve(FLOOR_SIDE_COLOR))
	if (!top.userData.hasMap) top.color.copy(resolve(FLOOR_COLOR))
	fadeFloor(entry)
}

function createLayerEntry(layer: ImageMap3DLayer, index: number, content: SceneContent): SceneLayerEntry {
	const group = new Group()
	group.name = layer.id
	group.userData.layerId = layer.id
	const elevation = layerElevation(layer, index, content.settings)
	group.position.y = elevation
	const entry: SceneLayerEntry = { id: layer.id, group, elevation, floorMaterials: [], modelMaterials: [], opacity: 1 }
	if (!layer.model) {
		const { floor, slab, top } = createFloor(layer, content.settings.floorThickness)
		group.add(floor)
		entry.floorMaterials = [slab, top].map(mesh => (mesh as Mesh<never, MeshStandardMaterial>).material)
	}
	content.root.add(group)
	return entry
}

export function addShapeObject(content: SceneContent, item: SceneShapeItem, shapes: Shape[]): SceneObjectEntry | null {
	const layer = content.layers.get(item.layerId)
	const geometry = extrudeShapes(shapes, objectHeight(item.object, content.settings))
	if (!layer || !geometry) return null
	const entry = createShapeEntry({ id: item.object.id, layerId: layer.id }, geometry, item.colors)
	layer.group.add(...entry.meshes)
	content.objects.set(item.object.id, entry)
	paintObject(entry, layer.opacity)
	return entry
}

export function buildSceneContent(data: ImageMap3DData, resolve: SceneColorResolver): SceneContent {
	const settings = sceneSettings(data)
	const root = new Group()
	root.name = 'rise-map-content'
	root.add(createLights(settings.extent))
	const content: SceneContent = { root, settings, layers: new Map(), objects: new Map() }
	data.layers.forEach((layer, index) => {
		const entry = createLayerEntry(layer, index, content)
		paintFloor(entry, resolve)
		content.layers.set(layer.id, entry)
	})
	const layersById = new Map(data.layers.map(layer => [layer.id, layer]))
	data.objects.forEach(object => {
		const layer = layersById.get(objectLayerId(object, data) ?? '')
		if (!layer || layer.model || !SHAPE_TYPES.has(object.type)) return
		addShapeObject(content, { object, layerId: layer.id, colors: objectColors(object, data, resolve) }, objectShapes(object, layer))
	})
	return content
}
