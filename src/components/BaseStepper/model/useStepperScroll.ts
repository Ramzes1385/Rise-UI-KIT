import { activeStep } from './stepperStep'
import { computed, ref, watch } from 'vue'
import { isRtl } from '@utils/dom/directionUtils'
import type { BaseStepperProps } from '../types/BaseStepper.types'
import { useReducedMotion } from '@composables/app/useReducedMotion'
import { useScrollableRegion } from '@composables/interaction/useScrollableRegion'

function scrollTarget(container: HTMLElement, step: HTMLElement): number | null {
	const rtl = isRtl(container)
	const padding = Number.parseFloat(getComputedStyle(container)[rtl ? 'paddingRight' : 'paddingLeft']) || 0
	const stepStart = rtl ? container.clientWidth - step.offsetLeft - step.offsetWidth : step.offsetLeft
	const offset = Math.abs(container.scrollLeft)
	const start = Math.max(0, stepStart - padding)
	const end = stepStart + step.offsetWidth + padding
	let target: number | null = null
	if (start < offset) target = start
	else if (end > offset + container.clientWidth) target = Math.min(start, end - container.clientWidth)
	if (target === null) return null
	return rtl && target > 0 ? -target : target
}

export function useStepperScroll(props: BaseStepperProps) {
	const itemsRef = ref<HTMLElement | null>(null)
	const { isScrollable } = useScrollableRegion({ elementRef: itemsRef, orientation: 'horizontal' })
	const isReducedMotion = useReducedMotion()

	function revealActive(behavior: 'auto' | 'smooth'): void {
		const container = itemsRef.value
		const step = container?.children[activeStep(props) - 1]
		if (!container || !isScrollable.value || !(step instanceof HTMLElement)) return
		const left = scrollTarget(container, step)
		if (left !== null) container.scrollTo({ left, behavior })
	}

	watch(
		() => activeStep(props),
		() => revealActive(isReducedMotion.value ? 'auto' : 'smooth'),
		{ flush: 'post' },
	)
	watch(isScrollable, () => revealActive('auto'))

	return {
		itemsRef,
		isItemsFocusable: computed(() => isScrollable.value && props.clickable === 'none'),
	}
}
