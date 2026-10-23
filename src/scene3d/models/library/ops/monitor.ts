/** Утилиты: модель `monitor` — монитор с линией пульса (мониторинг); анимация `blink` — линия вспыхивает и гаснет */

import { Vector3 } from 'three'
import type { Group } from 'three'
import { buildDisplay } from './analytics'
import { createKit, pulseWindow } from '../parts'
import type { ModelKit } from '../../../types/internal/model3dRuntime.types'
import type { Model3DContext, Model3DNode } from '../../../types/model3d.types'

const WAVE = [
	[-0.55, 0],
	[-0.35, 0],
	[-0.25, 0.18],
	[-0.15, -0.14],
	[-0.05, 0.3],
	[0.05, -0.2],
	[0.15, 0],
	[0.35, 0],
	[0.55, 0.06],
] as const

function buildWave(kit: ModelKit, display: Group): Group {
	const wave = kit.group('wave', { parent: display, z: 0.06 })
	for (let index = 1; index < WAVE.length; index += 1) {
		const [fromX, fromY] = WAVE[index - 1]
		const [toX, toY] = WAVE[index]
		const length = Math.hypot(toX - fromX, toY - fromY)
		const placement = { parent: wave, x: (fromX + toX) / 2, y: (fromY + toY) / 2, rz: Math.atan2(toY - fromY, toX - fromX) }
		kit.mesh(kit.box('segment', [length + 0.02, 0.03, 0.02]), 'light', placement)
	}
	return wave
}

/** `monitor`: экран `screen` с линией пульса `light` и сеткой `detail`; `blink` — линия вытягивается по высоте и возвращается */
export function buildMonitor(_node: Model3DNode, context: Model3DContext) {
	const kit = createKit('monitor', context)
	const display = buildDisplay(kit)
	;[-0.25, 0.25].forEach(y => kit.mesh(kit.box('grid', [1.2, 0.01, 0.01]), 'detail', { parent: display, y, z: 0.058 }))
	const wave = buildWave(kit, display)
	const blink = (progress: number): void => {
		wave.scale.y = 1 + 0.45 * pulseWindow(progress, [0, 0.2, 0.4, 0.6]) + 0.25 * pulseWindow(progress, [0.6, 0.75, 0.85, 1])
	}
	return kit.finish({ anchor: new Vector3(0, 1.36, 0), animations: { blink } })
}
