/** Утилиты: модель `code` — знак `</>` из наклонных брусков (фигура пьедестала «код») */

import { Vector3 } from 'three'
import { createKit } from '../parts'
import type { Model3DContext, Model3DNode } from '../../../types/model3d.types'

const BARS = [
	{ width: 0.36, angle: 0.72, x: -0.34, y: 0.67, part: 'accent' },
	{ width: 0.36, angle: -0.72, x: -0.34, y: 0.43, part: 'accent' },
	{ width: 0.36, angle: -0.72, x: 0.34, y: 0.67, part: 'accent' },
	{ width: 0.36, angle: 0.72, x: 0.34, y: 0.43, part: 'accent' },
	{ width: 0.6, angle: 1.2, x: 0, y: 0.55, part: 'body' },
] as const

/** `code`: скобки `<` и `>` из четырёх брусков `accent` и наклонная черта `body` между ними; на невысоком основании `detail` */
export function buildCode(_node: Model3DNode, context: Model3DContext) {
	const kit = createKit('code', context)
	kit.mesh(kit.cylinder('base', [0.5, 0.54, 0.05]), 'detail', { y: 0.025 })
	BARS.forEach(({ width, angle, x, y, part }) => kit.mesh(kit.box('bar', [width, 0.1, 0.12]), part, { x, y, rz: angle }))
	return kit.finish({ anchor: new Vector3(0, 1.0, 0) })
}
