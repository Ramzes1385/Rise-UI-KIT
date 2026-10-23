import { Color } from 'three'
import type { Material, Object3D } from 'three'
import { fakeLoop, node } from './modelsTestKit'
import { MODEL3D_LIBRARY } from '../../models/library'
import { resolveScenePalette } from '../../theme/scenePalette'
import { createResourceCache } from '../../scene/resourceCache'
import { createModelBank } from '../../models/runtime/modelBank'
import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from 'three'
import type { Model3DRegistryOptions } from '../../types/internal/model3dInternal.types'
import type { Model3DContext, Model3DInstance, Model3DNode } from '../../types/model3d.types'
import type { Model3DBuildScope, Model3DBuildTarget } from '../../types/internal/model3dRuntime.types'

export function makeOptions(extra: Partial<Model3DRegistryOptions> = {}): Model3DRegistryOptions {
	const resolveColor = () => new Color('#3366aa')
	return {
		cache: createResourceCache(),
		loop: fakeLoop(),
		resolveColor,
		getPalette: () => resolveScenePalette(resolveColor),
		cell: { width: 1.6, depth: 1.6, height: 1.2 },
		...extra,
	}
}

export function makeScope(extra: Partial<Model3DRegistryOptions> = {}): Model3DBuildScope {
	const options = makeOptions(extra)
	return { bank: createModelBank(options), options, library: MODEL3D_LIBRARY }
}

export function makeTarget(id = 'a', extra: Partial<Model3DBuildTarget> = {}): Model3DBuildTarget {
	return { id, node: node(id, id), modelId: id, geometryKeys: new Set(), materialKeys: new Set(), ...extra }
}

/** Простая модель для тестов: коробка `body` + мелкая деталь `light` в группе `lod-detail`, анимации из `animations` */
export function boxModel(
	animations: Model3DInstance['animations'] = {},
	extra: Partial<Model3DInstance> = {},
): (n: Model3DNode, ctx: Model3DContext) => Model3DInstance {
	return (_node, ctx) => {
		const object = new Group()
		const body = new Mesh(
			ctx.geometry('test:box', () => new BoxGeometry(1, 1, 1)),
			ctx.material('body'),
		)
		const detail = new Group()
		detail.name = 'lod-detail'
		const lamp = new Mesh(
			ctx.geometry('test:lamp', () => new BoxGeometry(0.1, 0.1, 0.1)),
			ctx.material('light'),
		)
		detail.add(lamp)
		object.add(body, detail)
		return { object, parts: { body: [body], light: [lamp] }, animations, ...extra }
	}
}

export function meshOf(object: Object3D): Mesh {
	let found: Mesh | null = null
	object.traverse(item => {
		if (!found && (item as Mesh).isMesh) found = item as Mesh
	})
	return found as unknown as Mesh
}

export function standard(material: Material | Material[]): MeshStandardMaterial {
	return material as MeshStandardMaterial
}

export const flush = async (): Promise<void> => {
	for (let index = 0; index < 5; index += 1) await Promise.resolve()
}
