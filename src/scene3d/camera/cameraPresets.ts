import { MathUtils } from 'three'
import type { Vector3 } from 'three'
import { QUARTER_TURN } from './cameraKeys'
import { CAMERA_LIMITS } from './cameraPose'
import type { Scene3DCameraPreset } from '../types/scene3d.types'
import type { Scene3DCameraKind, Scene3DCameraPose } from '../types/internal/scene3dInternal.types'

/** Возвышение истинной изометрии, градусы: atan(1/√2) ≈ 35,264 */
export const ISO_ELEVATION = MathUtils.radToDeg(Math.atan(1 / Math.SQRT2))

const ISO_AZIMUTH = Math.PI / 4
const QUARTERS: Record<string, number> = { iso: 0, 'iso-90': 1, 'iso-180': 2, 'iso-270': 3 }

/** Вид камеры, который требует пресет: перспектива — `perspective`, остальные — ортографическая изометрия */
export function presetCameraKind(preset: Scene3DCameraPreset): Scene3DCameraKind {
	return preset === 'perspective' ? 'perspective' : 'isometric'
}

/**
 * Положение камеры для пресета вокруг центра: `iso*` — изометрия с поворотом кратно 90°, `top` — вид сверху
 * (для перехода к 2D, азимут сохраняется), `perspective` — изометрический угол с текущим азимутом
 */
export function presetPose(preset: Scene3DCameraPreset, center: Vector3, azimuth: number = ISO_AZIMUTH): Scene3DCameraPose {
	const quarter = QUARTERS[preset]
	const polar = MathUtils.degToRad(90 - ISO_ELEVATION)
	if (quarter !== undefined) return [center.x, center.y, center.z, ISO_AZIMUTH + MathUtils.degToRad(QUARTER_TURN) * quarter, polar, 1]
	return [center.x, center.y, center.z, azimuth, preset === 'top' ? CAMERA_LIMITS.minPolar : polar, 1]
}

/** Ближайший пресет поворота (`iso`, `iso-90`, `iso-180`, `iso-270`) для азимута камеры */
export function nearestIsoPreset(azimuth: number): Scene3DCameraPreset {
	const steps = Math.round((azimuth - ISO_AZIMUTH) / MathUtils.degToRad(QUARTER_TURN))
	const quarter = ((steps % 4) + 4) % 4
	return (['iso', 'iso-90', 'iso-180', 'iso-270'] as const)[quarter]
}

/** Поворот на четверть оборота от текущего азимута (`direction` 1 — по часовой стрелке): к ближайшему углу изометрии */
export function quarterTurnPose(pose: Scene3DCameraPose, direction: 1 | -1): Scene3DCameraPose {
	const step = MathUtils.degToRad(QUARTER_TURN)
	const snapped = ISO_AZIMUTH + Math.round((pose[3] - ISO_AZIMUTH) / step) * step
	return [pose[0], pose[1], pose[2], snapped + direction * step, pose[4], pose[5]]
}
