import { addSvgObjects } from '../scene/sceneState'
import { setFloorTexture } from '../scene/geometry/floor'
import type { SceneSurfaceJob } from '../../types/internal/imageMap3dInternal.types'
import { loadLayerSvg, loadSvgTexture, loadTexture } from '../scene/materials/layerTexture'

async function floorTexture(job: SceneSurfaceJob, markup: string) {
	if (markup) return loadSvgTexture(markup, job.layer)
	return job.layer.image ? loadTexture(job.layer.image) : null
}

export async function loadLayerSurface(job: SceneSurfaceJob): Promise<void> {
	const { content, layer, signal } = job
	const markup = await loadLayerSvg(layer, signal).catch(() => '')
	if (signal.aborted) return
	if (markup) addSvgObjects(content, { data: job.data, layerId: layer.id, markup }, job.resolve)
	job.onUpdate()
	const texture = await floorTexture(job, markup).catch(() => null)
	if (!texture) return
	if (signal.aborted) {
		texture.dispose()
		return
	}
	setFloorTexture(job.floor, texture)
	job.onUpdate()
}
