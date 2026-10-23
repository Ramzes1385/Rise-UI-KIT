/** Утилиты: модель `bank` — полупрозрачное здание банка с колоннами (внешняя система) */

import { createKit } from '../parts'
import { Shape, Vector3 } from 'three'
import type { Model3DContext, Model3DNode } from '../../../types/model3d.types'

const COLUMNS = [-0.6, -0.2, 0.2, 0.6]

function pedimentShape(): Shape {
	const shape = new Shape()
	shape.moveTo(-0.92, 0)
	shape.lineTo(0.92, 0)
	shape.lineTo(0, 0.46)
	shape.closePath()
	return shape
}

/** `bank`: плита, четыре колонны, задняя стена, антаблемент и фронтон; здание стеклянное (`glass`), капители и пояс — `accent` (анимация — общая `pulse`) */
export function buildBank(_node: Model3DNode, context: Model3DContext) {
	const kit = createKit('bank', context)
	kit.mesh(kit.slab('base', [1.75, 1.3, 0.13], { radius: 0.08, bevel: 0.02 }), 'glass')
	const column = kit.cylinder('column', [0.075, 0.085, 0.72], 16)
	const cap = kit.box('cap', [0.2, 0.05, 0.2])
	COLUMNS.forEach(x => {
		kit.mesh(column, 'glass', { x, y: 0.49, z: 0.42 })
		kit.mesh(cap, 'accent', { x, y: 0.875, z: 0.42 })
	})
	kit.mesh(kit.box('wall', [1.5, 0.72, 0.08]), 'glass', { y: 0.49, z: -0.42 })
	kit.mesh(kit.slab('arch', [1.8, 1.32, 0.12], { radius: 0.06, bevel: 0.02 }), 'glass', { y: 0.85 })
	// фронтон: треугольник выдавлен вверх, затем повёрнут на 90° вокруг X и сдвинут на полглубины назад
	kit.mesh(kit.extrude('pediment', pedimentShape(), { height: 1.28, bevel: 0 }), 'accent', { y: 0.97, z: -0.64, rx: Math.PI / 2 })
	return kit.finish({ anchor: new Vector3(0, 1.44, 0) })
}
