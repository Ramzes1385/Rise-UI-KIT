/** Утилиты: модель `flask` — колба с жидкостью и пузырьками (фигура пьедестала «тестирование») */

import { Vector3 } from 'three'
import { createKit } from '../parts'
import type { Model3DContext, Model3DNode } from '../../../types/model3d.types'

const GLASS = [
	[0, 0],
	[0.34, 0],
	[0.38, 0.05],
	[0.36, 0.12],
	[0.16, 0.5],
	[0.12, 0.56],
	[0.12, 0.8],
	[0.16, 0.84],
	[0.15, 0.88],
	[0.1, 0.88],
	[0, 0.88],
] as const
const LIQUID = [
	[0, 0.02],
	[0.33, 0.02],
	[0.33, 0.1],
	[0.24, 0.28],
	[0, 0.28],
] as const
const BUBBLES = [
	{ x: 0.06, y: 0.4, z: 0.02, radius: 0.045 },
	{ x: -0.05, y: 0.62, z: 0, radius: 0.035 },
] as const

/** `flask`: стеклянная колба `glass` (прозрачная), жидкость `accent` на дне и два пузырька `glass` в горле */
export function buildFlask(_node: Model3DNode, context: Model3DContext) {
	const kit = createKit('flask', context)
	kit.mesh(kit.lathe('liquid', LIQUID, 24), 'accent')
	kit.mesh(kit.lathe('glass', GLASS, 24), 'glass')
	BUBBLES.forEach(({ radius, ...at }) => kit.mesh(kit.sphere('bubble', radius, 10), 'glass', at))
	return kit.finish({ anchor: new Vector3(0, 0.98, 0) })
}
