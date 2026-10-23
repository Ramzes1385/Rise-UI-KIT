/** Утилиты: модель `phone` — телефон на круглой подставке с интерфейсом приложения (клиент) */

import { Vector3 } from 'three'
import { createKit } from '../parts'
import type { Model3DContext, Model3DNode } from '../../../types/model3d.types'

const ROWS = [0.2, -0.06, -0.32]

/** `phone`: подставка с кольцом, наклонённый корпус, экран с шапкой и тремя строками; динамик — `detail` (анимация — общая `pulse`) */
export function buildPhone(_node: Model3DNode, context: Model3DContext) {
	const kit = createKit('phone', context)
	kit.mesh(kit.cylinder('stand', [0.56, 0.6, 0.15]), 'body', { y: 0.075 })
	kit.mesh(kit.torus('ring', [0.58, 0.02]), 'accent', { y: 0.15, rx: Math.PI / 2 })
	const phone = kit.group('phone', { y: 0.79, rx: -0.12 })
	// стоящая плита: плита поворачивается на 90° вокруг X и сдвигается на полтолщины назад
	kit.mesh(kit.slab('body', [0.66, 1.24, 0.08], { radius: 0.12, bevel: 0.02 }), 'body', { z: -0.04, rx: Math.PI / 2, parent: phone })
	kit.mesh(kit.box('screen', [0.56, 1.06, 0.01]), 'screen', { z: 0.045, parent: phone })
	kit.mesh(kit.box('head', [0.56, 0.16, 0.01]), 'accent', { y: 0.45, z: 0.052, parent: phone })
	const row = kit.box('row', [0.46, 0.2, 0.01])
	ROWS.forEach(y => kit.mesh(row, 'body', { y, z: 0.052, parent: phone }))
	kit.mesh(kit.box('speaker', [0.16, 0.025, 0.01]), 'detail', { y: 0.575, z: 0.05, parent: phone })
	return kit.finish({ anchor: new Vector3(0, 1.42, 0) })
}
