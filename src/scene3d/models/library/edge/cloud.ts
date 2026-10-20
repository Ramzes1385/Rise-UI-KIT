/** Утилиты: модель `cloud` — полупрозрачное облако над пунктирным контуром (внешняя система); анимация `pulse` — плавное парение */

import { createKit } from '../parts'
import { CapsuleGeometry, Vector3 } from 'three'
import type { ModelKit } from '../../../types/internal/model3dRuntime.types'
import type { Model3DContext, Model3DNode } from '../../../types/model3d.types'

const REST_Y = 0.8
const PUFFS = [
	[-0.36, 0, 0, 0.3],
	[0.02, 0.12, 0, 0.4],
	[0.4, -0.02, 0.02, 0.28],
	[0.16, -0.06, 0.2, 0.27],
	[-0.16, -0.05, -0.16, 0.28],
] as const
const DASHES = 20

function buildDashes(kit: ModelKit): void {
	const dash = kit.box('dash', [0.08, 0.012, 0.02])
	for (let index = 0; index < DASHES; index += 1) {
		const angle = (index / DASHES) * Math.PI * 2
		const x = Math.cos(angle) * 0.72
		const z = Math.sin(angle) * 0.6
		kit.mesh(dash, 'detail', { x, y: 0.012, z, ry: Math.atan2(-Math.cos(angle) * 0.6, -Math.sin(angle) * 0.72), detail: true })
	}
}

/** `cloud`: пять шаров и капсула роли `glass` (призрак внешней системы), пунктир на земле — мелкие детали; `pulse` — подъём и возврат */
export function buildCloud(_node: Model3DNode, context: Model3DContext) {
	const kit = createKit('cloud', context)
	const cloud = kit.group('cloud', { y: REST_Y })
	const puff = (radius: number) => kit.sphere('puff', radius, 14)
	PUFFS.forEach(([x, y, z, radius]) => kit.mesh(puff(radius), 'glass', { parent: cloud, x, y, z }))
	const capsule = context.geometry('cloud:capsule:0.22x0.74', () => new CapsuleGeometry(0.22, 0.74, 4, 12))
	kit.mesh(capsule, 'glass', { parent: cloud, x: 0.02, y: -0.08, rz: Math.PI / 2 })
	buildDashes(kit)
	const pulse = (progress: number): void => {
		cloud.position.y = REST_Y + 0.07 * Math.sin(progress * Math.PI * 2)
	}
	return kit.finish({ anchor: new Vector3(0, 1.22, 0), animations: { pulse } })
}
