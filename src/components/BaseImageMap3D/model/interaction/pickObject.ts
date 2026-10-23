import { Raycaster } from 'three'
import type { Object3D } from 'three'
import type { SceneContent, ScenePickQuery } from '../../types/internal/imageMap3dInternal.types'

const raycaster = new Raycaster()

function isPickable(object: Object3D): boolean {
	return object.visible && typeof object.userData.objectId === 'string'
}

export function pickObjectId(content: SceneContent, query: ScenePickQuery): string | null {
	const { layerId, camera, ndc } = query
	const layer = layerId ? content.layers.get(layerId) : undefined
	if (!layer?.group.visible) return null
	content.root.updateMatrixWorld(true)
	camera.updateMatrixWorld()
	raycaster.setFromCamera(ndc, camera)
	const hit = raycaster.intersectObjects(layer.group.children, true).find(entry => isPickable(entry.object))
	return hit ? String(hit.object.userData.objectId) : null
}
