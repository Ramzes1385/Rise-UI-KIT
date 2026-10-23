/** Утилиты: модель `cart` — тележка с коробками (заказы) */

import { createKit } from '../parts'
import { Shape, Vector3 } from 'three'
import type { Model3DContext, Model3DNode } from '../../../types/model3d.types'

const SPAN = 0.7
const HOP = 0.14
const HOP_TIME = 0.42
const STAGGER = 0.12
/** Коробки: x, y, z, ширина, высота, глубина, поворот */
const BOXES = [
	[-0.26, 0.8, -0.06, 0.42, 0.34, 0.42, 0.12],
	[0.24, 0.8, 0.08, 0.38, 0.28, 0.36, -0.28],
	[-0.04, 1.06, 0, 0.3, 0.22, 0.28, 0.5],
] as const

function basketShape(): Shape {
	const shape = new Shape()
	shape.moveTo(-0.5, 0.36)
	shape.lineTo(0.4, 0.36)
	shape.lineTo(0.68, 0.9)
	shape.lineTo(-0.6, 0.9)
	shape.closePath()
	return shape
}

/** `cart`: корзина-трапеция на раме с колёсами и ручкой, в ней три коробки; анимация `roll` — коробки по очереди подпрыгивают */
export function buildCart(_node: Model3DNode, context: Model3DContext) {
	const kit = createKit('cart', context)
	// стоящая трапеция: выдавленная вверх фигура повёрнута на 90° вокруг X и сдвинута на полглубины назад
	kit.mesh(kit.extrude('basket', basketShape(), { height: 0.74, bevel: 0.02 }), 'body', { z: -0.37, rx: Math.PI / 2 })
	kit.mesh(kit.box('inside', [1.18, 0.01, 0.66]), 'detail', { x: 0.04, y: 0.922, detail: true })
	const hops = BOXES.map(([x, y, z, width, height, depth, turn]) => {
		const crate = kit.group('crate', { x, y, z, ry: turn })
		kit.mesh(kit.box('crate', [width, height, depth]), 'metal', { y: height / 2, parent: crate })
		kit.mesh(kit.box('tape', [Math.min(0.09, width * 0.3), height * 0.6, depth + 0.006]), 'accent', { y: height * 0.7, parent: crate })
		return { crate, y }
	})
	const rail = kit.box('rail', [1, 0.05, 0.06])
	const post = kit.box('post', [0.05, 0.2, 0.05])
	const wheel = kit.cylinder('wheel', [0.085, 0.085, 0.06], 20)
	const brace = kit.box('brace', [0.24, 0.05, 0.05])
	;[-0.3, 0.3].forEach(z => {
		kit.mesh(rail, 'accent', { x: -0.04, y: 0.17, z })
		kit.mesh(post, 'accent', { x: -0.4, y: 0.27, z })
		kit.mesh(post, 'accent', { x: 0.32, y: 0.27, z })
		;[-0.46, 0.38].forEach(x => kit.mesh(wheel, 'detail', { x, y: 0.085, z, rx: Math.PI / 2 }))
	})
	kit.mesh(kit.cylinder('handle', [0.04, 0.04, 0.9], 16), 'accent', { x: -0.78, y: 1.02, rx: Math.PI / 2 })
	;[-0.36, 0.36].forEach(z => kit.mesh(brace, 'accent', { x: -0.68, y: 0.96, z, rz: -0.55 }))
	return kit.finish({
		anchor: new Vector3(0, 1.3, 0),
		animations: {
			roll: progress => {
				hops.forEach(({ crate, y }, index) => {
					const step = (progress * SPAN - index * STAGGER) / HOP_TIME
					crate.position.y = y + (step > 0 && step < 1 ? Math.sin(step * Math.PI) * HOP : 0)
				})
			},
		},
	})
}
