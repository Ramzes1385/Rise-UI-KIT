import { Mesh, MeshStandardMaterial } from 'three'
import type { BufferGeometry, Object3D } from 'three'
import type { SceneContent, SceneObjectEntry, SceneObjectState, SceneStateColor } from '../../../types/internal/imageMap3dInternal.types'

const OBJECT_ROUGHNESS = 0.6

function createObjectMaterial(): MeshStandardMaterial {
	return new MeshStandardMaterial({ roughness: OBJECT_ROUGHNESS, metalness: 0, transparent: true })
}

export function createShapeEntry(
	ids: { id: string; layerId: string },
	geometry: BufferGeometry,
	colors: Record<SceneObjectState, SceneStateColor>,
): SceneObjectEntry {
	const material = createObjectMaterial()
	const mesh = new Mesh(geometry, material)
	mesh.name = ids.id
	mesh.userData.objectId = ids.id
	return { ...ids, material, meshes: [mesh], source: 'shape', colors, state: 'base' }
}

export function adoptModelNode(
	ids: { id: string; layerId: string },
	node: Object3D,
	colors: Record<SceneObjectState, SceneStateColor>,
): SceneObjectEntry {
	const material = createObjectMaterial()
	const meshes: Mesh[] = []
	node.traverse(child => {
		if (!(child instanceof Mesh)) return
		child.material = material
		child.userData.objectId = ids.id
		meshes.push(child)
	})
	return { ...ids, material, meshes, source: 'model', colors, state: 'base' }
}

export function paintObject(entry: SceneObjectEntry, layerOpacity: number): void {
	const { color, opacity } = entry.colors[entry.state]
	entry.material.color.copy(color)
	entry.material.opacity = opacity * layerOpacity
	entry.material.depthWrite = entry.material.opacity >= 1
}

export function setObjectState(content: SceneContent, id: string, state: SceneObjectState): void {
	const entry = content.objects.get(id)
	if (!entry || entry.state === state) return
	entry.state = state
	paintObject(entry, content.layers.get(entry.layerId)?.opacity ?? 1)
}
