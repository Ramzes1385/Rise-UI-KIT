/** Утилиты: модель `rocket` — ракета с иллюминатором, плавниками и пламенем (фигура пьедестала «запуск»); анимация `pulse` — взлёт и возврат */

import type { Group } from 'three'
import { upright } from '../upright'
import { Shape, Vector3 } from 'three'
import { createKit, pulseWindow } from '../parts'
import type { ModelKit } from '../../../types/internal/model3dRuntime.types'
import type { Model3DContext, Model3DNode } from '../../../types/model3d.types'

const HULL = [
	[0, 0.12],
	[0.2, 0.12],
	[0.24, 0.24],
	[0.24, 0.66],
	[0.2, 0.84],
	[0.12, 0.98],
	[0, 1.06],
] as const
const FINS = 3

function finShape(): Shape {
	const shape = new Shape()
	shape.moveTo(0, 0)
	shape.lineTo(0.22, -0.02)
	shape.lineTo(0.2, 0.18)
	shape.lineTo(0, 0.36)
	shape.lineTo(0, 0)
	return shape
}

function buildFins(kit: ModelKit, rocket: Group): void {
	for (let index = 0; index < FINS; index += 1) {
		const angle = (index / FINS) * Math.PI * 2 + Math.PI / 6
		const fin = kit.group('fin', {
			parent: rocket,
			x: Math.sin(angle) * 0.2,
			y: 0.1,
			z: Math.cos(angle) * 0.2,
			ry: angle - Math.PI / 2,
		})
		upright(kit, finShape(), { name: 'fin', depth: 0.04, part: 'accent', parent: fin })
	}
}

/** `rocket`: корпус `body`, нос и плавники `accent`, иллюминатор `accent`/`glass`, пламя `light`; `pulse` — подъём ракеты и возврат на место */
export function buildRocket(_node: Model3DNode, context: Model3DContext) {
	const kit = createKit('rocket', context)
	const rocket = kit.group('rocket')
	kit.mesh(kit.lathe('hull', HULL, 24), 'body', { parent: rocket })
	kit.mesh(kit.cylinder('nose', [0, 0.13, 0.2], 24), 'accent', { parent: rocket, y: 1 })
	kit.mesh(kit.torus('window', [0.075, 0.025]), 'accent', { parent: rocket, y: 0.66, z: 0.235 })
	kit.mesh(kit.cylinder('pane', [0.07, 0.07, 0.01], 16), 'glass', { parent: rocket, y: 0.66, z: 0.242, rx: Math.PI / 2 })
	buildFins(kit, rocket)
	const flame = kit.mesh(kit.cylinder('flame', [0.11, 0, 0.26], 16), 'light', { parent: rocket, y: 0.04 })
	const pulse = (progress: number): void => {
		const lift = pulseWindow(progress, [0, 0.35, 0.55, 1])
		rocket.position.y = 0.12 * lift
		flame.scale.y = 1 + 0.6 * lift
	}
	return kit.finish({ anchor: new Vector3(0, 1.2, 0), animations: { pulse } })
}
