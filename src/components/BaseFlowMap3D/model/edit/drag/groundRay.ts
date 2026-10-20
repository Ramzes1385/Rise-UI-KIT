import { Plane, Raycaster, Vector3 } from 'three'
import { toNdc } from '@/scene3d/overlay/projection'
import type { Scene3DViewCamera } from '@/scene3d/types/internal/scene3dInternal.types'

const UP = new Vector3(0, 1, 0)

export function groundPoint(
	view: { camera: Scene3DViewCamera; rect: DOMRect },
	point: { x: number; y: number },
	y: number,
): { x: number; z: number } | null {
	const ndc = toNdc(point.x, point.y, view.rect)
	if (!ndc) return null
	const raycaster = new Raycaster()
	raycaster.setFromCamera(ndc, view.camera)
	const hit = raycaster.ray.intersectPlane(new Plane(UP, -y), new Vector3())
	return hit ? { x: hit.x, z: hit.z } : null
}
