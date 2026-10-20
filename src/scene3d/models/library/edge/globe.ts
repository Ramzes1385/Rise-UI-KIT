/** Утилиты: модель `globe` — глобус на подставке с кольцом орбиты и двумя спутниками; анимация `spin` */

import { Vector3 } from 'three'
import type { Group } from 'three'
import { createKit, easeInOut } from '../parts'
import type { ModelKit } from '../../../types/internal/model3dRuntime.types'
import type { Model3DContext, Model3DNode } from '../../../types/model3d.types'

const RADIUS = 0.46
const ORBIT = 0.74
const TURN = Math.PI * 2
const PHASES = [0, Math.PI]

function buildEarth(kit: ModelKit): Group {
	const earth = kit.group('earth', { y: 0.76 })
	kit.mesh(kit.sphere('earth', RADIUS, 16), 'accent', { parent: earth })
	const meridian = kit.torus('meridian', [RADIUS + 0.002, 0.014])
	;[0, Math.PI / 2].forEach(ry => kit.mesh(meridian, 'body', { parent: earth, ry }))
	;[-0.22, 0.22].forEach(y => {
		const parallel = kit.torus('parallel', [Math.sqrt(RADIUS * RADIUS - y * y) + 0.002, 0.014])
		kit.mesh(parallel, 'body', { parent: earth, y, rx: Math.PI / 2 })
	})
	return earth
}

function buildSatellites(kit: ModelKit): Group[] {
	const orbit = kit.group('orbit', { y: 0.76, rx: 0.42, rz: 0.3 })
	kit.mesh(kit.torus('orbit', [ORBIT, 0.008]), 'detail', { parent: orbit, rx: Math.PI / 2 })
	return PHASES.map(() => {
		const satellite = kit.group('satellite', { parent: orbit })
		kit.mesh(kit.box('satellite', [0.12, 0.12, 0.12]), 'body', { parent: satellite })
		;[-1, 1].forEach(side => kit.mesh(kit.box('panel', [0.18, 0.012, 0.09]), 'accent', { parent: satellite, x: side * 0.16 }))
		return satellite
	})
}

/** `globe`: глобус (`accent`, сетка `body`) на подставке, вокруг — орбита со спутниками; `spin` — оборот глобуса и спутников */
export function buildGlobe(_node: Model3DNode, context: Model3DContext) {
	const kit = createKit('globe', context)
	kit.mesh(kit.cylinder('base', [0.36, 0.44, 0.1]), 'body', { y: 0.05 })
	kit.mesh(kit.cylinder('stem', [0.06, 0.08, 0.22], 16), 'body', { y: 0.2 })
	const earth = buildEarth(kit)
	const satellites = buildSatellites(kit)
	const spin = (progress: number): void => {
		const turn = TURN * easeInOut(progress)
		earth.rotation.y = turn
		satellites.forEach((satellite, index) => {
			const angle = PHASES[index] + turn
			satellite.position.set(Math.cos(angle) * ORBIT, 0, Math.sin(angle) * ORBIT)
			satellite.rotation.y = -angle
		})
	}
	spin(0)
	return kit.finish({ anchor: new Vector3(0, 1.36, 0), animations: { spin } })
}
