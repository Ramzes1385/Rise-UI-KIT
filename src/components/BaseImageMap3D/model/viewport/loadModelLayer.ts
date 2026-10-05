import { warn } from '@/locales/warn'
import { UI_IMAGE_MAP_3D } from '@/locales/messages'
import { objectMeshName } from '../scene/sceneLayout'
import { disposeObject } from '../scene/disposeObject'
import { attachModel } from '../scene/gltf/attachModel'
import { loadLayerModel } from '../scene/gltf/layerModel'
import { isDevelopmentBuild } from '@utils/seo/structuredDataUtils'
import type { SceneModelJob } from '../../types/internal/imageMap3dInternal.types'

function warnObjects(job: SceneModelJob, ids: string[], message: string): void {
	const objects = isDevelopmentBuild() ? job.data.objects.filter(object => ids.includes(object.id)) : []
	objects.forEach(object => warn(message, { layer: job.layer.id, name: objectMeshName(object), id: object.id }))
}

export async function loadModelLayer(job: SceneModelJob): Promise<void> {
	const { layer, signal } = job
	const root = await loadLayerModel(job.model, job.configure).catch((error: unknown) => {
		if (signal.aborted) return null
		if (isDevelopmentBuild()) warn(UI_IMAGE_MAP_3D.MODEL_LOAD_FAILED, { layer: layer.id, url: job.model.url, error: String(error) })
		job.onError(error)
		return null
	})
	if (!root) return
	if (signal.aborted) {
		disposeObject(root)
		return
	}
	const result = attachModel(job.content, { data: job.data, layerId: layer.id, root }, job.resolve)
	warnObjects(job, result.missing, UI_IMAGE_MAP_3D.MODEL_NODE_MISSING)
	warnObjects(job, result.shared, UI_IMAGE_MAP_3D.MODEL_NODE_SHARED)
	job.onUpdate()
}
