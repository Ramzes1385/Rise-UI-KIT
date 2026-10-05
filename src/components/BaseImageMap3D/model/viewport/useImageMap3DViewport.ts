import { Scene } from 'three'
import { useRenderLoop } from './useRenderLoop'
import { sceneExtent } from '../scene/sceneCamera'
import { disposeObject } from '../scene/disposeObject'
import { onBeforeUnmount, shallowRef, watch } from 'vue'
import { createViewCamera, fitViewCamera } from '../camera/cameraPose'
import type { ImageMap3DViewportOptions } from '../../types/internal/imageMap3dInternal.types'

const MAX_PIXEL_RATIO = 2

export function useImageMap3DViewport(options: ImageMap3DViewportOptions) {
	const scene = new Scene()
	const camera = shallowRef(createViewCamera(options.getCameraKind()))
	const { renderer, invalidate, release, onFrame } = useRenderLoop(scene, () => camera.value)
	let observer: ResizeObserver | null = null

	function resize(width: number, height: number): void {
		if (!renderer.value || width <= 0 || height <= 0) return
		renderer.value.setSize(width, height, false)
		fitViewCamera(camera.value, { width, height }, sceneExtent(options.getData()))
		invalidate()
	}

	function start(canvas: HTMLCanvasElement, host: HTMLElement): void {
		try {
			renderer.value = options.getFactory()(canvas)
		} catch (error) {
			options.onError(error)
			return
		}
		renderer.value.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO))
		observer = new ResizeObserver(([entry]) => resize(entry.contentRect.width, entry.contentRect.height))
		observer.observe(host)
		resize(host.clientWidth, host.clientHeight)
	}

	function stop(): void {
		observer?.disconnect()
		observer = null
		disposeObject(scene)
		release()
	}

	watch(
		options.canvasRef,
		canvas => {
			stop()
			if (canvas && options.hostRef.value) start(canvas, options.hostRef.value)
		},
		{ flush: 'post' },
	)

	const refit = () => resize(options.hostRef.value?.clientWidth ?? 0, options.hostRef.value?.clientHeight ?? 0)

	watch(options.getData, refit)

	watch(options.getCameraKind, kind => {
		camera.value = createViewCamera(kind)
		refit()
	})

	onBeforeUnmount(stop)

	return { scene, camera, renderer, invalidate, onFrame }
}
