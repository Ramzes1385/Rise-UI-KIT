import type { Ref } from 'vue'
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { Axis, BaseScrollAreaEmits, BaseScrollAreaExpose, BaseScrollAreaProps } from '../types/BaseScrollArea.types'

const AXES: Axis[] = ['y', 'x']
const MIN_THUMB = 20
const SCROLL_IDLE_DELAY = 800

function measure(viewport: HTMLElement, axis: Axis): { client: number; total: number; position: number } {
	return axis === 'y'
		? { client: viewport.clientHeight, total: viewport.scrollHeight, position: viewport.scrollTop }
		: { client: viewport.clientWidth, total: viewport.scrollWidth, position: viewport.scrollLeft }
}

function setScroll(viewport: HTMLElement, axis: Axis, position: number): void {
	if (axis === 'y') viewport.scrollTop = position
	else viewport.scrollLeft = position
}

function useBars(props: BaseScrollAreaProps, viewportRef: Ref<HTMLElement | null>) {
	const bars = reactive({
		x: { isVisible: false, size: 0, offset: 0 },
		y: { isVisible: false, size: 0, offset: 0 },
	})
	const isAxisEnabled = (axis: Axis): boolean => props.orientation === 'both' || (axis === 'y') === (props.orientation === 'vertical')

	return {
		bars,
		isScrollable: computed(() => bars.x.isVisible || bars.y.isVisible),
		update(): void {
			const viewport = viewportRef.value as HTMLElement
			for (const axis of AXES) {
				const { client, total, position } = measure(viewport, axis)
				const bar = bars[axis]
				bar.isVisible = isAxisEnabled(axis) && total > client + 1
				if (!bar.isVisible) continue
				bar.size = Math.min(100, Math.max((client / total) * 100, (MIN_THUMB / client) * 100))
				bar.offset = (position / (total - client)) * (100 - bar.size)
			}
		},
		thumbStyle(axis: Axis): Record<string, string> {
			const { size, offset } = bars[axis]
			return axis === 'y' ? { height: `${size}%`, top: `${offset}%` } : { width: `${size}%`, left: `${offset}%` }
		},
	}
}

function useThumbDrag(viewportRef: Ref<HTMLElement | null>, bars: Record<Axis, { size: number }>) {
	const dragAxis = ref<Axis | null>(null)
	let dragStartPointer = 0
	let dragStartScroll = 0

	return {
		dragAxis,
		handleThumbPointerdown(axis: Axis, event: PointerEvent): void {
			if (event.button !== 0) return
			event.preventDefault()
			const thumb = event.currentTarget as HTMLElement
			thumb.setPointerCapture?.(event.pointerId)
			const { position } = measure(viewportRef.value as HTMLElement, axis)
			dragAxis.value = axis
			dragStartPointer = axis === 'y' ? event.clientY : event.clientX
			dragStartScroll = position
		},
		handleThumbPointermove(event: PointerEvent): void {
			const axis = dragAxis.value
			if (!axis) return
			const viewport = viewportRef.value as HTMLElement
			const { client, total } = measure(viewport, axis)
			const freeTrack = client - (bars[axis].size / 100) * client
			if (freeTrack <= 0) return
			const delta = (axis === 'y' ? event.clientY : event.clientX) - dragStartPointer
			setScroll(viewport, axis, dragStartScroll + (delta * (total - client)) / freeTrack)
		},
		handleThumbPointerup(): void {
			dragAxis.value = null
		},
	}
}

function useScrollingFlag() {
	const isScrolling = ref(false)
	let idleTimer: ReturnType<typeof setTimeout> | undefined
	onBeforeUnmount(() => clearTimeout(idleTimer))
	return {
		isScrolling,
		markScrolling(): void {
			isScrolling.value = true
			clearTimeout(idleTimer)
			idleTimer = setTimeout(() => (isScrolling.value = false), SCROLL_IDLE_DELAY)
		},
	}
}

function useResizeUpdate(viewportRef: Ref<HTMLElement | null>, contentRef: Ref<HTMLElement | null>, update: () => void): void {
	let observer: ResizeObserver | null = null
	onMounted(() => {
		update()
		observer = new ResizeObserver(update)
		observer.observe(viewportRef.value as HTMLElement)
		observer.observe(contentRef.value as HTMLElement)
	})
	onBeforeUnmount(() => observer?.disconnect())
}

export function useBaseScrollArea(props: BaseScrollAreaProps, emit: BaseScrollAreaEmits) {
	const standard = useStandardBaseComponent('base-scroll-area', props, ['root', 'viewport', 'bar', 'thumb'])
	const viewportRef = ref<HTMLElement | null>(null)
	const contentRef = ref<HTMLElement | null>(null)
	const { bars, isScrollable, update, thumbStyle } = useBars(props, viewportRef)
	const { isScrolling, markScrolling } = useScrollingFlag()
	useResizeUpdate(viewportRef, contentRef, update)

	return {
		...standard,
		axes: AXES,
		viewportRef,
		contentRef,
		viewportStyle: computed(() => {
			if (props.maxHeight === undefined) return undefined
			return { maxHeight: typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight }
		}),
		bars,
		isScrollable,
		thumbStyle,
		isScrolling,
		handleScroll(event: Event): void {
			update()
			markScrolling()
			emit('scroll', event)
		},
		handleTrackPointerdown(axis: Axis, event: PointerEvent): void {
			const viewport = viewportRef.value as HTMLElement
			const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
			const length = axis === 'y' ? rect.height : rect.width
			if (length <= 0) return
			const fraction = (axis === 'y' ? event.clientY - rect.top : event.clientX - rect.left) / length
			const { client, total } = measure(viewport, axis)
			setScroll(viewport, axis, fraction * total - client / 2)
		},
		...useThumbDrag(viewportRef, bars),
		exposed: {
			scrollTo: options => viewportRef.value?.scrollTo(options),
			scrollToTop: () => viewportRef.value?.scrollTo({ top: 0 }),
			scrollToBottom: () => viewportRef.value?.scrollTo({ top: viewportRef.value.scrollHeight }),
			update,
			getViewport: () => viewportRef.value,
		} satisfies BaseScrollAreaExpose,
	}
}
