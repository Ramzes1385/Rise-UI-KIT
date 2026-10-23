import type { Ref } from 'vue'
import { useReducedMotion } from '@composables/app/useReducedMotion'
import { onBeforeUnmount, shallowRef, useTemplateRef, watch } from 'vue'
import { cssTimeToMs, initialSegments, mergeSegments } from './chart/pieMotion'
import type { BasePieChartProps, PieSegmentRender, PieSegmentView } from '../types/BasePieChart.types'

const UPDATE_DURATION = '--base-pie-chart-update-duration'

export function usePieSegments(props: BasePieChartProps, views: Readonly<Ref<PieSegmentView[]>>) {
	const isReduced = useReducedMotion()
	const root = useTemplateRef<HTMLElement>('root')
	const segments = shallowRef<PieSegmentRender[]>(initialSegments(views.value, props.animation === 'sweep'))
	const timers = new Map<string, ReturnType<typeof setTimeout>>()

	function cancel(label: string): void {
		clearTimeout(timers.get(label))
		timers.delete(label)
	}

	function remove(label: string): void {
		cancel(label)
		segments.value = segments.value.filter(segment => !(segment.isLeaving && segment.label === label))
	}

	function leaveDuration(): number {
		return root.value ? cssTimeToMs(getComputedStyle(root.value).getPropertyValue(UPDATE_DURATION)) : 0
	}

	watch(views, next => {
		segments.value = mergeSegments(segments.value, next, { isAnimated: props.animation !== 'none' && !isReduced.value })
		segments.value.forEach(segment => {
			if (!segment.isLeaving) return cancel(segment.label)
			if (!timers.has(segment.label)) timers.set(segment.label, setTimeout(remove, leaveDuration() * 1.5, segment.label))
		})
	})

	onBeforeUnmount(() => timers.forEach(timer => clearTimeout(timer)))

	return {
		segments,
		onTransitionEnd(segment: PieSegmentRender, event: TransitionEvent): void {
			if (segment.isLeaving && event.target === event.currentTarget && event.propertyName === 'stroke-dasharray')
				remove(segment.label)
		},
	}
}
