/** Утилиты: модель `terminal` — платёжный терминал с картой и стопкой монет */

import { Vector3 } from 'three'
import type { Group } from 'three'
import { createKit, pulseWindow } from '../parts'
import type { ModelKit } from '../../../types/internal/model3dRuntime.types'
import type { Model3DContext, Model3DNode } from '../../../types/model3d.types'

const SPAN = 1.9
const CARD_TOP = 1.36
const SWIPE = 0.24
const KEYS = [-0.14, 0, 0.14]
const KEY_ROWS = [0.5, 0.36, 0.22, 0.08]

function buildCard(kit: ModelKit, unit: Group) {
	const card = kit.group('card', { y: CARD_TOP, parent: unit })
	kit.mesh(kit.box('card', [0.42, 0.27, 0.018]), 'accent', { parent: card })
	kit.mesh(kit.box('chip', [0.08, 0.06, 0.004]), 'light', { x: -0.11, y: 0.03, z: 0.011, parent: card })
	kit.mesh(kit.box('stripe', [0.42, 0.04, 0.004]), 'detail', { y: -0.07, z: -0.011, parent: card })
	return card
}

/** `terminal`: корпус под наклоном с экраном и клавишами, карта над щелью, стопка монет; анимация `swipe` — карта проходит через терминал, загорается лампа «оплачено» */
export function buildTerminal(_node: Model3DNode, context: Model3DContext) {
	const kit = createKit('terminal', context)
	kit.mesh(kit.slab('base', [0.96, 0.76, 0.06], { radius: 0.14, bevel: 0.02 }), 'body')
	const unit = kit.group('unit', { x: -0.08, y: 0.06, z: -0.06, rx: -0.16 })
	// стоящий корпус: плита повёрнута на 90° вокруг X и сдвинута на полтолщины назад
	kit.mesh(kit.slab('unit', [0.62, 1.02, 0.26], { radius: 0.12, bevel: 0.03 }), 'body', {
		y: 0.54,
		z: -0.13,
		rx: Math.PI / 2,
		parent: unit,
	})
	kit.mesh(kit.box('screen', [0.5, 0.3, 0.01]), 'screen', { y: 0.82, z: 0.162, parent: unit })
	const key = kit.box('key', [0.12, 0.09, 0.012])
	KEY_ROWS.forEach(y => KEYS.forEach(x => kit.mesh(key, 'metal', { x, y, z: 0.162, parent: unit })))
	kit.mesh(kit.box('slot', [0.46, 0.035, 0.07]), 'detail', { y: 1.07, parent: unit })
	const lamp = kit.mesh(kit.sphere('lamp', 0.03, 10), 'light', { x: 0.2, y: 0.97, z: 0.165, parent: unit })
	const card = buildCard(kit, unit)
	const coin = kit.cylinder('coin', [0.15, 0.15, 0.055], 24)
	for (let index = 0; index < 4; index += 1) kit.mesh(coin, 'light', { x: 0.33 + (index % 2) * 0.012, y: 0.09 + index * 0.06, z: 0.2 })
	kit.mesh(coin, 'light', { x: 0.42, y: 0.1, z: -0.22, rz: 0.25 })
	lamp.scale.setScalar(0.001)
	return kit.finish({
		anchor: new Vector3(0, 1.5, 0),
		animations: {
			swipe: progress => {
				const time = progress * SPAN
				card.position.y = CARD_TOP - pulseWindow(time, [0, 0.45, 1.5, 1.9]) * SWIPE
				lamp.scale.setScalar(time > 0.55 && time < 1.9 ? 1 : 0.001)
			},
		},
	})
}
