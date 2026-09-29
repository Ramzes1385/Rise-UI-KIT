import { onBeforeUnmount, onMounted } from 'vue'

const FIT_STEPS = ['text', 'chapter', 'episode', 'duration', 'theater', 'compact', 'pip', 'seek', 'volume', 'time']

const SIZED = '.base-media-player__group--end, .base-media-player__time'

const PANEL = '.base-media-player__popover'

function neededWidth(bar: HTMLElement): number {
	const boxes = Array.from(bar.children, child => child.getBoundingClientRect()).filter(box => box.width > 0)
	if (boxes.length === 0) return 0
	return Math.max(...boxes.map(box => box.right)) - Math.min(...boxes.map(box => box.left))
}

function fitBar(bar: HTMLElement): void {
	const steps: string[] = []
	bar.dataset.fit = ''
	if (bar.clientWidth === 0) return
	bar.dataset.measure = ''
	for (const step of FIT_STEPS) {
		if (neededWidth(bar) <= bar.clientWidth + 1) break
		steps.push(step)
		bar.dataset.fit = steps.join(' ')
	}
	delete bar.dataset.measure
}

function layout(controls: HTMLElement, bar: HTMLElement, root: HTMLElement | null): void {
	fitBar(bar)
	root?.style.setProperty('--media-controls-height', `${controls.offsetHeight}px`)
}

function isOwnChange(record: MutationRecord): boolean {
	return !(record.target instanceof Element && record.target.closest(PANEL))
}

export function useControlsLayout(controls: Readonly<{ value: HTMLElement | null }>, root: Readonly<{ value: HTMLElement | null }>): void {
	const observers: { disconnect: () => void }[] = []
	onMounted(() => {
		const element = controls.value
		const bar = element?.querySelector<HTMLElement>('.base-media-player__bar')
		if (!element || !bar || typeof ResizeObserver === 'undefined') return
		const update = (): void => layout(element, bar, root.value)
		const resize = new ResizeObserver(update)
		const watchSizes = (): void => {
			resize.disconnect()
			for (const target of [element, ...bar.querySelectorAll(SIZED)]) resize.observe(target)
		}
		const mutation = new MutationObserver(records => {
			if (!records.some(isOwnChange)) return
			watchSizes()
			update()
		})
		watchSizes()
		mutation.observe(bar, { childList: true, subtree: true })
		observers.push(resize, mutation)
	})
	onBeforeUnmount(() => observers.forEach(observer => observer.disconnect()))
}
