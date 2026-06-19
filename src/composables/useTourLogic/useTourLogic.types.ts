import type { BaseTourProps, TourGeometry, TourStep } from '@components/BaseTour/model/BaseTour.types'
import type { ComputedRef, Ref } from 'vue'

export interface UseTourLogicOptions {
	props: BaseTourProps
	getIndex: () => number
}

export interface UseTourLogicReturn {
	geometry: Ref<TourGeometry | null>
	currentStep: ComputedRef<TourStep | undefined>
	isFirst: ComputedRef<boolean>
	isLast: ComputedRef<boolean>
	total: ComputedRef<number>
	recalculate: () => Promise<void>
	attachListeners: () => void
	detachListeners: () => void
}
