/** Утилиты: модель `lock` — замок с ключом на круглой подставке (авторизация) */

import { Vector3 } from 'three'
import { createKit, pulseWindow } from '../parts'
import type { ModelKit } from '../../../types/internal/model3dRuntime.types'
import type { Model3DContext, Model3DNode } from '../../../types/model3d.types'

const SPAN = 1
const SHACKLE_Y = 0.98
const SHACKLE_LIFT = 0.17
const KEY_TURN = 1.1

function buildShackle(kit: ModelKit) {
	const shackle = kit.group('shackle', { x: -0.06, y: SHACKLE_Y, z: -0.04 })
	kit.mesh(kit.torus('arc', [0.26, 0.065], Math.PI), 'metal', { parent: shackle })
	const leg = kit.cylinder('leg', [0.065, 0.065, 0.2], 16)
	;[-0.26, 0.26].forEach(x => kit.mesh(leg, 'metal', { x, y: -0.1, parent: shackle }))
	return shackle
}

function buildKey(kit: ModelKit) {
	const key = kit.group('key', { x: 0.18, y: 0.185, z: 0.42, ry: -0.35 })
	kit.mesh(kit.torus('bow', [0.11, 0.04]), 'light', { rx: Math.PI / 2, parent: key })
	kit.mesh(kit.box('blade', [0.38, 0.045, 0.06]), 'light', { x: 0.29, parent: key })
	kit.mesh(kit.box('tooth', [0.05, 0.045, 0.1]), 'light', { x: 0.42, z: 0.06, parent: key })
	kit.mesh(kit.box('tooth2', [0.05, 0.045, 0.07]), 'light', { x: 0.33, z: 0.05, parent: key })
	return key
}

/** `lock`: корпус с замочной скважиной, дужка и ключ; анимация `unlock` — ключ поворачивается, дужка поднимается и защёлкивается обратно */
export function buildLock(_node: Model3DNode, context: Model3DContext) {
	const kit = createKit('lock', context)
	kit.mesh(kit.cylinder('stand', [0.66, 0.7, 0.16]), 'body', { y: 0.08 })
	kit.mesh(kit.torus('ring', [0.68, 0.022]), 'accent', { y: 0.16, rx: Math.PI / 2 })
	// корпус стоит: плита повёрнута на 90° вокруг X, толщина 0,34 уходит вперёд от центра
	kit.mesh(kit.slab('body', [0.86, 0.68, 0.34], { radius: 0.14, bevel: 0.03 }), 'detail', {
		x: -0.06,
		y: 0.53,
		z: -0.21,
		rx: Math.PI / 2,
	})
	kit.mesh(kit.cylinder('hole', [0.075, 0.075, 0.02]), 'body', { x: -0.06, y: 0.59, z: 0.16, rx: Math.PI / 2, detail: true })
	kit.mesh(kit.box('slot', [0.05, 0.15, 0.02]), 'body', { x: -0.06, y: 0.49, z: 0.16, detail: true })
	const shackle = buildShackle(kit)
	const key = buildKey(kit)
	return kit.finish({
		anchor: new Vector3(0, 1.26, 0),
		animations: {
			unlock: progress => {
				const time = progress * SPAN
				const up = pulseWindow(time, [0.05, 0.22, 0.55, 0.66])
				const snap = time > 0.66 && time < 0.9 ? Math.sin(((time - 0.66) / 0.24) * Math.PI) * 0.03 : 0
				shackle.position.y = SHACKLE_Y + up * SHACKLE_LIFT - snap
				key.rotation.x = up * KEY_TURN
			},
		},
	})
}
