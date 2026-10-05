import { useSceneTheme } from './useSceneTheme'
import { loadModelLayer } from './loadModelLayer'
import { loadLayerSurface } from './loadLayerSurface'
import { disposeObject } from '../scene/disposeObject'
import { buildSceneContent } from '../scene/buildScene'
import { onBeforeUnmount, shallowRef, watch } from 'vue'
import { setObjectState } from '../scene/materials/sceneObjects'
import { applyLayerMode, recolorScene } from '../scene/sceneState'
import { createColorResolver } from '../scene/materials/sceneColors'
import type { SceneContent, SceneOptions, SceneSurfaceJob } from '../../types/internal/imageMap3dInternal.types'

function recolor(options: SceneOptions, content: SceneContent | null): void {
	const host = options.hostRef.value
	if (!content || !host) return
	recolorScene(content, options.getData(), createColorResolver(host))
	options.invalidate()
}

function startLoads(options: SceneOptions, job: Omit<SceneSurfaceJob, 'layer' | 'floor'>): void {
	job.data.layers.forEach(layer => {
		const floor = job.content.layers.get(layer.id)?.floorMaterials[1]
		if (floor) void loadLayerSurface({ ...job, layer, floor })
		else if (layer.model)
			void loadModelLayer({
				...job,
				layer,
				model: layer.model,
				configure: options.getConfigureLoader(),
				onError: options.onModelError,
			})
	})
}

export function useImageMap3DScene(options: SceneOptions) {
	const content = shallowRef<SceneContent | null>(null)
	let controller: AbortController | null = null

	function clear(): void {
		controller?.abort()
		controller = null
		if (!content.value) return
		options.scene.remove(content.value.root)
		disposeObject(content.value.root)
		content.value = null
	}

	function applyState(): void {
		if (!content.value) return
		applyLayerMode(content.value, options.getLayerId(), options.getLayerMode())
		content.value.objects.forEach(entry => setObjectState(content.value as SceneContent, entry.id, 'base'))
		const active = options.getActive()
		if (active) setObjectState(content.value, active, 'active')
		options.invalidate()
	}

	function build(host: HTMLElement): void {
		const data = options.getData()
		const resolve = createColorResolver(host)
		const built = buildSceneContent(data, resolve)
		controller = new AbortController()
		content.value = built
		options.scene.add(built.root)
		applyState()
		startLoads(options, { content: built, data, resolve, signal: controller.signal, onUpdate: applyState })
	}

	watch(
		[options.renderer, options.getData],
		([renderer]) => {
			clear()
			const host = options.hostRef.value
			if (renderer && host) build(host)
		},
		{ flush: 'post' },
	)

	watch([options.getLayerId, options.getLayerMode, options.getActive], applyState)

	onBeforeUnmount(clear)

	useSceneTheme(() => recolor(options, content.value))

	return { content, clear }
}
