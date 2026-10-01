/** Composable: пересчёт геометрии тура при изменении размеров и прокрутке окна */

/** Описание: подписка и отписка слушателей resize и scroll (scroll — в фазе перехвата) */
function createTourListeners(recalculate: () => Promise<void>) {
	function handleViewportChange(): void {
		void recalculate()
	}

	function attachListeners(): void {
		window.addEventListener('resize', handleViewportChange)
		window.addEventListener('scroll', handleViewportChange, true)
	}

	function detachListeners(): void {
		window.removeEventListener('resize', handleViewportChange)
		window.removeEventListener('scroll', handleViewportChange, true)
	}

	return { attachListeners, detachListeners }
}

export { createTourListeners }
