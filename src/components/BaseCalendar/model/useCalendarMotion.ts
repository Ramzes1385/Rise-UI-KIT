import { computed, ref, watch } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { useMotion } from '@composables/app/useMotion'
import type { CalendarChange, CalendarMotionSource } from '../types/BaseCalendar.types'

export function hideLeaving(el: Element): void {
	const node = el as HTMLElement
	node.style.width = `${node.offsetWidth}px`
	node.setAttribute('aria-hidden', 'true')
	node.setAttribute('inert', '')
	for (const child of node.querySelectorAll('[id]')) child.removeAttribute('id')
}

export function useCalendarMotion(source: CalendarMotionSource) {
	const rootRef = ref<ComponentPublicInstance | null>(null)
	const motion = useMotion(() => rootRef.value?.$el as Element | undefined)
	const period = computed((): number => source.currentYear.value * 12 + source.currentMonth.value)
	const change = ref<CalendarChange>('next')

	watch([source.currentView, period], ([view, value], [previousView, previousValue]) => {
		if (view !== previousView) change.value = 'view'
		else change.value = value > previousValue ? 'next' : 'prev'
	})

	const slideName = computed((): string => `base-calendar-slide-${change.value === 'prev' ? 'prev' : 'next'}`)

	return {
		rootRef,
		period,
		slideName,
		viewKey: computed((): string =>
			source.currentView.value === 'days' ? 'days' : `${source.currentView.value}-${source.currentYear.value}`,
		),
		viewTransition: computed((): string => (change.value === 'view' ? 'base-calendar-view' : slideName.value)),
		isAnimated: computed((): boolean => !motion.isReduced.value),
		hideLeaving,
	}
}
