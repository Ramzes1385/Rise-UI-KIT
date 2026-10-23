import { Vector3 } from 'three'
import type { Scene3DViewCamera } from '@/scene3d/types/internal/scene3dInternal.types'
import type { FlowMap3DQuality, FlowMap3DShadowMode } from '../../types/internal/flowMap3dMotion.types'

const SHADOW_NODE_LIMIT = 80
const DETAIL_MIN_PIXELS = 18

export function shadowModeOf(quality: FlowMap3DQuality, count: number): FlowMap3DShadowMode {
	if (quality === 'high') return 'map'
	if (quality === 'low') return 'none'
	return count <= SHADOW_NODE_LIMIT ? 'map' : 'blob'
}

export function cellPixels(
	camera: Scene3DViewCamera,
	size: { width: number; height: number },
	parts: { at: Vector3; cell: number },
): number {
	camera.updateMatrixWorld()
	const right = new Vector3().setFromMatrixColumn(camera.matrixWorld, 0)
	const [from, to] = [parts.at.clone().project(camera), parts.at.clone().addScaledVector(right, parts.cell).project(camera)]
	return (Math.abs(to.x - from.x) * size.width) / 2
}

export function isDetailShown(quality: FlowMap3DQuality, pixels: number): boolean {
	return quality !== 'low' && pixels >= DETAIL_MIN_PIXELS
}
