/** Composable: пересчёт геометрии тура при изменении размеров, прокрутке окна и изменении страницы */

/**
 * Описание: подписка и отписка слушателей resize и scroll (scroll — в фазе перехвата) и наблюдателя за DOM:
 * цель шага может появиться или исчезнуть без прокрутки — тогда `onDomChange`, не чаще раза за кадр
 */
function createTourListeners(recalculate: () => Promise<void>, onDomChange: () => void = () => undefined) {
	let observer: MutationObserver | null = null
	let frame = 0

	function handleViewportChange(): void {
		void recalculate()
	}

	function handleMutation(): void {
		if (frame !== 0) return
		frame = requestAnimationFrame(() => {
			frame = 0
			onDomChange()
		})
	}

	function attachListeners(): void {
		window.addEventListener('resize', handleViewportChange)
		window.addEventListener('scroll', handleViewportChange, true)
		if (observer || typeof MutationObserver === 'undefined') return
		observer = new MutationObserver(handleMutation)
		observer.observe(document.body, { childList: true, subtree: true })
	}

	function detachListeners(): void {
		window.removeEventListener('resize', handleViewportChange)
		window.removeEventListener('scroll', handleViewportChange, true)
		observer?.disconnect()
		observer = null
		if (frame !== 0) cancelAnimationFrame(frame)
		frame = 0
	}

	return { attachListeners, detachListeners }
}

export { createTourListeners }
