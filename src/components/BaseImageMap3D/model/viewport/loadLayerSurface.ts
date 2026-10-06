import { warn } from '@/locales/warn'
import { addSvgObjects } from '../scene/sceneState'
import { UI_IMAGE_MAP_3D } from '@/locales/messages'
import { setFloorTexture } from '../scene/geometry/floor'
import { isDevelopmentBuild } from '@utils/seo/structuredDataUtils'
import type { SceneSurfaceJob } from '../../types/internal/imageMap3dInternal.types'
import { loadLayerSvg, loadSvgTexture, loadTexture } from '../scene/materials/layerTexture'

async function floorTexture(job: SceneSurfaceJob, markup: string) {
	if (markup) return loadSvgTexture(markup, job.layer)
	return job.layer.image ? loadTexture(job.layer.image) : null
}

async function layerMarkup({ layer, signal }: SceneSurfaceJob): Promise<string> {
	const markup = await loadLayerSvg(layer, signal)
	if (!markup && (layer.svg || layer.svgUrl)) throw new Error('SVG')
	return markup
}

function failLayer(job: SceneSurfaceJob, error: unknown): void {
	if (job.signal.aborted) return
	if (isDevelopmentBuild()) warn(UI_IMAGE_MAP_3D.LAYER_LOAD_FAILED, { layer: job.layer.id, error: String(error) })
	job.onFailure()
}

export async function loadLayerSurface(job: SceneSurfaceJob): Promise<void> {
	const { content, layer, signal } = job
	try {
		const markup = await layerMarkup(job)
		if (signal.aborted) return
		if (markup) addSvgObjects(content, { data: job.data, layerId: layer.id, markup }, job.resolve)
		job.onUpdate()
		const texture = await floorTexture(job, markup)
		if (!texture) return
		if (signal.aborted) {
			texture.dispose()
			return
		}
		setFloorTexture(job.floor, texture)
		job.onUpdate()
	} catch (error) {
		failLayer(job, error)
	}
}
