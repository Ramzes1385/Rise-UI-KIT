/** Утилиты: модель `layers` — три плитки, сложенные стопкой (фигура пьедестала «слои архитектуры»); анимация `pulse` — стопка раздвигается и собирается */

import { Vector3 } from 'three'
import { createKit, pulseWindow } from '../parts'
import type { Model3DContext, Model3DNode } from '../../../types/model3d.types'

const TILES = ['accent', 'detail', 'body'] as const

/** `layers`: плитки `accent`, `detail`, `body` снизу вверх с небольшим поворотом, сверху метка `accent`; `pulse` — плитки расходятся по высоте */
export function buildLayers(_node: Model3DNode, context: Model3DContext) {
	const kit = createKit('layers', context)
	const tile = kit.slab('tile', [0.74, 0.74, 0.14], { radius: 0.14, bevel: 0.03 })
	const tiles = TILES.map((part, index) =>
		kit.mesh(tile, part, { x: index * 0.05, y: 0.14 + index * 0.2 - 0.07, z: -index * 0.05, ry: index * 0.12 }),
	)
	const dot = kit.mesh(kit.sphere('dot', 0.08, 12), 'accent', { x: 0.12, y: 0.62, z: -0.12 })
	const pulse = (progress: number): void => {
		const spread = pulseWindow(progress, [0, 0.3, 0.6, 0.9])
		tiles.forEach((mesh, index) => (mesh.position.y = 0.07 + index * 0.2 + index * 0.1 * spread))
		dot.position.y = 0.62 + 0.3 * spread
	}
	pulse(0)
	return kit.finish({ anchor: new Vector3(0, 0.9, 0), animations: { pulse } })
}
