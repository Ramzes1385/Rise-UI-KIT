/** Утилиты: модель `analytics` — монитор с гистограммой на подставке (аналитика); общий монитор для `monitor`; анимация `pulse` — столбцы по очереди тянутся вверх */

import { Vector3 } from 'three'
import type { Group } from 'three'
import { clamp01, createKit, pulseWindow } from '../parts'
import type { ModelKit } from '../../../types/internal/model3dRuntime.types'
import type { Model3DContext, Model3DNode } from '../../../types/model3d.types'

const BARS = [0.22, 0.34, 0.28, 0.5, 0.42, 0.62] as const
const BAR_STEP = 0.2
const FLOOR_Y = -0.3

/** Подставка и корпус монитора с экраном `screen`; возвращает группу дисплея, в неё кладётся содержимое экрана */
export function buildDisplay(kit: ModelKit): Group {
	kit.mesh(kit.slab('stand', [0.62, 0.44, 0.05], { radius: 0.1, bevel: 0.015 }), 'body')
	kit.mesh(kit.box('neck', [0.1, 0.38, 0.07]), 'body', { y: 0.22, z: -0.04 })
	const display = kit.group('display', { y: 0.84, rx: -0.08 })
	kit.mesh(kit.slab('bezel', [1.44, 0.92, 0.07], { radius: 0.07, bevel: 0.015 }), 'body', { parent: display, z: -0.035, rx: Math.PI / 2 })
	kit.mesh(kit.box('screen', [1.32, 0.8, 0.01]), 'screen', { parent: display, z: 0.052 })
	return display
}

function buildBars(kit: ModelKit, display: Group): Group[] {
	return BARS.map((height, index) => {
		const bar = kit.group('bar', { parent: display, x: -0.5 + index * BAR_STEP, y: FLOOR_Y, z: 0.06 })
		kit.mesh(kit.box('bar', [0.13, height, 0.03]), index === BARS.length - 1 ? 'light' : 'accent', { parent: bar, y: height / 2 })
		return bar
	})
}

/** `analytics`: монитор с гистограммой — столбцы `accent`, последний `light`, ось `detail`; `pulse` — волна роста столбцов */
export function buildAnalytics(_node: Model3DNode, context: Model3DContext) {
	const kit = createKit('analytics', context)
	const display = buildDisplay(kit)
	kit.mesh(kit.box('axis', [1.2, 0.025, 0.02]), 'detail', { parent: display, y: FLOOR_Y, z: 0.06 })
	const bars = buildBars(kit, display)
	const pulse = (progress: number): void => {
		bars.forEach((bar, index) => {
			const start = clamp01(index * 0.1)
			bar.scale.y = 1 + 0.3 * pulseWindow(progress, [start, start + 0.15, start + 0.3, start + 0.45])
		})
	}
	return kit.finish({ anchor: new Vector3(0, 1.36, 0), animations: { pulse } })
}
