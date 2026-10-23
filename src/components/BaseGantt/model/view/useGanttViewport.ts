import type { Ref } from 'vue'
import { rowWindow } from './ganttLayout'
import { daysBetween } from '@utils/calendar/eventUtils'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { GanttContext } from '../../types/BaseGanttModel.types'

const OVERSCAN = 4

const FALLBACK_VIEWPORT = 600

function keepScrollOnRangeShift(context: GanttContext, scroller: Ref<HTMLElement | null>): void {
	let lastScale = context.metrics.value.scale
	watch(
		() => context.range.value.start.getTime(),
		(next, previous) => {
			const isSameScale = lastScale === context.metrics.value.scale
			lastScale = context.metrics.value.scale
			if (scroller.value && isSameScale)
				scroller.value.scrollLeft += daysBetween(new Date(next), new Date(previous)) * context.metrics.value.dayWidth
		},
		{ flush: 'post' },
	)
}

export function useGanttViewport(context: GanttContext) {
	const scroller = ref<HTMLElement | null>(null)
	const scrollTop = ref(0)
	const viewportHeight = ref(FALLBACK_VIEWPORT)
	let observer: ResizeObserver | undefined
	const measure = (): void => {
		viewportHeight.value = scroller.value?.clientHeight || FALLBACK_VIEWPORT
	}

	watch(
		scroller,
		element => {
			observer?.disconnect()
			if (!element) return
			measure()
			if (typeof ResizeObserver !== 'undefined') {
				observer = new ResizeObserver(measure)
				observer.observe(element)
			}
		},
		{ flush: 'post' },
	)
	onBeforeUnmount(() => observer?.disconnect())
	keepScrollOnRangeShift(context, scroller)

	return {
		scroller,
		window: computed(() => {
			const { rowHeight, headerHeight } = context.metrics.value
			return rowWindow(
				{ top: scrollTop.value, viewport: viewportHeight.value - headerHeight },
				{ height: rowHeight, count: context.rows.value.length },
				OVERSCAN,
			)
		}),
		onScroll(event: Event): void {
			scrollTop.value = (event.currentTarget as HTMLElement).scrollTop
		},
		ensureRowVisible(index: number): void {
			const element = scroller.value as HTMLElement
			const { rowHeight, headerHeight } = context.metrics.value
			const top = index * rowHeight
			const visible = element.clientHeight - headerHeight
			if (top < element.scrollTop) element.scrollTop = top
			else if (top + rowHeight > element.scrollTop + visible) element.scrollTop = top + rowHeight - visible
			scrollTop.value = element.scrollTop
		},
	}
}
