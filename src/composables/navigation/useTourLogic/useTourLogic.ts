/** Composable: guided tour — навигация по шагам, геометрия подсветки, размещение тултипа */

import { createTourListeners } from './useTourLogicListeners'
import type { TourGeometry, TourStep } from '@components/BaseTour/types/BaseTour.types'
import type { UseTourLogicOptions, UseTourLogicReturn } from './types/useTourLogic.types'
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import {
	DEFAULT_GAP,
	DEFAULT_PADDING,
	DEFAULT_RADIUS,
	findTarget,
	buildTourGeometry,
	readTargetRect,
	resolvePlacement,
	scrollTargetIntoView,
} from './useTourLogicUtils'

function useTourLogic(options: UseTourLogicOptions): UseTourLogicReturn {
	const { props, getIndex } = options

	const geometry = ref<TourGeometry | null>(null)
	const isCentered = ref(false)

	const total = computed((): number => props.steps.length)
	const currentStep = computed((): TourStep | undefined => props.steps[getIndex()])
	const isFirst = computed((): boolean => getIndex() <= 0)
	const isLast = computed((): boolean => getIndex() >= total.value - 1)

	function measure(): void {
		const step = currentStep.value
		const rect = step ? readTargetRect(step.target) : null
		isCentered.value = Boolean(step) && !rect
		geometry.value = step && rect ? buildTourGeometry(rect, step, props) : null
	}

	async function recalculate(): Promise<void> {
		await nextTick()
		const step = currentStep.value
		if (step && props.behavior?.scrollIntoView !== false) {
			scrollTargetIntoView(step.target)
			await nextTick()
		}
		measure()
	}

	const { attachListeners, detachListeners } = createTourListeners(recalculate, measure)

	watch(
		() => [getIndex(), currentStep.value?.target],
		() => {
			void recalculate()
		},
	)

	if (getCurrentInstance()) {
		onBeforeUnmount(() => {
			detachListeners()
		})
	}

	return {
		geometry,
		isCentered,
		getTarget: () => findTarget(currentStep.value?.target),
		currentStep,
		isFirst,
		isLast,
		total,
		recalculate,
		attachListeners,
		detachListeners,
	}
}

export { useTourLogic, DEFAULT_GAP, DEFAULT_PADDING, DEFAULT_RADIUS, resolvePlacement }
