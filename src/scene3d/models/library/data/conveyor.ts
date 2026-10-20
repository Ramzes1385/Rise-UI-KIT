/** Утилиты: модель `conveyor` — конвейер с конвертами (очередь событий) */

import { Vector3 } from 'three'
import { createKit } from '../parts'
import type { Model3DContext, Model3DNode } from '../../../types/model3d.types'

const RIBS = 8
const ENVELOPES = 3
const ROLLERS = 7
const FADE = 0.08

/** Доля пути 0..1 с замыканием: 1 даёт то же, что 0 */
const fraction = (value: number): number => ((value % 1) + 1) % 1

/** Масштаб на краях ленты: предмет появляется и исчезает, не выскакивая */
const fade = (along: number): number => Math.max(0.001, Math.min(1, along / FADE, (1 - along) / FADE))

/** `conveyor`: рама с роликами, лента с рёбрами и три конверта; анимация `flow` — лента делает полный круг, предметы едут слева направо */
export function buildConveyor(_node: Model3DNode, context: Model3DContext) {
	const kit = createKit('conveyor', context)
	const side = kit.box('side', [2.3, 0.1, 0.07])
	const leg = kit.box('leg', [0.08, 0.42, 0.08])
	;[-0.34, 0.34].forEach(z => {
		kit.mesh(side, 'accent', { y: 0.44, z })
		;[-0.96, 0.96].forEach(x => kit.mesh(leg, 'body', { x, y: 0.21, z }))
	})
	;[-0.96, 0.96].forEach(x => kit.mesh(kit.box('foot', [0.07, 0.06, 0.7]), 'body', { x, y: 0.03 }))
	const roller = kit.cylinder('roller', [0.075, 0.075, 0.62], 16)
	for (let index = 0; index < ROLLERS; index += 1) kit.mesh(roller, 'metal', { x: -1.02 + index * 0.34, y: 0.45, rx: Math.PI / 2 })
	kit.mesh(kit.box('belt', [2.24, 0.035, 0.58]), 'detail', { y: 0.53 })
	const rib = kit.box('rib', [0.07, 0.012, 0.58])
	const ribs = Array.from({ length: RIBS }, () => kit.mesh(rib, 'body', { y: 0.55 }))
	const envelopes = Array.from({ length: ENVELOPES }, () => {
		const envelope = kit.group('envelope', { y: 0.58 })
		kit.mesh(kit.box('envelope', [0.36, 0.06, 0.26]), 'body', { parent: envelope })
		kit.mesh(kit.cylinder('seal', [0.045, 0.045, 0.02], 16), 'accent', { y: 0.04, z: 0.02, parent: envelope })
		return envelope
	})
	const flow = (progress: number): void => {
		ribs.forEach((mesh, index) => {
			const along = fraction(index / RIBS + progress)
			mesh.position.x = -1 + along * 2
			mesh.scale.setScalar(fade(along))
		})
		envelopes.forEach((envelope, index) => {
			const along = fraction(index / ENVELOPES + progress)
			envelope.position.x = -1 + along * 2
			envelope.scale.setScalar(fade(along))
		})
	}
	flow(0)
	return kit.finish({ anchor: new Vector3(0, 0.74, 0), animations: { flow } })
}
