/** Утилиты: модель `book` — стоящая книга с обложкой, блоком страниц, закладкой и надписью; запасная модель роадмапа */

import { Vector3 } from 'three'
import { createKit } from '../parts'
import type { Model3DContext, Model3DNode } from '../../../types/model3d.types'

/** `book`: обложки и корешок `accent`, блок страниц `body`, надпись `detail`, закладка `light`; повёрнута на 0,35 рад к зрителю */
export function buildBook(_node: Model3DNode, context: Model3DContext) {
	const kit = createKit('book', context)
	const book = kit.group('book', { y: 0.54, ry: -0.35 })
	const cover = kit.box('cover', [0.8, 1.04, 0.04])
	kit.mesh(cover, 'accent', { parent: book, z: -0.1 })
	kit.mesh(cover, 'accent', { parent: book, z: 0.1 })
	kit.mesh(kit.box('spine', [0.06, 1.04, 0.24]), 'accent', { parent: book, x: -0.37 })
	kit.mesh(kit.box('pages', [0.7, 0.98, 0.16]), 'body', { parent: book, x: 0.03 })
	kit.mesh(kit.box('title', [0.42, 0.14, 0.012]), 'detail', { parent: book, x: 0.02, y: 0.28, z: 0.126 })
	kit.mesh(kit.box('subtitle', [0.28, 0.05, 0.012]), 'body', { parent: book, x: -0.05, y: 0.1, z: 0.126 })
	kit.mesh(kit.box('ribbon', [0.05, 0.3, 0.012]), 'light', { parent: book, x: 0.22, y: -0.62, z: 0.1 })
	return kit.finish({ anchor: new Vector3(0, 1.1, 0) })
}
