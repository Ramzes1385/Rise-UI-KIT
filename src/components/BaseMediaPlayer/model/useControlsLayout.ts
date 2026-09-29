import { onBeforeUnmount, onMounted } from 'vue'

const FIT_STEPS = ['text', 'chapter', 'episode', 'seek', 'duration', 'theater', 'compact', 'pip', 'volume', 'time']

function isCrowded(bar: HTMLElement): boolean {
	const group = bar.firstElementChild
	return group !== null && group.scrollWidth > group.clientWidth + 1
}

function fitBar(bar: HTMLElement): void {
	const steps: string[] = []
	bar.dataset.fit = ''
	for (const step of FIT_STEPS) {
		if (!isCrowded(bar)) return
		steps.push(step)
		bar.dataset.fit = steps.join(' ')
	}
}

function layout(controls: HTMLElement, root: HTMLElement | null): void {
	const bar = controls.querySelector<HTMLElement>('.base-media-player__bar')
	if (bar) fitBar(bar)
	root?.style.setProperty('--media-controls-height', `${controls.offsetHeight}px`)
}

export function useControlsLayout(controls: Readonly<{ value: HTMLElement | null }>, root: Readonly<{ value: HTMLElement | null }>): void {
	const observers: { disconnect: () => void }[] = []
	onMounted(() => {
		const element = controls.value
		if (!element || typeof ResizeObserver === 'undefined') return
		const update = (): void => layout(element, root.value)
		const resize = new ResizeObserver(update)
		const mutation = new MutationObserver(update)
		resize.observe(element)
		mutation.observe(element, { childList: true, subtree: true })
		observers.push(resize, mutation)
	})
	onBeforeUnmount(() => observers.forEach(observer => observer.disconnect()))
}
