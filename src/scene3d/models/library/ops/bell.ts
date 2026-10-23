/** Утилиты: модель `bell` — колокольчик уведомлений с красным значком и конвертом */

import { Vector3 } from 'three'
import { createKit } from '../parts'
import type { Model3DContext, Model3DNode } from '../../../types/model3d.types'

const SPAN = 2.2
const SWING = 0.42
const PROFILE = [
	[0.52, 0],
	[0.5, 0.05],
	[0.42, 0.13],
	[0.35, 0.3],
	[0.31, 0.5],
	[0.26, 0.63],
	[0.17, 0.71],
	[0, 0.74],
] as const

/** `bell`: подставка, колокол на подвесе, язычок, значок и конверт; анимация `ring` — колокол качается с затуханием, значок вздувается */
export function buildBell(_node: Model3DNode, context: Model3DContext) {
	const kit = createKit('bell', context)
	kit.mesh(kit.cylinder('stand', [0.52, 0.56, 0.12]), 'body', { y: 0.06 })
	const swing = kit.group('swing', { x: -0.08, y: 1.06, z: -0.04 })
	kit.mesh(kit.lathe('bell', PROFILE), 'accent', { y: -0.74, parent: swing })
	kit.mesh(kit.torus('rim', [0.51, 0.04]), 'detail', { y: -0.73, rx: Math.PI / 2, parent: swing })
	kit.mesh(kit.sphere('knob', 0.075, 12), 'detail', { y: 0.02, parent: swing })
	kit.mesh(kit.sphere('clapper', 0.1, 12), 'light', { y: -0.8, parent: swing })
	const badge = kit.mesh(kit.sphere('badge', 0.12, 12), 'light', { x: 0.27, y: -0.16, z: 0.18, parent: swing })
	const mail = kit.group('mail', { x: 0.34, y: 0.3, z: 0.3, rx: -0.12, ry: -0.25, rz: 0.06 })
	kit.mesh(kit.box('mail', [0.56, 0.38, 0.03]), 'body', { parent: mail })
	const flap = kit.box('flap', [0.34, 0.025, 0.01])
	;[0.5, -0.5].forEach(turn => kit.mesh(flap, 'metal', { x: turn * -0.14, y: 0.08, z: 0.02, rz: turn, parent: mail }))
	return kit.finish({
		anchor: new Vector3(0, 1.18, 0),
		animations: {
			ring: progress => {
				const time = progress * SPAN
				swing.rotation.z = time < SPAN ? SWING * Math.sin(time * 13) * Math.exp(-time * 2.1) : 0
				badge.scale.setScalar(time < 1.2 ? 1 + 0.35 * Math.sin(Math.min(1, time / 0.5) * Math.PI) : 1)
			},
		},
	})
}
