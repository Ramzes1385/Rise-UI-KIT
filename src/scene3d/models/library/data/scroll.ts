/** Утилиты: модель `scroll` — свиток с журналом: лист и два валика (логи); анимация `flow` — строки по очереди вытягиваются */

import { Vector3 } from 'three'
import type { Group, Mesh } from 'three'
import { createKit, pulseWindow } from '../parts'
import type { ModelKit } from '../../../types/internal/model3dRuntime.types'
import type { Model3DContext, Model3DNode } from '../../../types/model3d.types'

const ROWS = 6
const ROLLS = [
	{ z: -0.44, y: 0.26, radius: 0.12 },
	{ z: 0.47, y: 0.13, radius: 0.1 },
] as const

function buildSheet(kit: ModelKit): Mesh[] {
	const sheet: Group = kit.group('sheet', { y: 0.19, z: 0.02, rx: 0.12 })
	kit.mesh(kit.box('sheet', [1.16, 0.015, 0.92]), 'body', { parent: sheet })
	const row = kit.box('row', [0.8, 0.012, 0.045])
	return Array.from({ length: ROWS }, (_row, index) =>
		kit.mesh(row, index % 3 === 2 ? 'accent' : 'detail', { parent: sheet, x: -0.1, y: 0.012, z: -0.36 + index * 0.14 }),
	)
}

function buildRolls(kit: ModelKit): void {
	ROLLS.forEach(({ z, y, radius }) => {
		kit.mesh(kit.cylinder('roll', [radius, radius, 1.28], 24), 'body', { y, z, rz: Math.PI / 2 })
		;[-0.67, 0.67].forEach(x =>
			kit.mesh(kit.cylinder('cap', [radius + 0.025, radius + 0.025, 0.05], 24), 'accent', { x, y, z, rz: Math.PI / 2 }),
		)
	})
}

/** `scroll`: лист и два валика `body` с торцами `accent`, строки журнала `detail`; `flow` — волна удлинения строк */
export function buildScroll(_node: Model3DNode, context: Model3DContext) {
	const kit = createKit('scroll', context)
	const rows = buildSheet(kit)
	buildRolls(kit)
	const flow = (progress: number): void => {
		rows.forEach((row, index) => {
			const start = index * 0.1
			row.scale.x = 1 + 0.25 * pulseWindow(progress, [start, start + 0.15, start + 0.3, start + 0.4])
		})
	}
	return kit.finish({ anchor: new Vector3(0, 0.5, 0), animations: { flow } })
}
