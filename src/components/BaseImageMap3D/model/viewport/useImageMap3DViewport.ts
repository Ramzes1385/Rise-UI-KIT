import { Scene } from 'three'
import { onBeforeUnmount, watch } from 'vue'
import { useRenderLoop } from './useRenderLoop'
import { disposeObject } from '../scene/disposeObject'
import { createCamera, fitCamera, placeCamera, sceneExtent } from '../scene/sceneCamera'
import type { ImageMap3DViewportOptions } from '../../types/internal/imageMap3dInternal.types'

const MAX_PIXEL_RATIO = 2

export function useImageMap3DViewport(options: ImageMap3DViewportOptions) {
	const scene = new Scene()
	const camera = createCamera()
	const { renderer, invalidate, release } = useRenderLoop(scene, camera)
	let observer: ResizeObserver | null = null

	function resize(width: number, height: number): void {
		if (!renderer.value || width <= 0 || height <= 0) return
		renderer.value.setSize(width, height, false)
		fitCamera(camera, { width, height }, sceneExtent(options.getData()))
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
		placeCamera(camera, options.getData())
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

	watch(options.getData, () => {
		placeCamera(camera, options.getData())
		resize(options.hostRef.value?.clientWidth ?? 0, options.hostRef.value?.clientHeight ?? 0)
	})

	onBeforeUnmount(stop)

	return { scene, camera, renderer, invalidate }
}
