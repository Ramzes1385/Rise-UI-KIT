/** Composable: вид тура — подписи и поведение, стили подсветки и карточки, контекст слота и прогресс */
import { computed } from 'vue'
import type { Ref } from 'vue'
import { UI_TOUR } from '@/locales/messages'
import { DEFAULT_RADIUS } from '../useTourLogic'
import type { UseTourCoordinationOptions } from './types/useTourCoordination.types'
import type { BaseTourProps, BaseTourSlotContext } from '@components/BaseTour/types/BaseTour.types'

const MAX_DOTS = 8

/** Описание: подписи кнопок и флаги поведения с значениями по умолчанию */
function createTourLabels(props: BaseTourProps) {
	const resolvedNextLabel = computed((): string => props.labels?.next ?? UI_TOUR.NEXT)
	const resolvedPrevLabel = computed((): string => props.labels?.prev ?? UI_TOUR.PREV)
	const resolvedFinishLabel = computed((): string => props.labels?.finish ?? UI_TOUR.FINISH)
	const resolvedCloseOnOverlayClick = computed((): boolean => props.behavior?.closeOnOverlayClick ?? true)
	const resolvedCloseOnEscape = computed((): boolean => props.behavior?.closeOnEscape ?? true)
	const resolvedLockScroll = computed((): boolean => props.behavior?.lockScroll ?? true)

	return {
		resolvedNextLabel,
		resolvedPrevLabel,
		resolvedFinishLabel,
		resolvedCloseOnOverlayClick,
		resolvedCloseOnEscape,
		resolvedLockScroll,
	}
}

/** Описание: подсветка — по геометрии цели или на всё окно при фокусировке; карточка — по геометрии, без цели по центру, на мобильных без позиции */
function createTourStyles(options: UseTourCoordinationOptions, focusFromViewport: Ref<boolean>) {
	const { props, geometry, isMobile } = options

	const spotlightStyle = computed((): Record<string, string> | null => {
		const value = geometry.value
		if (!value) return null

		if (focusFromViewport.value) {
			const margin = 48
			return {
				top: `${-margin}px`,
				left: `${-margin}px`,
				width: `calc(100vw + ${margin * 2}px)`,
				height: `calc(100vh + ${margin * 2}px)`,
				borderRadius: '0',
			}
		}

		const { top, left, width, height } = value.spotlight
		return {
			top: `${top}px`,
			left: `${left}px`,
			width: `${width}px`,
			height: `${height}px`,
			borderRadius: `${props.radius ?? DEFAULT_RADIUS}px`,
		}
	})

	const cardStyle = computed((): Record<string, string> | null => {
		const value = geometry.value
		if (!value && !options.isCentered.value) return null
		if (isMobile.value) return {}
		if (!value) return { top: '50%', left: '50%' }
		return { top: `${value.card.top}px`, left: `${value.card.left}px` }
	})

	const cardPlacement = computed((): string => {
		if (isMobile.value) return 'mobile'
		return geometry.value?.placement ?? 'center'
	})

	return { spotlightStyle, cardStyle, cardPlacement }
}

/** Описание: контекст слота карточки, наличие заголовка, точки или полоса прогресса */
function createTourStepView(options: UseTourCoordinationOptions, actions: Pick<BaseTourSlotContext, 'next' | 'prev' | 'skip' | 'finish'>) {
	const { activeIndex, currentStep, isFirst, isLast, total } = options

	const slotContext = computed((): BaseTourSlotContext | null => {
		const step = currentStep.value
		if (!step) return null
		return {
			step,
			index: activeIndex.value,
			total: total.value,
			isFirst: isFirst.value,
			isLast: isLast.value,
			next: actions.next,
			prev: actions.prev,
			skip: actions.skip,
			finish: actions.finish,
		}
	})

	const hasHeader = computed((): boolean => Boolean(currentStep.value?.title))

	const useDots = computed((): boolean => total.value <= MAX_DOTS)

	const progressPercent = computed((): number => {
		return Math.round((activeIndex.value / (total.value - 1)) * 100)
	})

	return { slotContext, hasHeader, useDots, progressPercent }
}

export { createTourLabels, createTourStyles, createTourStepView }
