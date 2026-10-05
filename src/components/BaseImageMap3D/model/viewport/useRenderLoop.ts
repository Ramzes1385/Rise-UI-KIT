import { shallowRef } from 'vue'
import type { Camera, Scene } from 'three'
import type { ImageMap3DRenderer } from '../../types/BaseImageMap3D.types'

export function useRenderLoop(scene: Scene, getCamera: () => Camera) {
	const renderer = shallowRef<ImageMap3DRenderer | null>(null)
	const hooks: Array<() => void> = []
	let frame = 0

	function renderFrame(): void {
		frame = 0
		if (!renderer.value) return
		renderer.value.render(scene, getCamera())
		hooks.forEach(hook => hook())
	}

	function invalidate(): void {
		if (!renderer.value || frame) return
		frame = requestAnimationFrame(renderFrame)
	}

	function release(): void {
		cancelAnimationFrame(frame)
		frame = 0
		renderer.value?.dispose()
		renderer.value?.forceContextLoss()
		renderer.value = null
	}

	return { renderer, invalidate, release, onFrame: (hook: () => void) => void hooks.push(hook) }
}
