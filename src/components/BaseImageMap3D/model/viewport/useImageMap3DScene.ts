import { Box3 } from 'three'
import { useSceneTheme } from './useSceneTheme'
import { useLayerLoads } from './load/useLayerLoads'
import { disposeObject } from '../scene/disposeObject'
import { loadModelLayer } from './load/loadModelLayer'
import { buildSceneContent } from '../scene/buildScene'
import { onBeforeUnmount, shallowRef, watch } from 'vue'
import { loadLayerSurface } from './load/loadLayerSurface'
import { createColorResolver } from '../scene/materials/sceneColors'
import { applyLayerMode, applyObjectStates, recolorScene } from '../scene/sceneState'
import type {
	LayerLoads,
	SceneContent,
	SceneObjectEntry,
	SceneOptions,
	SceneSurfaceJob,
} from '../../types/internal/imageMap3dInternal.types'

function recolor(options: SceneOptions, content: SceneContent | null): void {
	const host = options.hostRef.value
	if (!content || !host) return
	recolorScene(content, options.getData(), createColorResolver(host))
	options.invalidate()
}

function startLoads(options: SceneOptions, job: Omit<SceneSurfaceJob, 'layer' | 'floor' | 'onFailure'>, loads: LayerLoads): void {
	job.data.layers.forEach(layer => {
		const floor = job.content.layers.get(layer.id)?.floorMaterials[1]
		if (floor) {
			const onFailure = () => loads.fail(layer.id, job.signal)
			loads.track(job.signal, loadLayerSurface({ ...job, layer, floor, onFailure }))
		} else if (layer.model) {
			const onBounds = (bounds: Box3) => {
				options.modelBounds.value = [...options.modelBounds.value, bounds]
			}
			const model = {
				...job,
				layer,
				model: layer.model,
				configure: options.getConfigureLoader(),
				onError: options.onModelError,
				onBounds,
			}
			loads.track(job.signal, loadModelLayer(model))
		}
	})
}

function objectBox(content: SceneContent | null, id: string): Box3 | null {
	const entry = content?.objects.get(id)
	return content && entry ? meshesBox(content, entry) : null
}

function meshesBox(content: SceneContent, entry: SceneObjectEntry): Box3 | null {
	content.root.updateMatrixWorld(true)
	const box = new Box3()
	entry.meshes.forEach(mesh => box.expandByObject(mesh))
	return box.isEmpty() ? null : box
}

export function useImageMap3DScene(options: SceneOptions) {
	const content = shallowRef<SceneContent | null>(null)
	const loads = useLayerLoads()
	let controller: AbortController | null = null

	function clear(): void {
		controller?.abort()
		controller = null
		loads.reset()
		if (options.modelBounds.value.length) options.modelBounds.value = []
		if (!content.value) return
		options.scene.remove(content.value.root)
		disposeObject(content.value.root)
		content.value = null
	}

	function applyState(): void {
		if (!content.value) return
		applyLayerMode(content.value, options.getLayerId(), options.getLayerMode())
		applyObjectStates(content.value, { hover: options.getHover(), active: options.getActive(), hidden: options.getHidden() })
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
		startLoads(options, { content: built, data, resolve, signal: controller.signal, onUpdate: applyState }, loads)
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

	watch([options.getLayerId, options.getLayerMode, options.getActive, options.getHover, options.getHidden], applyState)

	onBeforeUnmount(clear)

	useSceneTheme(() => recolor(options, content.value))

	return {
		content,
		objectBox: (id: string) => objectBox(content.value, id),
		isLoading: loads.isLoading,
		failedLayerIds: loads.failedLayerIds,
	}
}
