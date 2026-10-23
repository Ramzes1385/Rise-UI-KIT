/** Утилиты: модель `gear` — шестерня со ступицей на оси (фигура пьедестала «инструменты»); анимация `spin` — оборот шестерни */

import { upright } from '../upright'
import { Path, Shape, Vector3 } from 'three'
import { createKit, easeInOut } from '../parts'
import type { Model3DContext, Model3DNode } from '../../../types/model3d.types'

const TEETH = 10
const STEPS = 4

function gearShape(): Shape {
	const shape = new Shape()
	for (let step = 0; step <= TEETH * STEPS; step += 1) {
		const angle = (step / (TEETH * STEPS)) * Math.PI * 2
		const radius = step % STEPS === 1 || step % STEPS === 2 ? 0.46 : 0.36
		if (step === 0) shape.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
		else shape.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
	}
	const hole = new Path()
	hole.absarc(0, 0, 0.14, 0, Math.PI * 2, true)
	shape.holes.push(hole)
	return shape
}

/** `gear`: зубчатое колесо `body` с отверстием и ступицей `accent`; `spin` — полный оборот колеса вокруг оси */
export function buildGear(_node: Model3DNode, context: Model3DContext) {
	const kit = createKit('gear', context)
	const wheel = kit.group('wheel', { y: 0.6 })
	upright(kit, gearShape(), { name: 'gear', depth: 0.16, bevel: 0.025, part: 'body', parent: wheel })
	kit.mesh(kit.cylinder('hub', [0.09, 0.09, 0.24], 18), 'accent', { y: 0.6, rx: Math.PI / 2 })
	const spin = (progress: number): void => {
		wheel.rotation.z = Math.PI * 2 * easeInOut(progress)
	}
	return kit.finish({ anchor: new Vector3(0, 1.1, 0), animations: { spin } })
}
