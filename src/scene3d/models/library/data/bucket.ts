/** Утилиты: модель `bucket` — ведро с листами документов и ручкой (хранилище объектов); анимация `pulse` — листы по очереди подпрыгивают */

import { Vector3 } from 'three'
import type { Group } from 'three'
import { clamp01, createKit } from '../parts'
import type { ModelKit } from '../../../types/internal/model3dRuntime.types'
import type { Model3DContext, Model3DNode } from '../../../types/model3d.types'

const PROFILE = [
	[0, 0],
	[0.34, 0],
	[0.36, 0.02],
	[0.47, 0.68],
	[0.5, 0.7],
	[0.47, 0.7],
	[0.37, 0.06],
	[0, 0.06],
] as const
const SHEETS = [
	{ x: -0.16, y: 0.66, z: 0, w: 0.34, h: 0.46, tilt: -0.22, part: 'body' },
	{ x: 0.12, y: 0.7, z: -0.08, w: 0.32, h: 0.44, tilt: 0.18, part: 'body' },
	{ x: 0, y: 0.62, z: 0.12, w: 0.42, h: 0.32, tilt: 0.05, part: 'light' },
] as const

function buildSheets(kit: ModelKit): Group[] {
	return SHEETS.map(sheet => {
		const group = kit.group('sheet', { x: sheet.x, y: sheet.y, z: sheet.z, rz: sheet.tilt })
		kit.mesh(kit.box('sheet', [sheet.w, sheet.h, 0.025]), sheet.part, { parent: group })
		kit.mesh(kit.box('line', [sheet.w - 0.12, 0.03, 0.01]), 'detail', { parent: group, y: 0.05, z: 0.016 })
		return group
	})
}

/** `bucket`: корпус-ведро `accent` с ободом `body`, ручкой `metal`, этикеткой и тремя листами; `pulse` — каждый лист подпрыгивает и ложится на место */
export function buildBucket(_node: Model3DNode, context: Model3DContext) {
	const kit = createKit('bucket', context)
	const sheets = buildSheets(kit)
	kit.mesh(kit.lathe('pail', PROFILE), 'accent')
	kit.mesh(kit.torus('rim', [0.49, 0.035]), 'body', { y: 0.7, rx: Math.PI / 2 })
	kit.mesh(kit.torus('handle', [0.49, 0.022], Math.PI), 'metal', { y: 0.7, rx: -0.55 })
	kit.mesh(kit.box('label', [0.3, 0.12, 0.02]), 'body', { y: 0.36, z: 0.43, rx: -0.16 })
	const pulse = (progress: number): void => {
		sheets.forEach((sheet, index) => {
			const phase = clamp01((progress - index * 0.1) / 0.5)
			sheet.position.y = SHEETS[index].y + (phase > 0 && phase < 1 ? Math.sin(phase * Math.PI) * 0.16 : 0)
		})
	}
	return kit.finish({ anchor: new Vector3(0, 1.24, 0), animations: { pulse } })
}
