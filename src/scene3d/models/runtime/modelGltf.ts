/** Утилиты: GLB-модели узлов — загрузка с кешем по адресу, клон, вписывание в клетку, окраска по ролям, клипы */

import type { Material, Mesh, Object3D } from 'three'
import { findModelNode } from '../../scene/gltfLoader'
import { Box3, Group, MathUtils, Vector3 } from 'three'
import { disposeObject } from '../../scene/disposeObject'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import type { Model3DGltfLoader, Model3DGltfSource } from '../../types/internal/model3dInternal.types'
import type { Model3DContext, Model3DGltfDefinition, Model3DInstance, Model3DPart } from '../../types/model3d.types'

/** Доля ширины клетки, которую занимает вписанная модель */
const FOOTPRINT_SHARE = 0.9

/** Загрузчик GLB компонента: каждый адрес грузится один раз, узлам отдаются клоны (со скелетами) и клипы; ошибка не кешируется */
export function createGltfLoader(configure?: (loader: GLTFLoader) => void): Model3DGltfLoader {
	const originals = new Map<string, Promise<GLTF>>()
	return {
		async load(url) {
			let original = originals.get(url)
			if (!original) {
				const loader = new GLTFLoader()
				configure?.(loader)
				original = loader.loadAsync(url)
				originals.set(url, original)
				original.catch(() => originals.delete(url))
			}
			const gltf = await original
			return { object: clone(gltf.scene), clips: gltf.animations }
		},
		async dispose() {
			const loaded = await Promise.allSettled([...originals.values()])
			originals.clear()
			loaded.forEach(result => result.status === 'fulfilled' && disposeObject(result.value.scene))
		},
	}
}

function meshesOf(object: Object3D): Mesh[] {
	const found: Mesh[] = []
	object.traverse(node => (node as Mesh).isMesh && found.push(node as Mesh))
	return found
}

function fitFootprint(wrapper: Group, object: Object3D, width: number): void {
	const box = new Box3().setFromObject(object)
	const size = box.getSize(new Vector3())
	const span = Math.max(size.x, size.z)
	if (span > 0) wrapper.scale.setScalar((width * FOOTPRINT_SHARE) / span)
	const center = box.getCenter(new Vector3())
	object.position.set(-center.x, -box.min.y, -center.z)
}

function paintByRole(object: Object3D, definition: Model3DGltfDefinition, context: Model3DContext): Model3DInstance['parts'] {
	const parts: Partial<Record<Model3DPart, Object3D[]>> = {}
	const claimed = new Set<Mesh>()
	const named = Object.entries(definition.parts ?? {}) as Array<[Model3DPart, string]>
	named.forEach(([part, name]) => {
		const node = findModelNode(object, name)
		const meshes = node ? meshesOf(node) : []
		meshes.forEach(mesh => {
			mesh.material = context.material(part) as Material
			claimed.add(mesh)
		})
		parts[part] = meshes
	})
	const rest = meshesOf(object).filter(mesh => !claimed.has(mesh))
	rest.forEach(mesh => (mesh.material = context.material('body')))
	parts.body = [...(parts.body ?? []), ...rest]
	return parts
}

/**
 * Модель из GLB: `fit: 'footprint'` — по ширине клетки, `rotationY`, `offset`, `scale`; `paint: 'state'` — материалы частей `parts`
 * заменены материалами кита, остальное окрашено как `body`; `keep` — материалы файла как есть
 */
export function gltfToInstance(source: Model3DGltfSource, definition: Model3DGltfDefinition, context: Model3DContext): Model3DInstance {
	const wrapper = new Group()
	wrapper.add(source.object)
	if ((definition.fit ?? 'footprint') === 'footprint') fitFootprint(wrapper, source.object, context.size.width)
	wrapper.scale.multiplyScalar(definition.scale ?? 1)
	wrapper.rotation.y = MathUtils.degToRad(definition.rotationY ?? 0)
	if (definition.offset) wrapper.position.fromArray(definition.offset)
	const outer = new Group()
	outer.add(wrapper)
	const parts = (definition.paint ?? 'state') === 'state' ? paintByRole(source.object, definition, context) : undefined
	return { object: outer, parts }
}
