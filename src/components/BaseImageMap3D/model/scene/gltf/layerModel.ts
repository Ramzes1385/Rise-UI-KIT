import type { Object3D } from 'three'
import { MathUtils, PropertyBinding } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import type { ImageMapLayerModel } from '../../../types/imageMap3dData.types'

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)

export function placeModel(root: Object3D, model: ImageMapLayerModel): Object3D {
	root.scale.setScalar(isNumber(model.scale) && model.scale > 0 ? model.scale : 1)
	if (Array.isArray(model.position) && model.position.length === 3 && model.position.every(isNumber))
		root.position.fromArray(model.position)
	if (isNumber(model.rotationY)) root.rotation.y = MathUtils.degToRad(model.rotationY)
	return root
}

export async function loadLayerModel(model: ImageMapLayerModel, configure?: (loader: GLTFLoader) => void): Promise<Object3D> {
	const loader = new GLTFLoader()
	configure?.(loader)
	const gltf = await loader.loadAsync(model.url)
	return placeModel(gltf.scene, model)
}

export function findModelNode(root: Object3D, name: string): Object3D | undefined {
	return root.getObjectByName(name) ?? root.getObjectByName(PropertyBinding.sanitizeNodeName(name))
}
