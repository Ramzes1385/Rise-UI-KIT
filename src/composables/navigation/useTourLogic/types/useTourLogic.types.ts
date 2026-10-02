import type { ComputedRef, Ref } from 'vue'
import type { BaseTourProps, TourGeometry, TourStep } from '@components/BaseTour/types/BaseTour.types'

export interface UseTourLogicOptions {
	props: BaseTourProps
	getIndex: () => number
}

export interface UseTourLogicReturn {
	geometry: Ref<TourGeometry | null>
	/** Цели шага нет на странице (или у шага нет цели) — карточка по центру экрана */
	isCentered: Ref<boolean>
	/** Элемент цели текущего шага или `null` */
	getTarget: () => HTMLElement | null
	currentStep: ComputedRef<TourStep | undefined>
	isFirst: ComputedRef<boolean>
	isLast: ComputedRef<boolean>
	total: ComputedRef<number>
	recalculate: () => Promise<void>
	attachListeners: () => void
	detachListeners: () => void
}
