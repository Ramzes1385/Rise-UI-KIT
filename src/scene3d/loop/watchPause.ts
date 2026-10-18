import type { Scene3DPauseWatch } from '../types/internal/scene3dInternal.types'

/** Пауза по `document.visibilitychange` и IntersectionObserver на хосте; без IntersectionObserver вне экрана не паузит */
export function watchPause(getHost: () => HTMLElement | null | undefined, onChange: () => void): Scene3DPauseWatch {
	let isHidden = false
	let isOffscreen = false
	let stopWatching: (() => void) | null = null

	function start(): void {
		const host = getHost()
		if (stopWatching || !host) return
		const onVisibility = (): void => {
			isHidden = document.hidden
			onChange()
		}
		isHidden = document.hidden
		document.addEventListener('visibilitychange', onVisibility)
		const observer =
			typeof IntersectionObserver === 'function'
				? new IntersectionObserver(entries => {
						isOffscreen = !entries[entries.length - 1].isIntersecting
						onChange()
					})
				: null
		observer?.observe(host)
		stopWatching = () => {
			document.removeEventListener('visibilitychange', onVisibility)
			observer?.disconnect()
		}
	}

	function stop(): void {
		stopWatching?.()
		stopWatching = null
		isHidden = false
		isOffscreen = false
	}

	return { isPaused: () => isHidden || isOffscreen, start, stop }
}
