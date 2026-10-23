import { onBeforeUnmount, watch } from 'vue'

const HISTORY_KEY = 'riseRoadmapSheet'

export function useRoadmapSheetBack(isOpen: () => boolean, close: () => void) {
	let isPushed = false

	function onPopState(): void {
		isPushed = false
		window.removeEventListener('popstate', onPopState)
		close()
	}

	function release(): void {
		if (!isPushed) return
		isPushed = false
		window.removeEventListener('popstate', onPopState)
		window.history.back()
	}

	watch(isOpen, value => {
		if (typeof window === 'undefined') return
		if (!value) {
			release()
			return
		}
		window.history.pushState({ ...(window.history.state as object | null), [HISTORY_KEY]: true }, '')
		isPushed = true
		window.addEventListener('popstate', onPopState)
	})
	onBeforeUnmount(release)
}
