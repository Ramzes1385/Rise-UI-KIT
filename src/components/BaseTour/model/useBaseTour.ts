import type { Ref } from 'vue'
import { useEscapeKey } from '@composables/useEscapeKey'
import { useFocusTrap } from '@composables/useFocusTrap'
import { useTourLogic } from '@composables/useTourLogic'
import { useBreakpoint } from '@composables/useBreakpoint'
import { useLayerIndex } from '@composables/useLayerStack'
import { useScrollLock } from '@composables/useScrollLock'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useCustomClass } from '@composables/useCustomClass'
import { useTeleportTarget } from '@composables/useTeleportTarget'
import { useTourCoordination } from '@composables/useTourCoordination'
import type { BaseTourEmits, TourProps } from '../types/BaseTour.types'

const TOUR_ELEMENTS = [
	'root',
	'overlay',
	'spotlight',
	'card',
	'cardInner',
	'title',
	'closeButton',
	'closeIcon',
	'content',
	'footer',
	'progress',
	'dot',
	'counter',
	'actions',
	'prevButton',
	'nextButton',
	'finishButton',
]

function useTourSteps(props: TourProps, emit: BaseTourEmits, internalIndex: Ref<number>) {
	const activeIndex = computed((): number => internalIndex.value)
	const { isMobile } = useBreakpoint()
	const logic = useTourLogic({ props, getIndex: () => internalIndex.value })
	const coordination = useTourCoordination({
		props,
		emit,
		internalIndex,
		activeIndex,
		currentStep: logic.currentStep,
		isFirst: logic.isFirst,
		isLast: logic.isLast,
		total: logic.total,
		geometry: logic.geometry,
		isMobile,
		recalculate: logic.recalculate,
	})
	return { activeIndex, isMobile, logic, coordination }
}

function useCardFocus(props: TourProps): Ref<HTMLElement | null> {
	const cardRef = ref<HTMLElement | null>(null)
	useFocusTrap({ containerRef: cardRef, isActive: () => props.isOpen && cardRef.value !== null })
	return cardRef
}

function useTourOpen(props: TourProps, internalIndex: Ref<number>, steps: ReturnType<typeof useTourSteps>): void {
	const { lock, unlock } = useScrollLock()
	const { attachListeners, detachListeners } = steps.logic
	const { resolvedLockScroll, startFocus, stopFocus } = steps.coordination

	watch(
		() => props.step,
		value => {
			internalIndex.value = value
		},
	)
	watch(
		() => props.isOpen,
		value => {
			if (value) {
				internalIndex.value = props.step
				if (resolvedLockScroll.value) lock()
				attachListeners()
				void startFocus()
			} else {
				stopFocus()
				unlock()
				detachListeners()
			}
		},
		{ immediate: true },
	)
	onBeforeUnmount(() => {
		stopFocus()
		unlock()
	})
}

export function useBaseTour(props: TourProps, emit: BaseTourEmits) {
	const teleportTarget = useTeleportTarget()
	const layerStyle = useLayerIndex(() => props.isOpen)
	const internalIndex = ref(props.step)
	const { classes } = useCustomClass({ getClass: () => props.customClass, elementKeys: TOUR_ELEMENTS })
	const steps = useTourSteps(props, emit, internalIndex)
	useEscapeKey({
		isActive: () => props.isOpen && steps.coordination.resolvedCloseOnEscape.value,
		callback: steps.coordination.handleSkip,
	})
	const cardRef = useCardFocus(props)
	useTourOpen(props, internalIndex, steps)

	return {
		teleportTarget,
		layerStyle,
		classes,
		activeIndex: steps.activeIndex,
		isMobile: steps.isMobile,
		geometry: steps.logic.geometry,
		currentStep: steps.logic.currentStep,
		isFirst: steps.logic.isFirst,
		isLast: steps.logic.isLast,
		total: steps.logic.total,
		cardRef,
		...steps.coordination,
	}
}
