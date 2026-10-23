import { onBeforeUnmount } from 'vue'
import { autoScrollStep, frameScale } from './dashboardAutoScroll'
import type { DashboardScrollDelta, DashboardScrollPoint } from '../../types/BaseDashboardGrid.types'

export function useDashboardGridAutoScroll(onScroll: (delta: DashboardScrollDelta) => void) {
	let frame = 0
	let lastTime = 0
	let root: HTMLElement | null = null
	let point: DashboardScrollPoint = { x: 0, y: 0 }

	function step(time: number): void {
		const scale = lastTime === 0 ? 1 : frameScale(time - lastTime)
		lastTime = time
		const delta = autoScrollStep(root, point, scale)
		if (delta.dx !== 0 || delta.dy !== 0) onScroll(delta)
		frame = requestAnimationFrame(step)
	}

	function stop(): void {
		cancelAnimationFrame(frame)
		frame = 0
		lastTime = 0
		root = null
	}

	onBeforeUnmount(stop)

	return {
		get isRunning(): boolean {
			return frame !== 0
		},
		start(element: HTMLElement | null, start: DashboardScrollPoint): void {
			stop()
			root = element
			point = start
			frame = requestAnimationFrame(step)
		},
		move(next: DashboardScrollPoint): void {
			point = next
		},
		stop,
	}
}
