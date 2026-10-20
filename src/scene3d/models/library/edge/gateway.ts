/** Утилиты: модель `gateway` — арка шлюза со шлагбаумом и стрелками проезда */

import { Shape, Vector3 } from 'three'
import { createKit, pulseWindow } from '../parts'
import type { Model3DContext, Model3DNode } from '../../../types/model3d.types'

const POSTS = [-0.68, 0.68]
const ARROWS = [-0.78, 0, 0.78]
const STRIPES = 5
const STRIPE = 0.236
const LIFT = 1.32
const SPAN = 1.5

function arrowShape(): Shape {
	const shape = new Shape()
	shape.moveTo(-0.26, 0.1)
	shape.lineTo(0, -0.1)
	shape.lineTo(0.26, 0.1)
	shape.lineTo(0.26, -0.03)
	shape.lineTo(0, -0.23)
	shape.lineTo(-0.26, -0.03)
	shape.closePath()
	return shape
}

/** `gateway`: два поста под балкой с шевронами, полосатый шлагбаум; анимация `gate` — шлагбаум поднимается и опускается */
export function buildGateway(_node: Model3DNode, context: Model3DContext) {
	const kit = createKit('gateway', context)
	const plate = kit.slab('plate', [0.44, 0.5, 0.08], { radius: 0.06, bevel: 0.02 })
	const post = kit.slab('post', [0.26, 0.28, 1.16], { radius: 0.05, bevel: 0.02 })
	const band = kit.box('band', [0.28, 0.08, 0.3])
	POSTS.forEach(x => {
		kit.mesh(plate, 'body', { x })
		kit.mesh(post, 'body', { x, y: 0.08 })
		kit.mesh(band, 'detail', { x, y: 0.66 })
	})
	kit.mesh(kit.slab('beam', [1.68, 0.4, 0.24], { radius: 0.07, bevel: 0.02 }), 'detail', { y: 1.22 })
	kit.mesh(kit.box('sign', [1.3, 0.17, 0.01]), 'screen', { y: 1.34, z: 0.205, detail: true })
	const arm = kit.group('arm', { x: -0.68, y: 0.5, z: 0.2 })
	kit.mesh(kit.cylinder('hub', [0.1, 0.1, 0.08]), 'detail', { rx: Math.PI / 2, parent: arm })
	const stripe = kit.box('stripe', [STRIPE, 0.08, 0.06])
	for (let index = 0; index < STRIPES; index += 1)
		kit.mesh(stripe, index % 2 ? 'body' : 'accent', { x: 0.07 + STRIPE / 2 + index * STRIPE, z: 0.02, parent: arm })
	const arrow = kit.extrude('arrow', arrowShape(), { height: 0.012, bevel: 0 })
	ARROWS.forEach(z => kit.mesh(arrow, 'light', { y: 0.002, z, detail: true }))
	return kit.finish({
		anchor: new Vector3(0, 1.46, 0),
		animations: {
			gate: progress => {
				arm.rotation.z = pulseWindow(progress * SPAN, [0, 0.35, 1.05, 1.5]) * LIFT
			},
		},
	})
}
