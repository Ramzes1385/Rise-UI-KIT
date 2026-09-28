/** Composable: таймер закрытия меню после ухода курсора (trigger=hover); снимается при размонтировании */
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
		later(callback: () => void, delay: number | undefined): void {
			hoverTimer = setTimeout(callback, delay)
		},
	}
}
