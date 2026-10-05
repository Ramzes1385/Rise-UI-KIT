import { warn } from '@/locales/warn'
import { UI_IMAGE_MAP_3D } from '@/locales/messages'
import { objectMeshName } from '../scene/sceneLayout'
import { disposeObject } from '../scene/disposeObject'
import { attachModel } from '../scene/gltf/attachModel'
import { loadLayerModel } from '../scene/gltf/layerModel'
import { isDevelopmentBuild } from '@utils/seo/structuredDataUtils'
import type { SceneModelJob } from '../../types/internal/imageMap3dInternal.types'

function warnMissing(job: SceneModelJob, missing: string[]): void {
	const objects = isDevelopmentBuild() ? job.data.objects.filter(object => missing.includes(object.id)) : []
	objects.forEach(object =>
		warn(UI_IMAGE_MAP_3D.MODEL_NODE_MISSING, { layer: job.layer.id, name: objectMeshName(object), id: object.id }),
	)
}

export async function loadModelLayer(job: SceneModelJob): Promise<void> {
	const { layer, signal } = job
	const root = await loadLayerModel(job.model, job.configure).catch((error: unknown) => {
		if (!signal.aborted) job.onError(error)
		return null
	})
	if (!root) return
	if (signal.aborted) {
		disposeObject(root)
		return
	}
	warnMissing(job, attachModel(job.content, { data: job.data, layerId: layer.id, root }, job.resolve))
	job.onUpdate()
}
