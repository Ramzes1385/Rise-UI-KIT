import { onBeforeUnmount } from 'vue'

export function useHoverTimer() {
	let hoverTimer: ReturnType<typeof setTimeout> | null = null
	const clearTimer = (): void => {
		if (hoverTimer) {
			clearTimeout(hoverTimer)
			hoverTimer = null
		}
	}
	onBeforeUnmount(clearTimer)

	return {
		clearTimer,
		later(callback: () => void, delay: number): void {
			clearTimer()
			hoverTimer = setTimeout(() => {
				hoverTimer = null
				callback()
			}, delay)
		},
	}
}
