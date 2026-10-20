/** Утилиты: контекст, который кит даёт фабрике модели (клетка, цвета, общие материалы и геометрии) */

import { hashString } from '../../geometry/seededRandom'
import type { Model3DContext } from '../../types/model3d.types'
import type { Model3DBuildTarget, Model3DScope } from '../../types/internal/model3dRuntime.types'

/** Контекст фабрики; `modelId` задаёт акцент модели (`--rise-scene3d-accent-<id>`) */
export function createModelContext(scope: Model3DScope, target: Model3DBuildTarget): Model3DContext {
	const { bank, options } = scope
	return {
		size: { ...options.cell },
		color: css => options.resolveColor(css).clone(),
		material: part => bank.role(part, target.modelId, target.materialKeys),
		geometry: (key, build) => bank.geometry(key, target.geometryKeys, build),
		seed: hashString(`${options.seed ?? 0}:${target.id}`),
		isReducedMotion: options.isReducedMotion?.() ?? false,
	}
}
