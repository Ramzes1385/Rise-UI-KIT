/** Утилиты: модель `window` — окно браузера с заголовком, строками и подставкой (фигура пьедестала «основы веба») */

import { Vector3 } from 'three'
import { createKit } from '../parts'
import type { ModelKit } from '../../../types/internal/model3dRuntime.types'
import type { Model3DContext, Model3DNode } from '../../../types/model3d.types'

function buildContent(kit: ModelKit, window: ReturnType<ModelKit['group']>): void {
	;[-0.44, -0.355, -0.27].forEach(x => kit.mesh(kit.sphere('dot', 0.03, 8), 'light', { parent: window, x, y: 0.31, z: 0.06 }))
	kit.mesh(kit.box('line-long', [0.5, 0.055, 0.03]), 'detail', { parent: window, x: 0.13, y: 0.07, z: 0.04 })
	kit.mesh(kit.box('line-short', [0.36, 0.055, 0.03]), 'detail', { parent: window, x: 0.06, y: -0.05, z: 0.04 })
	kit.mesh(kit.box('picture', [0.26, 0.24, 0.03]), 'accent', { parent: window, x: -0.33, y: -0.02, z: 0.04 })
}

/** `window`: панель `body`, заголовок `accent` с точками `light`, строки `detail` и картинка `accent`; ножка и основание `body` */
export function buildWindow(_node: Model3DNode, context: Model3DContext) {
	const kit = createKit('window', context)
	const window = kit.group('window', { y: 0.62, rx: -0.08 })
	kit.mesh(kit.slab('panel', [1.08, 0.78, 0.06], { radius: 0.09, bevel: 0.02 }), 'body', { parent: window, z: -0.03, rx: Math.PI / 2 })
	kit.mesh(kit.slab('title', [1.08, 0.17, 0.07], { radius: 0.06, bevel: 0.02 }), 'accent', {
		parent: window,
		y: 0.31,
		z: -0.02,
		rx: Math.PI / 2,
	})
	buildContent(kit, window)
	kit.mesh(kit.cylinder('stem', [0.035, 0.05, 0.22], 12), 'body', { y: 0.12 })
	kit.mesh(kit.cylinder('base', [0.2, 0.22, 0.04], 20), 'body', { y: 0.02 })
	return kit.finish({ anchor: new Vector3(0, 1.1, 0) })
}
