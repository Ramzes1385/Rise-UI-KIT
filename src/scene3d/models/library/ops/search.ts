/** Утилиты: модель `search` — стопка листов с лупой над ними (поиск); анимация `scan` — лупа обходит стопку */

import { Vector3 } from 'three'
import type { Group } from 'three'
import { createKit } from '../parts'
import type { ModelKit } from '../../../types/internal/model3dRuntime.types'
import type { Model3DContext, Model3DNode } from '../../../types/model3d.types'

const LINES = [-0.22, -0.08, 0.06, 0.2]

function buildPapers(kit: ModelKit): void {
	const paper = kit.box('paper', [0.92, 0.04, 0.66])
	const line = kit.box('line', [0.62, 0.012, 0.03])
	;[0, 1, 2].forEach(index => {
		const card = kit.group('card', { x: -0.05 + index * 0.03, y: 0.02 + index * 0.05, z: index * 0.02, ry: (index - 1) * 0.1 })
		kit.mesh(paper, 'body', { parent: card })
		LINES.forEach(z => kit.mesh(line, 'detail', { parent: card, x: -0.08, y: 0.026, z }))
	})
}

function buildLens(kit: ModelKit): Group {
	const magnifier = kit.group('magnifier', { y: 0.62 })
	const lens = kit.group('lens', { parent: magnifier, rx: -1 })
	kit.mesh(kit.torus('ring', [0.28, 0.055]), 'accent', { parent: lens })
	kit.mesh(kit.cylinder('glass', [0.27, 0.27, 0.012]), 'glass', { parent: lens, rx: Math.PI / 2 })
	kit.mesh(kit.cylinder('handle', [0.055, 0.05, 0.42], 16), 'detail', { parent: lens, x: 0.33, y: -0.33, rz: Math.PI / 4 })
	return magnifier
}

/** `search`: три листа `body` со строками `detail`, лупа с оправой `accent` и стеклом `glass`; `scan` — круг лупы над стопкой с лёгким увеличением */
export function buildSearch(_node: Model3DNode, context: Model3DContext) {
	const kit = createKit('search', context)
	buildPapers(kit)
	const magnifier = buildLens(kit)
	const scan = (progress: number): void => {
		const angle = progress * Math.PI * 2
		magnifier.position.set(-0.05 + 0.13 * Math.cos(angle), 0.62, 0.02 + 0.1 * Math.sin(angle))
		magnifier.scale.setScalar(1 + 0.15 * Math.sin(progress * Math.PI))
	}
	scan(0)
	return kit.finish({ anchor: new Vector3(0, 1.08, 0), animations: { scan } })
}
