import { Box3, Vector3 } from 'three'
import { ISO_ELEVATION } from '@/scene3d/camera/cameraPresets'
import type { Roadmap3DFrame } from '../../types/internal/roadmap3dInternal.types'
import type { IslandBounds, IslandPoint } from '../../types/roadmap3dIsland.types'
import type { CameraFraming } from '@/scene3d/types/internal/scene3dInternal.types'

export const SLAB = 0.5
export const STEP = 0.55
export const PEDESTAL = 0.6
const SKY = 3.2
const PIN_LIFT = 1.35

export function toWorld(point: IslandPoint, y = 0): Vector3 {
	return new Vector3(point.x, y, -point.z)
}

function worldBounds(bounds: IslandBounds): Box3 {
	return new Box3(new Vector3(bounds.minX, -SLAB - STEP * 3, -bounds.maxZ), new Vector3(bounds.maxX, SKY, -bounds.minZ))
}

export function roadmapFrame(bounds: IslandBounds): Roadmap3DFrame {
	const box = worldBounds(bounds)
	const size = box.getSize(new Vector3())
	return { bounds: box, radius: Math.max(Math.hypot(size.x, size.z) / 2, 1), halfHeight: size.y / 2 }
}

export function toFraming(frame: Roadmap3DFrame): CameraFraming {
	return { bounds: frame.bounds, radius: frame.radius, halfHeight: frame.halfHeight, elevation: ISO_ELEVATION }
}

export function frameCenter(frame: Roadmap3DFrame): Vector3 {
	const center = frame.bounds.getCenter(new Vector3())
	center.y = 0
	return center
}

export function pinPosition(point: IslandPoint): Vector3 {
	return toWorld(point, PEDESTAL + PIN_LIFT)
}
