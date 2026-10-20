/** Утилиты: запасная модель карты — стопка серверных модулей с индикаторами */

import { Vector3 } from 'three'
import { createKit } from '../parts'
import type { Model3DContext, Model3DNode } from '../../../types/model3d.types'

const MODULES = 3
const MODULE_STEP = 0.34
const LEDS = [-0.52, -0.39, -0.26]

/** `server`: три модуля друг на друге, на верхнем светлая крышка; щели — `metal`, светодиоды — `light` (мелкие детали) */
export function buildServer(_node: Model3DNode, context: Model3DContext) {
	const kit = createKit('server', context)
	const slab = kit.slab('module', [1.45, 1.15, 0.27], { radius: 0.2, bevel: 0.03 })
	const slit = kit.box('slit', [0.62, 0.035, 0.02])
	const led = kit.box('led', [0.07, 0.07, 0.02])
	for (let index = 0; index < MODULES; index += 1) {
		const y = index * MODULE_STEP
		kit.mesh(slab, index === MODULES - 1 ? 'accent' : 'body', { y })
		kit.mesh(slit, 'metal', { x: 0.25, y: y + 0.135, z: 0.585, detail: true })
		LEDS.forEach(x => kit.mesh(led, 'light', { x, y: y + 0.135, z: 0.59, detail: true }))
	}
	return kit.finish({ anchor: new Vector3(0, 0.99, 0) })
}
