import { shallowRef } from 'vue'
import { watchPause } from './watchPause'
import type { Camera, Scene } from 'three'
import { createFrameClock } from './frameClock'
import type { Scene3DRenderer } from '../types/scene3d.types'
import type { RenderLoopOptions, Scene3DFrame, Scene3DPauseWatch, Scene3DTick } from '../types/internal/scene3dInternal.types'

function createHooks<A extends unknown[]>() {
	const list: Array<(...args: A) => void> = []
	return {
		run: (...args: A) => list.forEach(hook => hook(...args)),
		add: (hook: (...args: A) => void) => {
			list.push(hook)
			return () => void list.splice(list.indexOf(hook) >>> 0, 1)
		},
	}
}

function createAnimator(parts: {
	tickers: Set<Scene3DTick>
	pause: Scene3DPauseWatch
	schedule: () => void
	isReducedMotion?: () => boolean
}) {
	return (tick: Scene3DTick): (() => void) => {
		if (parts.isReducedMotion?.()) {
			tick(0, 0)
			parts.schedule()
			return () => undefined
		}
		parts.pause.start()
		parts.tickers.add(tick)
		parts.schedule()
		return () => void parts.tickers.delete(tick)
	}
}

export function useRenderLoop(scene: Scene, getCamera: () => Camera, options: RenderLoopOptions = {}) {
	const renderer = shallowRef<Scene3DRenderer | null>(null)
	const frameHooks = createHooks<[]>()
	const beforeHooks = createHooks<[Scene3DFrame]>()
	const tickers = new Set<Scene3DTick>()
	const clock = createFrameClock()
	let frame = 0

	function schedule(): void {
		if (!renderer.value || frame || (tickers.size && pause.isPaused())) return
		frame = requestAnimationFrame(renderFrame)
	}

	const pause = watchPause(
		() => options.getHost?.() ?? renderer.value?.domElement,
		() => {
			clock.reset()
			if (!pause.isPaused()) schedule()
		},
	)

	function renderFrame(now: number): void {
		frame = 0
		if (!renderer.value) return
		const info = clock.tick(now)
		beforeHooks.run(info)
		tickers.forEach(tick => {
			if (tick(info.delta, info.time) === false) tickers.delete(tick)
		})
		renderer.value.render(scene, getCamera())
		frameHooks.run()
		if (tickers.size) schedule()
		else clock.reset()
	}

	const animate = createAnimator({ tickers, pause, schedule, isReducedMotion: options.isReducedMotion })

	function release(): void {
		cancelAnimationFrame(frame)
		frame = 0
		pause.stop()
		tickers.clear()
		clock.reset()
		renderer.value?.dispose()
		renderer.value?.forceContextLoss()
		renderer.value = null
	}

	return { renderer, release, invalidate: schedule, animate, onFrame: frameHooks.add, onBeforeRender: beforeHooks.add }
}
