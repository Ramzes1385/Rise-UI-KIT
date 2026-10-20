/** Утилиты: модель `laptop` — ноутбук с интерфейсом магазина на экране (клиент) */

import { Vector3 } from 'three'
import { createKit } from '../parts'
import type { Model3DContext, Model3DNode } from '../../../types/model3d.types'

const CARDS = [-0.46, 0, 0.46]

/** `laptop`: основание с клавиатурой и тачпадом, откинутая крышка с экраном; интерфейс на экране — шапка, три карточки, кнопки (анимация — общая `pulse`) */
export function buildLaptop(_node: Model3DNode, context: Model3DContext) {
	const kit = createKit('laptop', context)
	kit.mesh(kit.slab('base', [1.55, 1.05, 0.075], { radius: 0.1, bevel: 0.02 }), 'body')
	kit.mesh(kit.box('keys', [1.3, 0.01, 0.5]), 'metal', { y: 0.08, z: 0.1, detail: true })
	kit.mesh(kit.box('pad', [0.4, 0.01, 0.2]), 'metal', { y: 0.08, z: 0.42, detail: true })
	const lid = kit.group('lid', { y: 0.075, z: -0.5, rx: -0.2 })
	kit.mesh(kit.box('lid', [1.55, 1, 0.05]), 'body', { y: 0.5, parent: lid })
	kit.mesh(kit.box('screen', [1.44, 0.9, 0.01]), 'screen', { y: 0.51, z: 0.03, parent: lid })
	kit.mesh(kit.box('bar', [1.44, 0.1, 0.01]), 'accent', { y: 0.91, z: 0.036, parent: lid })
	const card = kit.box('card', [0.4, 0.5, 0.01])
	const price = kit.box('price', [0.26, 0.04, 0.01])
	const buy = kit.box('buy', [0.1, 0.08, 0.01])
	CARDS.forEach(x => {
		kit.mesh(card, 'body', { x, y: 0.5, z: 0.04, parent: lid })
		kit.mesh(price, 'detail', { x: x - 0.04, y: 0.34, z: 0.048, parent: lid })
		kit.mesh(buy, 'accent', { x: x + 0.12, y: 0.28, z: 0.048, parent: lid })
	})
	return kit.finish({ anchor: new Vector3(0, 1.04, 0) })
}
