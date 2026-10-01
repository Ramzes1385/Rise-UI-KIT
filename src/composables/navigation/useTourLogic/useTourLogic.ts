/** Composable: guided tour — навигация по шагам, геометрия подсветки, размещение тултипа */

import { createTourListeners } from './useTourLogicListeners'
import type { TourGeometry, TourStep } from '@components/BaseTour/types/BaseTour.types'
import type { UseTourLogicOptions, UseTourLogicReturn } from './types/useTourLogic.types'
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import {
	DEFAULT_GAP,
	DEFAULT_PADDING,
	DEFAULT_RADIUS,
	buildTourGeometry,
	readTargetRect,
	resolvePlacement,
	scrollTargetIntoView,
} from './useTourLogicUtils'

function useTourLogic(options: UseTourLogicOptions): UseTourLogicReturn {
	const { props, getIndex } = options

	const geometry = ref<TourGeometry | null>(null)

	const total = computed((): number => props.steps.length)
	const currentStep = computed((): TourStep | undefined => props.steps[getIndex()])
	const isFirst = computed((): boolean => getIndex() <= 0)
	const isLast = computed((): boolean => getIndex() >= total.value - 1)

	async function recalculate(): Promise<void> {
		await nextTick()
		const step = currentStep.value
		if (!step) {
			geometry.value = null
			return
		}

		if (props.behavior?.scrollIntoView !== false) {
			scrollTargetIntoView(step.target)
			await nextTick()
		}

		const rect = readTargetRect(step.target)
		if (!rect) {
			geometry.value = null
			return
		}

		geometry.value = buildTourGeometry(rect, step, props)
	}

	const { attachListeners, detachListeners } = createTourListeners(recalculate)

	watch(
		() => getIndex(),
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
