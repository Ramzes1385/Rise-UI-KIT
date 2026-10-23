/** Утилиты: модель `rack` — складской стеллаж с коробками */

import { Vector3 } from 'three'
import { createKit, pulseWindow } from '../parts'
import type { Model3DContext, Model3DNode } from '../../../types/model3d.types'

const SPAN = 1.25
const SHELVES = [0.06, 0.5, 0.94]
const SLIDE = 0.2
const SLIDING = 3
/** Коробки: x, y полки, ширина, высота, глубина */
const BOXES = [
	[-0.36, 0.085, 0.5, 0.32, 0.46],
	[0.26, 0.085, 0.42, 0.26, 0.42],
	[-0.46, 0.525, 0.3, 0.24, 0.36],
	[-0.08, 0.525, 0.34, 0.3, 0.42],
	[0.36, 0.525, 0.36, 0.22, 0.4],
	[-0.2, 0.965, 0.46, 0.26, 0.44],
	[0.34, 0.965, 0.32, 0.2, 0.34],
] as const

/** `rack`: четыре стойки, три полки, семь коробок с лентой; анимация `pulse` — общая, своя: четвёртая коробка выезжает вперёд и возвращается */
export function buildRack(_node: Model3DNode, context: Model3DContext) {
	const kit = createKit('rack', context)
	const leg = kit.box('leg', [0.07, 1.28, 0.07])
	;[-0.68, 0.68].forEach(x => [-0.32, 0.32].forEach(z => kit.mesh(leg, 'accent', { x, y: 0.64, z })))
	const shelf = kit.box('shelf', [1.44, 0.05, 0.7])
	SHELVES.forEach(y => kit.mesh(shelf, 'body', { y }))
	kit.mesh(kit.box('brace', [1.5, 0.035, 0.03]), 'accent', { y: 0.5, z: -0.33, rz: 0.32 })
	const crates = BOXES.map(([x, y, width, height, depth], index) => {
		const crate = kit.group('crate', { x, y, z: 0.04, ry: (index % 3) * 0.06 - 0.06 })
		kit.mesh(kit.box('crate', [width, height, depth]), 'metal', { y: height / 2, parent: crate })
		kit.mesh(kit.box('tape', [Math.min(0.09, width * 0.3), height * 0.6, depth + 0.006]), 'detail', { y: height * 0.7, parent: crate })
		return crate
	})
	return kit.finish({
		anchor: new Vector3(0, 1.3, 0),
		animations: {
			pulse: progress => {
				crates[SLIDING].position.z = 0.04 + pulseWindow(progress * SPAN, [0, 0.3, 0.9, 1.25]) * SLIDE
			},
		},
	})
}
