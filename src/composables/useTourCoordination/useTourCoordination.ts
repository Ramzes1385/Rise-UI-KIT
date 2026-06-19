import { computed, nextTick, ref } from 'vue'
import { DEFAULT_RADIUS } from '../useTourLogic'
import type { UseTourCoordinationOptions } from './useTourCoordination.types'
import type { BaseTourSlotContext } from '@components/BaseTour/model/BaseTour.types'

const FOCUS_DURATION = 450
const MAX_DOTS = 8

/** Описание: координирует пошаговый тур — переходы вперёд/назад, фокусировка на шаге, стили подсветки и карточки, разрешённые лейблы и поведение */
function useTourCoordination(options: UseTourCoordinationOptions) {
	const { props, emit, internalIndex, activeIndex, currentStep, isFirst, isLast, total, geometry, isMobile, recalculate } = options

	const isFocusing = ref(false)
	const focusFromViewport = ref(false)
	let focusTimer: ReturnType<typeof setTimeout> | null = null
	let focusRaf = 0

	const resolvedNextLabel = computed((): string => props.labels?.next ?? props.nextLabel)
	const resolvedPrevLabel = computed((): string => props.labels?.prev ?? props.prevLabel)
	const resolvedFinishLabel = computed((): string => props.labels?.finish ?? props.finishLabel)
	const resolvedCloseOnOverlayClick = computed((): boolean => props.behavior?.closeOnOverlayClick ?? props.closeOnOverlayClick)
	const resolvedCloseOnEscape = computed((): boolean => props.behavior?.closeOnEscape ?? props.closeOnEscape)
	const resolvedLockScroll = computed((): boolean => props.behavior?.lockScroll ?? props.lockScroll)

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
		if (!value) return null
		if (isMobile.value) return {}
		return { top: `${value.card.top}px`, left: `${value.card.left}px` }
	})

	const slotContext = computed((): BaseTourSlotContext | null => {
		const step = currentStep.value
		if (!step) return null
		return {
			step,
			index: activeIndex.value,
			total: total.value,
			isFirst: isFirst.value,
			isLast: isLast.value,
			next: goNext,
			prev: goPrev,
			skip: handleSkip,
			finish: handleFinish,
		}
	})

	function setIndex(value: number): void {
		internalIndex.value = value
		emit('update:step', value)
		emit('change', value)
	}

	function goNext(): void {
		if (isLast.value) return
		const next = internalIndex.value + 1
		setIndex(next)
		emit('next', next)
	}

	function goPrev(): void {
		if (isFirst.value) return
		const prev = internalIndex.value - 1
		setIndex(prev)
		emit('prev', prev)
	}

	function close(): void {
		emit('update:isOpen', false)
		emit('close')
	}

	function handleSkip(): void {
		emit('skip')
		close()
	}

	function handleFinish(): void {
		emit('finish')
		close()
	}

	function handleOverlayClick(): void {
		if (resolvedCloseOnOverlayClick.value) handleSkip()
	}

	function stopFocus(): void {
		if (focusTimer !== null) {
			clearTimeout(focusTimer)
			focusTimer = null
		}
		if (focusRaf !== 0) {
			cancelAnimationFrame(focusRaf)
			focusRaf = 0
		}
		isFocusing.value = false
		focusFromViewport.value = false
	}

	async function startFocus(): Promise<void> {
		stopFocus()
		isFocusing.value = true
		focusFromViewport.value = true

		await recalculate()
		await nextTick()

		focusRaf = requestAnimationFrame(() => {
			focusFromViewport.value = false
			focusTimer = setTimeout(() => {
				isFocusing.value = false
				focusTimer = null
			}, FOCUS_DURATION)
		})
	}

	const hasHeader = computed((): boolean => Boolean(currentStep.value?.title))

	const useDots = computed((): boolean => total.value <= MAX_DOTS)

	const progressPercent = computed((): number => {
		return Math.round((activeIndex.value / (total.value - 1)) * 100)
	})

	return {
		isFocusing,
		focusFromViewport,
		spotlightStyle,
		cardStyle,
		slotContext,
		hasHeader,
		useDots,
		progressPercent,
		resolvedNextLabel,
		resolvedPrevLabel,
		resolvedFinishLabel,
		resolvedCloseOnOverlayClick,
		resolvedCloseOnEscape,
		resolvedLockScroll,
		setIndex,
		goNext,
		goPrev,
		close,
		handleSkip,
		handleFinish,
		handleOverlayClick,
		stopFocus,
		startFocus,
	}
}

export { useTourCoordination }
export type { UseTourCoordinationOptions }
