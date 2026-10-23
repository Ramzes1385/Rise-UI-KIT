/** Утилиты: модель `ram` — модуль памяти с чипами и молнией над ним (кеш) */

import { createKit } from '../parts'
import { Shape, Vector3 } from 'three'
import type { Model3DContext, Model3DNode } from '../../../types/model3d.types'

const SPAN = 0.9
const GROW = 0.4
const CHIPS = [-0.56, -0.28, 0, 0.28, 0.56]

function boltShape(): Shape {
	const shape = new Shape()
	shape.moveTo(0.06, 0.42)
	shape.lineTo(-0.2, 0)
	shape.lineTo(-0.02, 0)
	shape.lineTo(-0.1, -0.42)
	shape.lineTo(0.22, 0.07)
	shape.lineTo(0.04, 0.07)
	shape.lineTo(0.14, 0.42)
	shape.closePath()
	return shape
}

/** `ram`: плата с контактами, пять чипов, защёлки и молния над модулем; анимация `blink` — молния вспыхивает (растёт и возвращается) */
export function buildRam(_node: Model3DNode, context: Model3DContext) {
	const kit = createKit('ram', context)
	kit.mesh(kit.slab('base', [1.66, 0.3, 0.13], { radius: 0.05, bevel: 0.02 }), 'detail')
	;[-0.86, 0.86].forEach(x => kit.mesh(kit.box('latch', [0.07, 0.3, 0.2]), 'body', { x, y: 0.2 }))
	// стоящая плата: плита повёрнута на 90° вокруг X и сдвинута на полтолщины назад
	kit.mesh(kit.slab('board', [1.5, 0.68, 0.05], { radius: 0.04, bevel: 0.01 }), 'accent', { y: 0.46, z: -0.025, rx: Math.PI / 2 })
	kit.mesh(kit.box('fingers', [1.36, 0.1, 0.01]), 'light', { y: 0.2, z: 0.032, detail: true })
	const chip = kit.box('chip', [0.22, 0.3, 0.045])
	CHIPS.forEach(x => kit.mesh(chip, 'detail', { x, y: 0.52, z: 0.045 }))
	const bolt = kit.group('bolt', { y: 1.16 })
	const shape = kit.extrude('bolt', boltShape(), { height: 0.09, bevel: 0.02 })
	const flash = kit.mesh(shape, 'light', { z: -0.045, rx: Math.PI / 2, parent: bolt })
	flash.scale.setScalar(0.72)
	return kit.finish({
		anchor: new Vector3(0, 1.5, 0),
		animations: {
			blink: progress => {
				const time = progress * SPAN
				bolt.scale.setScalar(1 + GROW * (time < SPAN ? Math.sin((time / SPAN) * Math.PI) : 0))
			},
		},
	})
}
