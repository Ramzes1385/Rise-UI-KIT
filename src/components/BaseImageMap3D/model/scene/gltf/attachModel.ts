import { Mesh } from 'three'
import { findModelNode } from './layerModel'
import type { Material, Object3D } from 'three'
import { disposeMaterial } from '../disposeObject'
import { objectShapes } from '../geometry/objectShapes'
import { objectColors, addShapeObject } from '../buildScene'
import { objectLayerId, objectMeshName } from '../sceneLayout'
import { adoptModelNode, paintObject } from '../materials/sceneObjects'
import type { SceneColorResolver, SceneContent, SceneModelItem } from '../../../types/internal/imageMap3dInternal.types'

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

function adoptObjects(content: SceneContent, item: SceneModelItem, resolve: SceneColorResolver): string[] {
	const { data, layerId, root } = item
	const source = data.layers.find(entry => entry.id === layerId)
	const layer = content.layers.get(layerId)
	if (!layer || !source) return []
	const missing: string[] = []
	data.objects
		.filter(object => object.type !== 'point' && objectLayerId(object, data) === layerId && !content.objects.has(object.id))
		.forEach(object => {
			const colors = objectColors(object, data, resolve)
			const node = findModelNode(root, objectMeshName(object))
			if (!node) {
				missing.push(object.id)
				addShapeObject(content, { object, layerId, colors }, objectShapes(object, source))
				return
			}
			const entry = adoptModelNode({ id: object.id, layerId }, node, colors)
			content.objects.set(object.id, entry)
			paintObject(entry, layer.opacity)
		})
	return missing
}

export function attachModel(content: SceneContent, item: SceneModelItem, resolve: SceneColorResolver): string[] {
	const layer = content.layers.get(item.layerId)
	if (!layer) return []
	const original = meshMaterials(item.root)
	layer.group.add(item.root)
	const missing = adoptObjects(content, item, resolve)
	const used = meshMaterials(item.root)
	original.forEach(material => {
		if (!used.has(material)) disposeMaterial(material)
	})
	const objectMaterials = new Set<Material>([...content.objects.values()].map(entry => entry.material))
	layer.modelMaterials = shareLayerMaterials(new Set([...used].filter(material => !objectMaterials.has(material))))
	return missing
}
