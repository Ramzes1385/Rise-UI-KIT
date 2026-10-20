/** Утилиты: модель `clock` — будильник с колокольчиками и стрелками (расписание); анимация `spin` — стрелки делают полный оборот */

import { Vector3 } from 'three'
import type { Group } from 'three'
import { createKit, easeInOut } from '../parts'
import type { ModelKit } from '../../../types/internal/model3dRuntime.types'
import type { Model3DContext, Model3DNode } from '../../../types/model3d.types'

const HOUR_REST = -1.2
const TURN = Math.PI * 2
const TICKS = 12

function buildFace(kit: ModelKit, clock: Group): void {
	kit.mesh(kit.cylinder('body', [0.5, 0.5, 0.24]), 'accent', { parent: clock, rx: Math.PI / 2 })
	kit.mesh(kit.cylinder('face', [0.43, 0.43, 0.01]), 'body', { parent: clock, z: 0.122, rx: Math.PI / 2 })
	kit.mesh(kit.torus('rim', [0.46, 0.04]), 'body', { parent: clock, z: 0.12 })
	const tick = kit.box('tick', [0.03, 0.07, 0.01])
	for (let index = 0; index < TICKS; index += 1) {
		const angle = (index / TICKS) * TURN
		kit.mesh(tick, 'detail', { parent: clock, x: Math.sin(angle) * 0.35, y: Math.cos(angle) * 0.35, z: 0.128, rz: -angle })
	}
}

function buildHands(kit: ModelKit, clock: Group): Group[] {
	const hour = kit.group('hour', { parent: clock, z: 0.134 })
	const minute = kit.group('minute', { parent: clock, z: 0.14 })
	kit.mesh(kit.box('hour', [0.045, 0.22, 0.012]), 'detail', { parent: hour, y: 0.09 })
	kit.mesh(kit.box('minute', [0.03, 0.33, 0.012]), 'detail', { parent: minute, y: 0.14 })
	kit.mesh(kit.cylinder('pin', [0.035, 0.035, 0.02], 16), 'light', { parent: clock, z: 0.146, rx: Math.PI / 2 })
	return [hour, minute]
}

function buildBells(kit: ModelKit, clock: Group): void {
	;[-1, 1].forEach(side => {
		const bell = kit.mesh(kit.sphere('bell', 0.15, 14), 'metal', { parent: clock, x: side * 0.3, y: 0.44, rz: -side * 0.6 })
		bell.scale.set(1, 0.7, 1)
		kit.mesh(kit.box('foot', [0.06, 0.2, 0.06]), 'body', { parent: clock, x: side * 0.3, y: -0.48, rz: side * 0.5 })
	})
	kit.mesh(kit.box('knob', [0.06, 0.1, 0.06]), 'body', { parent: clock, y: 0.53 })
}

/** `clock`: корпус `accent`, циферблат `body` с делениями и стрелками `detail`, колокольчики `metal`; `spin` — часовая и минутная стрелки по обороту */
export function buildClock(_node: Model3DNode, context: Model3DContext) {
	const kit = createKit('clock', context)
	const clock = kit.group('clock', { y: 0.64 })
	buildFace(kit, clock)
	const [hour, minute] = buildHands(kit, clock)
	buildBells(kit, clock)
	const spin = (progress: number): void => {
		const turn = TURN * easeInOut(progress)
		minute.rotation.z = -turn * 2
		hour.rotation.z = HOUR_REST - turn
	}
	spin(0)
	return kit.finish({ anchor: new Vector3(0, 1.28, 0), animations: { spin } })
}
