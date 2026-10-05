import { computed, ref, watch } from 'vue'
import type { BaseStepperProps } from '../types/BaseStepper.types'
import { useReducedMotion } from '@composables/app/useReducedMotion'
import { useScrollableRegion } from '@composables/interaction/useScrollableRegion'

function scrollTarget(container: HTMLElement, step: HTMLElement): number | null {
	const padding = Number.parseFloat(getComputedStyle(container).paddingLeft) || 0
	const start = Math.max(0, step.offsetLeft - padding)
	const end = step.offsetLeft + step.offsetWidth + padding
	if (start < container.scrollLeft) return start
	if (end <= container.scrollLeft + container.clientWidth) return null
	return Math.min(start, end - container.clientWidth)
}

export function useStepperScroll(props: BaseStepperProps) {
	const itemsRef = ref<HTMLElement | null>(null)
	const { isScrollable } = useScrollableRegion({ elementRef: itemsRef, orientation: 'horizontal' })
	const isReducedMotion = useReducedMotion()

	function revealActive(behavior: 'auto' | 'smooth'): void {
		const container = itemsRef.value
		const step = container?.children[props.modelValue - 1]
		if (!container || !isScrollable.value || !(step instanceof HTMLElement)) return
		const left = scrollTarget(container, step)
		if (left !== null) container.scrollTo({ left, behavior })
	}

	watch(
		() => props.modelValue,
		() => revealActive(isReducedMotion.value ? 'auto' : 'smooth'),
		{ flush: 'post' },
	)
	watch(isScrollable, () => revealActive('auto'))

	return {
		itemsRef,
		isItemsFocusable: computed(() => isScrollable.value && props.clickable === 'none'),
	}
}
