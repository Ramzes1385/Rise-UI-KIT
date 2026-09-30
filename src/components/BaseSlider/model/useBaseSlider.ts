import { formatMessage } from '@/locales'
import { UI_ARIA } from '@/locales/messages'
import { computed, onBeforeUnmount } from 'vue'
import { useSlider } from '@composables/range/useSlider'
import { useSizeScale } from '@composables/base/useSizeScale'
import { useCustomClass } from '@composables/base/useCustomClass'
import type { BaseSliderEmits, SliderProps } from '../types/BaseSlider.types'
import { SLIDER_EFFECT_RANGE, SLIDER_SPATIAL_ANIMATIONS } from '../types/BaseSlider.types'

const HOLD_INTERVAL_MS = 150
const SLIDER_ELEMENTS = [
	'root',
	'arrows',
	'arrow',
	'viewport',
	'track',
	'slide',
	'caption',
	'title',
	'desc',
	'navigation',
	'dots',
	'dot',
	'thumbs',
	'thumb',
]

function relativeOffset(index: number, current: number, props: SliderProps): number {
	const count = props.items.length
	const raw = index - current
	if (!props.isLoop || count < 3) return raw
	if (raw > count / 2) return raw - count
	if (raw < -count / 2) return raw + count
	return raw
}

function useSlideEffect(props: SliderProps, currentIndex: () => number) {
	return (index: number): Record<string, string> | undefined => {
		if (!SLIDER_SPATIAL_ANIMATIONS.includes(props.animation)) return undefined
		const offset = Math.max(-SLIDER_EFFECT_RANGE, Math.min(SLIDER_EFFECT_RANGE, relativeOffset(index, currentIndex(), props)))
		const distance = Math.abs(offset)
		return { '--slide-offset': String(offset), '--slide-distance': String(distance), zIndex: String(SLIDER_EFFECT_RANGE - distance) }
	}
}

function useSliderState(props: SliderProps, emit: BaseSliderEmits) {
	return useSlider({
		itemCount: () => props.items.length,
		animation: () => props.animation,
		isAutoplay: () => props.isAutoplay,
		autoplayInterval: () => props.autoplayInterval,
		isLoop: () => props.isLoop,
		isVertical: () => props.isVertical,
		initialIndex: () => props.initialIndex,
		spaceBetween: () => props.spaceBetween,
		slidesPerView: () => props.slidesPerView,
		slidesPerGroup: () => props.slidesPerGroup,
		onChange: index => emit('change', index),
		onNext: () => emit('next'),
		onPrev: () => emit('prev'),
	})
}

function useHold(goNext: () => void, goPrev: () => void) {
	let holdTimer: ReturnType<typeof setInterval> | null = null
	const stopHold = (): void => {
		if (!holdTimer) return
		clearInterval(holdTimer)
		holdTimer = null
	}
	onBeforeUnmount(stopHold)

	return {
		stopHold,
		startHold(direction: 'prev' | 'next'): void {
			stopHold()
			holdTimer = setInterval(direction === 'next' ? goNext : goPrev, HOLD_INTERVAL_MS)
		},
	}
}

export function useBaseSlider(props: SliderProps, emit: BaseSliderEmits) {
	const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
	const { classes } = useCustomClass({ getClass: () => props.customClass, elementKeys: SLIDER_ELEMENTS })
	const slider = useSliderState(props, emit)
	const perView = computed(() => Math.max(1, props.slidesPerView))

	return {
		sizeScaleStyle,
		classes,
		...slider,
		hasNavigation: computed(() => props.navigation !== 'none'),
		canNavigate: computed(() => slider.maxIndex.value > 0),
		arrowVariant: computed(() => (props.arrowsPosition === 'center' ? 'shadow' : 'outline')),
		perGroup: computed(() => Math.max(1, props.slidesPerGroup)),
		isSlideVisible(index: number): boolean {
			if (props.animation !== 'slide') return index === slider.currentIndex.value
			return index >= slider.currentIndex.value && index < slider.currentIndex.value + perView.value
		},
		slideLabel: (index: number): string => formatMessage(UI_ARIA.SLIDE_POSITION, { current: index + 1, total: props.items.length }),
		slideEffectStyle: useSlideEffect(props, () => slider.currentIndex.value),
		...useHold(slider.goNext, slider.goPrev),
	}
}
