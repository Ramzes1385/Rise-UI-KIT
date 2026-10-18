import { Scene } from 'three'
import { watchContext } from './watchContext'
import { useRenderLoop } from '../loop/useRenderLoop'
import { disposeObject } from '../scene/disposeObject'
import { createViewCamera } from '../camera/cameraPose'
import { onBeforeUnmount, shallowRef, watch } from 'vue'
import type { Scene3DRenderer } from '../types/scene3d.types'
import type { Scene3DViewportOptions } from '../types/internal/scene3dInternal.types'

const MAX_PIXEL_RATIO = 2

function openRenderer(options: Scene3DViewportOptions, canvas: HTMLCanvasElement): Scene3DRenderer | null {
	try {
		const renderer = options.getFactory()(canvas)
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO))
		return renderer
	} catch (error) {
		options.onError(error)
		return null
	}
}

export function useScene3DViewport(options: Scene3DViewportOptions) {
	const scene = new Scene()
	const camera = shallowRef(createViewCamera(options.getCameraKind()))
	const { renderer, invalidate, release, onFrame, animate, onBeforeRender } = useRenderLoop(scene, () => camera.value)
	const disposers: Array<() => void> = []
	const fitted = shallowRef(0)

	function resize(width: number, height: number): void {
		if (!renderer.value || width <= 0 || height <= 0) return
		renderer.value.setSize(width, height, false)
		options.fit(camera.value, { width, height })
		fitted.value += 1
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

	watch(options.getCameraKind, kind => {
		camera.value = createViewCamera(kind)
		refit()
	})

	onBeforeUnmount(stop)

	return { scene, camera, renderer, invalidate, onFrame, animate, onBeforeRender, fitted, refit }
}
