import { formatMessage } from '@/locales'
import { UI_ARIA } from '@/locales/messages'
/** Composable: логика BaseSlider — листание, видимость слайдов и перелистывание при зажатой стрелке */
import { computed, onBeforeUnmount } from 'vue'
import { useSlider } from '@composables/useSlider'
import { useSizeScale } from '@composables/useSizeScale'
import { useCustomClass } from '@composables/useCustomClass'
import type { BaseSliderEmits, SliderProps } from '../types/BaseSlider.types'

/** Шаг перелистывания, пока стрелка зажата, мс */
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

/** Перелистывание, пока стрелка зажата; таймер останавливается и при размонтировании */
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
		// Есть что листать: слайдов больше, чем помещается в область. Иначе стрелки и навигация не нужны
		canNavigate: computed(() => slider.maxIndex.value > 0),
		arrowVariant: computed(() => (props.arrowsPosition === 'center' ? 'shadow' : 'outline')),
		perGroup: computed(() => Math.max(1, props.slidesPerGroup)),
		/** Слайд виден: в режиме slide — одно из perView окон начиная с текущего, в fade/scale/flip — только текущий */
		isSlideVisible(index: number): boolean {
			if (props.animation !== 'slide') return index === slider.currentIndex.value
			return index >= slider.currentIndex.value && index < slider.currentIndex.value + perView.value
		},
		/** «Слайд 2 из 6»: имя точки и миниатюры — номер слайда, к которому они ведут */
		slideLabel: (index: number): string => formatMessage(UI_ARIA.SLIDE_POSITION, { current: index + 1, total: props.items.length }),
		...useHold(slider.goNext, slider.goPrev),
	}
}
