/** Утилиты: модель `db` — база данных: цилиндр из дисков с таблицей над ним */

import { Vector3 } from 'three'
import { createKit, easeInOut } from '../parts'
import type { Model3DContext, Model3DNode } from '../../../types/model3d.types'

const DISKS = 3
const DISK_STEP = 0.35
const TABLE_Y = 1.2
const LIFT = 0.16
const FULL_TURN = Math.PI * 2
const ROWS = [-0.2, 0, 0.2]

/** `db`: три диска с ободами, над ними таблица со строками; анимация `spin` — таблица поднимается и делает полный оборот */
export function buildDb(_node: Model3DNode, context: Model3DContext) {
	const kit = createKit('db', context)
	const disk = kit.cylinder('disk', [0.72, 0.72, 0.3])
	const rim = kit.torus('rim', [0.725, 0.026])
	for (let index = 0; index <= DISKS; index += 1) {
		if (index < DISKS) kit.mesh(disk, 'body', { y: 0.15 + index * DISK_STEP })
		kit.mesh(rim, 'accent', { y: 0.01 + index * DISK_STEP, rx: Math.PI / 2 })
	}
	const table = kit.group('table', { y: TABLE_Y })
	kit.mesh(kit.box('slab', [0.9, 0.05, 0.66]), 'body', { parent: table })
	kit.mesh(kit.box('head', [0.88, 0.01, 0.1]), 'accent', { y: 0.03, z: -0.26, parent: table })
	const row = kit.box('row', [0.88, 0.01, 0.1])
	ROWS.forEach(z => kit.mesh(row, 'screen', { y: 0.03, z: z + 0.06, parent: table }))
	return kit.finish({
		anchor: new Vector3(0, 1.36, 0),
		animations: {
			spin: progress => {
				table.position.y = TABLE_Y + Math.sin(progress * Math.PI) * LIFT
				table.rotation.y = (easeInOut(progress) * FULL_TURN) % FULL_TURN
			},
		},
	})
}
