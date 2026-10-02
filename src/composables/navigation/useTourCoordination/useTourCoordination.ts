/** Composable: координирование пошагового тура (переходы, фокусировка, стили) */
import { createTourFocus } from './useTourCoordinationFocus'
import { createTourNavigation } from './useTourCoordinationNavigation'
import type { UseTourCoordinationOptions } from './types/useTourCoordination.types'
import { createTourLabels, createTourStepView, createTourStyles } from './useTourCoordinationView'

/** Также определяет разрешённые лейблы шагов и их поведение */
function useTourCoordination(options: UseTourCoordinationOptions) {
	const { isFocusing, focusFromViewport, stopFocus, startFocus } = createTourFocus(options.recalculate)
	const labels = createTourLabels(options.props)
	const { spotlightStyle, cardStyle, cardPlacement } = createTourStyles(options, focusFromViewport)
	const navigation = createTourNavigation(options, labels.resolvedCloseOnOverlayClick)
	const { goNext, goPrev, handleSkip, handleFinish } = navigation
	const { slotContext, hasHeader, useDots, progressPercent } = createTourStepView(options, {
		next: goNext,
		prev: goPrev,
		skip: handleSkip,
		finish: handleFinish,
	})

	return {
		isFocusing,
		focusFromViewport,
		spotlightStyle,
		cardStyle,
		cardPlacement,
		slotContext,
		hasHeader,
		useDots,
		progressPercent,
		resolvedNextLabel: labels.resolvedNextLabel,
		resolvedPrevLabel: labels.resolvedPrevLabel,
		resolvedFinishLabel: labels.resolvedFinishLabel,
		resolvedCloseOnOverlayClick: labels.resolvedCloseOnOverlayClick,
		resolvedCloseOnEscape: labels.resolvedCloseOnEscape,
		resolvedLockScroll: labels.resolvedLockScroll,
		setIndex: navigation.setIndex,
		goNext,
		goPrev,
		close: navigation.close,
		handleSkip,
		handleFinish,
		handleOverlayClick: navigation.handleOverlayClick,
		stopFocus,
		startFocus,
	}
}

export { useTourCoordination }
