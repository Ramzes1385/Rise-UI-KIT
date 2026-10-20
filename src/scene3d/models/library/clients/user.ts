/** Утилиты: модель `user` — человек-фигурка на круглой подставке (актор, пользователь); анимация `pulse` — кивок головы */

import { CapsuleGeometry, Vector3 } from 'three'
import { createKit, pulseWindow } from '../parts'
import type { Model3DContext, Model3DNode } from '../../../types/model3d.types'

const HEAD_Y = 1
const BODY_Y = 0.52

/** `user`: туловище-капсула `accent`, голова и подставка `body`, кольцо `detail`, значок `light`; `pulse` — голова кивает вверх и возвращается */
export function buildUser(_node: Model3DNode, context: Model3DContext) {
	const kit = createKit('user', context)
	kit.mesh(kit.cylinder('base', [0.42, 0.46, 0.1]), 'body', { y: 0.05 })
	kit.mesh(kit.torus('ring', [0.44, 0.018]), 'detail', { y: 0.1, rx: Math.PI / 2 })
	const torso = context.geometry('user:torso:0.25x0.34', () => new CapsuleGeometry(0.25, 0.34, 4, 16))
	kit.mesh(torso, 'accent', { y: BODY_Y })
	const head = kit.mesh(kit.sphere('head', 0.2, 18), 'body', { y: HEAD_Y })
	kit.mesh(kit.box('badge', [0.14, 0.1, 0.02]), 'light', { x: 0.08, y: 0.6, z: 0.25, detail: true })
	const pulse = (progress: number): void => {
		head.position.y = HEAD_Y + 0.06 * pulseWindow(progress, [0, 0.25, 0.5, 0.8])
	}
	return kit.finish({ anchor: new Vector3(0, 1.22, 0), animations: { pulse } })
}
