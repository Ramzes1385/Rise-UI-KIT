/** Утилиты: модель `shield` — щит с накладкой и галочкой (фигура пьедестала «безопасность») */

import { createKit } from '../parts'
import { upright } from '../upright'
import { Shape, Vector3 } from 'three'
import type { Model3DContext, Model3DNode } from '../../../types/model3d.types'

function shieldShape(scale: number): Shape {
	const half = 0.4 * scale
	const shape = new Shape()
	shape.moveTo(-half, 0.9 * scale)
	shape.lineTo(half, 0.9 * scale)
	shape.lineTo(half, 0.5 * scale)
	shape.quadraticCurveTo(half, 0.15 * scale, 0, 0.02 * scale)
	shape.quadraticCurveTo(-half, 0.15 * scale, -half, 0.5 * scale)
	shape.lineTo(-half, 0.9 * scale)
	return shape
}

/** `shield`: щит `accent`, накладка `body` и галочка из двух брусков `accent`; стоит на невысоком основании `detail` */
export function buildShield(_node: Model3DNode, context: Model3DContext) {
	const kit = createKit('shield', context)
	kit.mesh(kit.cylinder('base', [0.3, 0.34, 0.05]), 'detail', { y: 0.025 })
	const shield = kit.group('shield', { y: 0.1, ry: 0.25 })
	upright(kit, shieldShape(1), { name: 'shield', depth: 0.12, bevel: 0.03, part: 'accent', parent: shield })
	upright(kit, shieldShape(0.78), { name: 'plate', depth: 0.04, part: 'body', parent: shield, y: 0.1, z: 0.07 })
	kit.mesh(kit.box('check-short', [0.14, 0.05, 0.03]), 'accent', { parent: shield, x: -0.1, y: 0.44, z: 0.11, rz: -0.8 })
	kit.mesh(kit.box('check-long', [0.3, 0.05, 0.03]), 'accent', { parent: shield, x: 0.06, y: 0.5, z: 0.11, rz: 0.8 })
	return kit.finish({ anchor: new Vector3(0, 1.0, 0) })
}
