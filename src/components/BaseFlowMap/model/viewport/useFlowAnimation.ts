import type { Ref } from 'vue'
import { mixViewport } from './viewGeometry'
import type { FlowViewport } from '../../types/api/flowController.types'

const DURATION = 240

function ease(progress: number): number {
	return 1 - Math.pow(1 - progress, 3)
}

export function createViewportAnimation(
	viewport: Ref<FlowViewport>,
	isAnimating: Ref<boolean>,
	done: (viewport: FlowViewport) => void,
): { run: (to: FlowViewport) => void; stop: () => void } {
	let timer = 0

	function stop(): void {
		if (timer && typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(timer)
		timer = 0
		isAnimating.value = false
	}

	function run(to: FlowViewport): void {
		const from = viewport.value
		const started = performance.now()
		isAnimating.value = true
		const step = (now: number): void => {
			const progress = Math.max(0, Math.min(1, (now - started) / DURATION))
			viewport.value = mixViewport(from, to, ease(progress))
			if (progress < 1) {
				timer = requestAnimationFrame(step)
				return
			}
			stop()
			done(to)
		}
		timer = requestAnimationFrame(step)
	}

	return { run, stop }
}
