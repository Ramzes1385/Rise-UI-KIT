import type { Object3D } from 'three'
import { disposeObject } from './disposeObject'
import { MathUtils, PropertyBinding } from 'three'
import { clone } from 'three/addons/utils/SkeletonUtils.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import type { Scene3DLoadedModel, Scene3DModelPlacement } from '../types/internal/scene3dInternal.types'

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)

export function placeModel(root: Object3D, model: Scene3DModelPlacement): Object3D {
	root.scale.setScalar(isNumber(model.scale) && model.scale > 0 ? model.scale : 1)
	if (Array.isArray(model.position) && model.position.length === 3 && model.position.every(isNumber))
		root.position.fromArray(model.position)
	if (isNumber(model.rotationY)) root.rotation.y = MathUtils.degToRad(model.rotationY)
	return root
}

async function loadGltf(url: string, configure?: (loader: GLTFLoader) => void): Promise<Scene3DLoadedModel> {
	const loader = new GLTFLoader()
	configure?.(loader)
	const gltf = await loader.loadAsync(url)
	return { object: gltf.scene, clips: gltf.animations ?? [] }
}

export async function loadLayerModel(
	model: Scene3DModelPlacement & { url: string },
	configure?: (loader: GLTFLoader) => void,
): Promise<Object3D> {
	return placeModel((await loadGltf(model.url, configure)).object, model)
}

export function findModelNode(root: Object3D, name: string): Object3D | undefined {
	return root.getObjectByName(name) ?? root.getObjectByName(PropertyBinding.sanitizeNodeName(name))
}

/** Библиотека моделей компонента: каждый адрес грузится один раз, узлам отдаются клоны (со скелетами) */
export function createModelLibrary(configure?: (loader: GLTFLoader) => void) {
	const originals = new Map<string, Promise<Scene3DLoadedModel>>()

	return {
		/** Клон модели по адресу и клипы файла: `{ object, clips }`. Геометрии и материалы клона общие с оригиналом (их освобождает `dispose` библиотеки), клипы общие для всех клонов (для `AnimationMixer(object)` годятся как есть); повторный вызов не грузит файл заново. Ошибка загрузки не кешируется */
		async load(url: string): Promise<Scene3DLoadedModel> {
			let original = originals.get(url)
			if (!original) {
				original = loadGltf(url, configure)
				originals.set(url, original)
				original.catch(() => originals.delete(url))
			}
			const loaded = await original
			return { object: clone(loaded.object), clips: loaded.clips }
		},
		/** Освободить оригиналы; клоны освобождают их владельцы */
		async dispose(): Promise<void> {
			const loaded = await Promise.allSettled([...originals.values()])
			originals.clear()
			loaded.forEach(result => result.status === 'fulfilled' && disposeObject(result.value.object))
		},
	}
}
