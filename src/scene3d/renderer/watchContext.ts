const CONTEXT_RESTORE_TIMEOUT = 3000

export function watchContext(canvas: HTMLCanvasElement, hooks: { onRestore: () => void; onFail: () => void }): () => void {
	let timer = 0
	const handleLost = (event: Event): void => {
		event.preventDefault()
		window.clearTimeout(timer)
		timer = window.setTimeout(hooks.onFail, CONTEXT_RESTORE_TIMEOUT)
	}
	const handleRestored = (): void => {
		window.clearTimeout(timer)
		hooks.onRestore()
	}
	canvas.addEventListener('webglcontextlost', handleLost)
	canvas.addEventListener('webglcontextrestored', handleRestored)
	return () => {
		window.clearTimeout(timer)
		canvas.removeEventListener('webglcontextlost', handleLost)
		canvas.removeEventListener('webglcontextrestored', handleRestored)
	}
}
