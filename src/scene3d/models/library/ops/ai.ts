/** Утилиты: модель `ai` — чип на плате с «нейросетью» над ним (искусственный интеллект); анимация `think` — узлы сети по очереди вспыхивают */

import { Vector3 } from 'three'
import { createKit } from '../parts'
import type { Group, Mesh } from 'three'
import type { ModelKit } from '../../../types/internal/model3dRuntime.types'
import type { Model3DContext, Model3DNode } from '../../../types/model3d.types'

const LAYERS = [3, 4, 2] as const
const PINS = 5

function buildBoard(kit: ModelKit): void {
	kit.mesh(kit.slab('board', [1.16, 1.16, 0.04], { radius: 0.14, bevel: 0.01 }), 'body')
	kit.mesh(kit.slab('chip', [0.88, 0.88, 0.12], { radius: 0.08, bevel: 0.015 }), 'detail', { y: 0.04 })
	kit.mesh(kit.slab('core', [0.46, 0.46, 0.05], { radius: 0.06, bevel: 0.01 }), 'accent', { y: 0.16 })
	const pin = kit.box('pin', [0.07, 0.03, 0.14])
	const side = kit.box('side-pin', [0.14, 0.03, 0.07])
	for (let index = 0; index < PINS; index += 1) {
		const offset = -0.32 + index * 0.16
		;[-0.5, 0.5].forEach(edge => {
			kit.mesh(pin, 'metal', { x: offset, y: 0.06, z: edge, detail: true })
			kit.mesh(side, 'metal', { x: edge, y: 0.06, z: offset, detail: true })
		})
	}
}

function neuronPoints(): Array<{ layer: number; at: Vector3 }> {
	return LAYERS.flatMap((count, layer) =>
		Array.from({ length: count }, (_item, row) => ({ layer, at: new Vector3(-0.42 + layer * 0.42, (row - (count - 1) / 2) * 0.2, 0) })),
	)
}

function buildLinks(kit: ModelKit, network: Group, points: ReturnType<typeof neuronPoints>): void {
	points.forEach(from =>
		points
			.filter(to => to.layer === from.layer + 1)
			.forEach(to => {
				const delta = to.at.clone().sub(from.at)
				const middle = from.at.clone().add(to.at).multiplyScalar(0.5)
				const link = kit.box('link', [0.012, delta.length(), 0.012])
				kit.mesh(link, 'detail', { parent: network, x: middle.x, y: middle.y, rz: Math.atan2(-delta.x, delta.y) })
			}),
	)
}

/** `ai`: плата `body`, чип `detail` с ядром `accent` и выводами `metal`; над ним сеть из 9 узлов `body`/`accent`; `think` — волна пульса по слоям */
export function buildAi(_node: Model3DNode, context: Model3DContext) {
	const kit = createKit('ai', context)
	buildBoard(kit)
	const network = kit.group('network', { y: 0.78 })
	const points = neuronPoints()
	const neurons: Mesh[] = points.map(({ layer, at }) =>
		kit.mesh(kit.sphere('neuron', 0.055, 8), layer === 1 ? 'accent' : 'body', { parent: network, x: at.x, y: at.y }),
	)
	buildLinks(kit, network, points)
	const think = (progress: number): void => {
		const envelope = Math.sin(progress * Math.PI)
		neurons.forEach((neuron, index) => {
			const wave = Math.max(0, Math.sin(progress * Math.PI * 4 - points[index].layer * 1.3))
			neuron.scale.setScalar(1 + 0.45 * wave * wave * envelope)
		})
	}
	return kit.finish({ anchor: new Vector3(0, 1.12, 0), animations: { think } })
}
