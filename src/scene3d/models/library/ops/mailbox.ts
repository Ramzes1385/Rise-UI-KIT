/** Утилиты: модель `mailbox` — почтовый ящик на столбе с флажком и конвертом (отправка писем); анимация `send` — флажок поднимается, конверт уходит */

import { Shape, Vector3 } from 'three'
import { createKit, pulseWindow } from '../parts'
import type { ModelKit } from '../../../types/internal/model3dRuntime.types'
import type { Model3DContext, Model3DNode } from '../../../types/model3d.types'

const FLAG_DOWN = -1.45
const ENVELOPE_X = -0.5

function archShape(): Shape {
	const shape = new Shape()
	shape.moveTo(-0.26, 0)
	shape.lineTo(0.26, 0)
	shape.lineTo(0.26, 0.28)
	shape.absarc(0, 0.28, 0.26, 0, Math.PI, false)
	shape.lineTo(-0.26, 0)
	return shape
}

function buildBox(kit: ModelKit): void {
	kit.mesh(kit.slab('plate', [0.5, 0.5, 0.06], { radius: 0.1, bevel: 0.015 }), 'body')
	kit.mesh(kit.box('post', [0.12, 0.62, 0.12]), 'body', { y: 0.37 })
	const box = kit.group('box', { y: 0.66, ry: Math.PI / 2 })
	kit.mesh(kit.extrude('arch', archShape(), { height: 0.86, bevel: 0.02 }), 'accent', { parent: box, z: -0.43, rx: Math.PI / 2 })
	kit.mesh(kit.box('slot', [0.02, 0.05, 0.28]), 'detail', { x: -0.45, y: 0.94, detail: true })
}

/** `mailbox`: арочный ящик `accent` на столбе `body`, флажок `light`, конверт `body`; `send` — флажок вверх, конверт чуть отъезжает и возвращается */
export function buildMailbox(_node: Model3DNode, context: Model3DContext) {
	const kit = createKit('mailbox', context)
	buildBox(kit)
	const envelope = kit.group('envelope', { x: ENVELOPE_X, y: 0.94, rz: -0.5 })
	kit.mesh(kit.box('envelope', [0.2, 0.02, 0.3]), 'body', { parent: envelope })
	const flag = kit.group('flag', { x: 0.22, y: 0.86, z: 0.29 })
	kit.mesh(kit.box('staff', [0.035, 0.38, 0.03]), 'metal', { parent: flag, y: 0.19 })
	kit.mesh(kit.box('banner', [0.18, 0.12, 0.025]), 'light', { parent: flag, x: 0.09, y: 0.32 })
	const send = (progress: number): void => {
		flag.rotation.z = FLAG_DOWN * (1 - pulseWindow(progress, [0.05, 0.3, 0.7, 0.95]))
		envelope.position.x = ENVELOPE_X - 0.08 * pulseWindow(progress, [0, 0.25, 0.65, 0.9])
	}
	send(0)
	return kit.finish({ anchor: new Vector3(0, 1.26, 0), animations: { send } })
}
