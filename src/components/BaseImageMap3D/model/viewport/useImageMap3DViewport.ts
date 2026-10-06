import { Scene } from 'three'
import { watchContext } from './watchContext'
import { useRenderLoop } from './useRenderLoop'
import { sceneFrame } from '../scene/sceneFrame'
import { disposeObject } from '../scene/disposeObject'
import { onBeforeUnmount, shallowRef, watch } from 'vue'
import { createViewCamera, fitViewCamera } from '../camera/cameraPose'
import type { ImageMap3DRenderer } from '../../types/BaseImageMap3D.types'
import type { ImageMap3DViewportOptions } from '../../types/internal/imageMap3dInternal.types'

const MAX_PIXEL_RATIO = 2

function openRenderer(options: ImageMap3DViewportOptions, canvas: HTMLCanvasElement): ImageMap3DRenderer | null {
	try {
		const renderer = options.getFactory()(canvas)
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO))
		return renderer
	} catch (error) {
		options.onError(error)
		return null
	}
}

export function useImageMap3DViewport(options: ImageMap3DViewportOptions) {
	const scene = new Scene()
	const camera = shallowRef(createViewCamera(options.getCameraKind()))
	const { renderer, invalidate, release, onFrame } = useRenderLoop(scene, () => camera.value)
	const disposers: Array<() => void> = []

	function resize(width: number, height: number): void {
		if (!renderer.value || width <= 0 || height <= 0) return
		renderer.value.setSize(width, height, false)
		fitViewCamera(camera.value, { width, height }, { frame: sceneFrame(options.getData()), mode: options.getLayerMode() })
		invalidate()
	}

	function start(canvas: HTMLCanvasElement, host: HTMLElement): void {
		renderer.value = openRenderer(options, canvas)
		if (!renderer.value) return
		const observer = new ResizeObserver(([entry]) => resize(entry.contentRect.width, entry.contentRect.height))
		observer.observe(host)
		disposers.push(
			() => observer.disconnect(),
			watchContext(renderer.value.domElement, {
				onRestore: invalidate,
				onFail: () => options.onError(new Error('WebGL context lost')),
			}),
		)
		resize(host.clientWidth, host.clientHeight)
	}

	function stop(): void {
		disposers.splice(0).forEach(dispose => dispose())
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

	watch([options.getData, options.getLayerMode], refit)

	watch(options.getCameraKind, kind => {
		camera.value = createViewCamera(kind)
		refit()
	})

	onBeforeUnmount(stop)

	return { scene, camera, renderer, invalidate, onFrame }
}
