import { Mesh } from 'three'
import { findModelNode } from './layerModel'
import type { Material, Object3D } from 'three'
import { disposeMaterial } from '../disposeObject'
import { objectParts } from '../geometry/objectShapes'
import { objectColors, addShapeObject } from '../buildScene'
import { objectLayerId, objectMeshName } from '../sceneLayout'
import type { ImageMap3DObject } from '../../../types/imageMap3dData.types'
import { adoptModelNode, hasTakenMesh, paintObject } from '../materials/sceneObjects'
import type { ModelAttachResult, SceneColorResolver, SceneContent, SceneModelItem } from '../../../types/internal/imageMap3dInternal.types'

function meshMaterials(root: Object3D): Set<Material> {
	const materials = new Set<Material>()
	root.traverse(node => {
		if (!(node instanceof Mesh)) return
		;[node.material].flat().forEach((material: Material) => materials.add(material))
	})
	return materials
}

function shareLayerMaterials(materials: Set<Material>): Material[] {
	return [...materials].map(material => {
		material.transparent = true
		material.userData.baseOpacity = material.opacity
		return material
	})
}

function byOwnNameFirst(objects: ImageMap3DObject[]): ImageMap3DObject[] {
	const isOwn = (object: ImageMap3DObject) => objectMeshName(object) === object.id
	return [...objects.filter(isOwn), ...objects.filter(object => !isOwn(object))]
}

function adoptObjects(content: SceneContent, item: SceneModelItem, resolve: SceneColorResolver): ModelAttachResult {
	const { data, layerId, root } = item
	const source = data.layers.find(entry => entry.id === layerId)
	const layer = content.layers.get(layerId)
	const result: ModelAttachResult = { missing: [], shared: [] }
	if (!layer || !source) return result
	const objects = data.objects.filter(
		object => object.type !== 'point' && objectLayerId(object, data) === layerId && !content.objects.has(object.id),
	)
	byOwnNameFirst(objects).forEach(object => {
		const colors = objectColors(object, data, resolve)
		const node = findModelNode(root, objectMeshName(object))
		if (node && hasTakenMesh(node)) result.shared.push(object.id)
		const entry = node ? adoptModelNode({ id: object.id, layerId }, node, colors) : null
		if (!entry?.meshes.length) {
			entry?.material.dispose()
			if (!node) result.missing.push(object.id)
			addShapeObject(content, { object, layerId, colors }, objectParts(object, source, content.settings))
			return
		}
		content.objects.set(object.id, entry)
		paintObject(entry, layer.opacity)
	})
	return result
}

export function attachModel(content: SceneContent, item: SceneModelItem, resolve: SceneColorResolver): ModelAttachResult {
	const layer = content.layers.get(item.layerId)
	if (!layer) return { missing: [], shared: [] }
	const original = meshMaterials(item.root)
	layer.group.add(item.root)
	const result = adoptObjects(content, item, resolve)
	const used = meshMaterials(item.root)
	original.forEach(material => {
		if (!used.has(material)) disposeMaterial(material)
	})
	const objectMaterials = new Set<Material>([...content.objects.values()].map(entry => entry.material))
	layer.modelMaterials = shareLayerMaterials(new Set([...used].filter(material => !objectMaterials.has(material))))
	return result
}
