/** Утилиты: модель `flag` — флаг на древке с круглым основанием (фигура пьедестала «цель»); анимация `pulse` — полотнище покачивается */

import { createKit } from '../parts'
import { upright } from '../upright'
import { Shape, Vector3 } from 'three'
import type { Model3DContext, Model3DNode } from '../../../types/model3d.types'

function clothShape(): Shape {
	const shape = new Shape()
	shape.moveTo(0, 0)
	shape.lineTo(0.62, 0)
	shape.lineTo(0.5, 0.19)
	shape.lineTo(0.62, 0.38)
	shape.lineTo(0, 0.38)
	shape.lineTo(0, 0)
	return shape
}

/** `flag`: древко `body` с навершием `light`, полотнище `accent` и основание `detail`; `pulse` — полотнище качается вокруг древка и возвращается */
export function buildFlag(_node: Model3DNode, context: Model3DContext) {
	const kit = createKit('flag', context)
	kit.mesh(kit.cylinder('base', [0.18, 0.22, 0.06]), 'detail', { y: 0.03 })
	kit.mesh(kit.cylinder('pole', [0.025, 0.025, 1], 10), 'body', { y: 0.55 })
	kit.mesh(kit.sphere('finial', 0.05, 10), 'light', { y: 1.07 })
	const cloth = kit.group('cloth', { x: 0.02, y: 0.7 })
	upright(kit, clothShape(), { name: 'cloth', depth: 0.03, part: 'accent', parent: cloth })
	const pulse = (progress: number): void => {
		cloth.rotation.y = 0.35 * Math.sin(progress * Math.PI * 2)
	}
	return kit.finish({ anchor: new Vector3(0, 1.15, 0), animations: { pulse } })
}
