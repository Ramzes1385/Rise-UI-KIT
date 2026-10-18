import { Raycaster } from 'three'
import type { Camera, Intersection, Object3D, Vector2 } from 'three'

/** Поле `userData` меша или группы: id узла, которому они принадлежат */
export const PICK_ID_KEY = 'sceneId'
/** Поле `userData` InstancedMesh: id узлов по номеру экземпляра */
export const PICK_INSTANCE_IDS_KEY = 'sceneInstanceIds'
/** Поле `userData` BatchedMesh: id узлов по номеру части */
export const PICK_BATCH_IDS_KEY = 'sceneBatchIds'

function ownId(object: Object3D | null): string | null {
	for (let node = object; node; node = node.parent) {
		const id = node.userData[PICK_ID_KEY]
		if (typeof id === 'string') return id
	}
	return null
}

function listedId(object: Object3D, key: string, index: number): string | null {
	const ids = object.userData[key] as readonly string[] | undefined
	return ids?.[index] ?? null
}

/** Id узла по попаданию луча: `instanceId` экземпляра, `batchId` части, иначе id ближайшего владельца вверх по дереву */
export function hitNodeId(hit: Intersection): string | null {
	if (hit.instanceId !== undefined) return listedId(hit.object, PICK_INSTANCE_IDS_KEY, hit.instanceId)
	if (hit.batchId !== undefined) return listedId(hit.object, PICK_BATCH_IDS_KEY, hit.batchId)
	return ownId(hit.object)
}

/** Луч из точки экрана (NDC) в сцену: id первого видимого узла или `null` */
export function pickNodeId(root: Object3D, view: { camera: Camera; ndc: Vector2 }, raycaster: Raycaster = new Raycaster()): string | null {
	raycaster.setFromCamera(view.ndc, view.camera)
	for (const hit of raycaster.intersectObject(root, true)) {
		const id = hit.object.visible ? hitNodeId(hit) : null
		if (id) return id
	}
	return null
}
