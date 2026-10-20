/** Утилиты: модель `scales` — весы с двумя чашами и коромыслом; анимация `flow` — качание коромысла */

import { Vector3 } from 'three'
import type { Group } from 'three'
import { createKit } from '../parts'
import type { ModelKit } from '../../../types/internal/model3dRuntime.types'
import type { Model3DContext, Model3DNode } from '../../../types/model3d.types'

const BEAM_Y = 1.02
const ARM = 0.62
const SIDES = [-1, 1]

function buildPans(kit: ModelKit): Group[] {
	return SIDES.map((_side, index) => {
		const pan = kit.group('pan')
		kit.mesh(kit.cylinder('hanger', [0.008, 0.008, 0.42], 6), 'metal', { parent: pan, y: 0.21 })
		kit.mesh(kit.cylinder('pan', [0.27, 0.2, 0.05]), 'body', { parent: pan })
		const weight = kit.box('weight', [0.11, 0.11, 0.11])
		for (let item = 0; item < 3 - index; item += 1) {
			const placement = { parent: pan, x: -0.08 + item * 0.1, y: 0.08, z: (item % 2) * 0.06 - 0.03 }
			kit.mesh(weight, item === 0 ? 'accent' : 'detail', placement)
		}
		return pan
	})
}

/** `scales`: чаши (`body`) на коромысле (`accent`), в них гирьки; `flow` — затухающее качание, в конце коромысло ровно */
export function buildScales(_node: Model3DNode, context: Model3DContext) {
	const kit = createKit('scales', context)
	kit.mesh(kit.cylinder('base', [0.4, 0.48, 0.1]), 'body', { y: 0.05 })
	kit.mesh(kit.cylinder('column', [0.05, 0.065, 0.92], 16), 'body', { y: 0.56 })
	kit.mesh(kit.sphere('pivot', 0.08, 12), 'detail', { y: 1.06 })
	const beam = kit.group('beam', { y: BEAM_Y })
	kit.mesh(kit.box('beam', [1.34, 0.06, 0.08]), 'accent', { parent: beam })
	const pans = buildPans(kit)
	const flow = (progress: number): void => {
		const tilt = 0.22 * Math.sin(progress * Math.PI * 3) * (1 - progress)
		beam.rotation.z = tilt
		pans.forEach((pan, index) =>
			pan.position.set(SIDES[index] * ARM * Math.cos(tilt), BEAM_Y + SIDES[index] * ARM * Math.sin(tilt) - 0.44, 0),
		)
	}
	flow(0)
	return kit.finish({ anchor: new Vector3(0, 1.16, 0), animations: { flow } })
}
