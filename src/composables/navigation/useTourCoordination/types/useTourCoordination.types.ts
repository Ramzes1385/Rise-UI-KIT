import type { ComputedRef, Ref } from 'vue'
import type { BaseTourEmits, BaseTourProps, TourGeometry, TourStep } from '@components/BaseTour/types/BaseTour.types'

export interface UseTourCoordinationOptions {
	props: BaseTourProps
	emit: BaseTourEmits
	internalIndex: Ref<number>
	activeIndex: ComputedRef<number>
	currentStep: ComputedRef<TourStep | undefined>
	isFirst: ComputedRef<boolean>
	isLast: ComputedRef<boolean>
	total: ComputedRef<number>
	geometry: Ref<TourGeometry | null>
	/** Цели шага нет — карточка по центру экрана */
	isCentered: Ref<boolean>
	isMobile: Ref<boolean>
	recalculate: () => Promise<void>
}
