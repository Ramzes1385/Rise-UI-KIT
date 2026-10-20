/** Утилиты: плоская фигура, выдавленная по глубине и поставленная лицом к зрителю, — для моделей с вертикальными панелями, шестернёй, плавниками */

import type { Mesh, Shape } from 'three'
import type { Model3DPart } from '../../types/model3d.types'
import type { KitPlacement, ModelKit } from '../../types/internal/model3dRuntime.types'

/** Контур в плоскости XY, выдавленный вдоль Z на `depth` и отцентрованный по Z, лицо — в +Z; повороты задаёт группа-родитель */
export function upright(
	kit: ModelKit,
	shape: Shape,
	spec: Pick<KitPlacement, 'x' | 'y' | 'z' | 'parent'> & { name: string; depth: number; part: Model3DPart; bevel?: number },
): Mesh {
	const { name, depth, part, bevel = 0, ...placement } = spec
	const geometry = kit.extrude(name, shape, { height: depth, bevel })
	return kit.mesh(geometry, part, { ...placement, z: (placement.z ?? 0) - depth / 2, rx: Math.PI / 2 })
}
