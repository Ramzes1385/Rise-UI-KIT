import type { Ref } from 'vue'
import { formatMessage } from '@/locales'
import { useSliderThumbs } from './useSliderThumbs'
import { computed, onBeforeUnmount, watch } from 'vue'
import { useSlider } from '@composables/range/useSlider'
import { UI_ARIA, UI_CAROUSEL } from '@/locales/messages'
import { useSizeScale } from '@composables/base/useSizeScale'
import { useCustomClass } from '@composables/base/useCustomClass'
import type { BaseSliderEmits, SliderProps } from '../types/BaseSlider.types'
import { SLIDER_EFFECT_RANGE, SLIDER_SPATIAL_ANIMATIONS } from '../types/BaseSlider.types'

const HOLD_DELAY_MS = 400
const HOLD_INTERVAL_MS = 150
const SLIDER_ELEMENTS = [
	'root',
	'arrows',
	'arrow',
	'rotation',
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

function itemCount(props: SliderProps): number {
	return props.items?.length ?? 0
}

function relativeOffset(index: number, current: number, props: SliderProps): number {
	const count = itemCount(props)
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
		itemCount: () => itemCount(props),
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

function canStepTo(props: SliderProps, slider: ReturnType<typeof useSlider>, direction: 'prev' | 'next'): boolean {
	if (props.isLoop) return true
	return direction === 'prev' ? slider.currentIndex.value > 0 : slider.currentIndex.value < slider.maxIndex.value
}

function useHold(goNext: () => void, goPrev: () => void, canStep: (direction: 'prev' | 'next') => boolean) {
	let delayTimer: ReturnType<typeof setTimeout> | null = null
	let repeatTimer: ReturnType<typeof setInterval> | null = null
	let hasRepeated = false
	const step = (direction: 'prev' | 'next'): void => (direction === 'next' ? goNext() : goPrev())
	const stopHold = (): void => {
		if (delayTimer) clearTimeout(delayTimer)
		if (repeatTimer) clearInterval(repeatTimer)
		delayTimer = null
		repeatTimer = null
	}
	onBeforeUnmount(stopHold)

	return {
		stopHold,
		startHold(direction: 'prev' | 'next', event: PointerEvent): void {
			stopHold()
			hasRepeated = false
			if (event.button > 0 || !canStep(direction)) return
			delayTimer = setTimeout(() => {
				repeatTimer = setInterval(() => {
					hasRepeated = true
					step(direction)
				}, HOLD_INTERVAL_MS)
			}, HOLD_DELAY_MS)
		},
		onArrowClick(direction: 'prev' | 'next', event: MouseEvent): void {
			const isAfterRepeat = hasRepeated && event.detail > 0
			hasRepeated = false
			if (!isAfterRepeat) step(direction)
		},
	}
}

function useSlideVideos(viewportRef: Ref<HTMLElement | null>, isVisible: (index: number) => boolean, stopAutoplay: () => void) {
	function pauseHiddenVideos(): void {
		const slides = viewportRef.value?.querySelectorAll<HTMLElement>('.base-slider__slide') ?? []
		slides.forEach((slide, index) => {
			if (isVisible(index)) return
			slide.querySelectorAll('video').forEach(video => video.pause())
		})
	}
	return { pauseHiddenVideos, onVideoPlay: stopAutoplay }
}

function useCarouselA11y(props: SliderProps, slider: ReturnType<typeof useSlider>) {
	const total = (): number => itemCount(props)
	return {
		carouselLabel: computed((): string => props.label || UI_CAROUSEL.LABEL),
		liveMode: computed((): 'off' | 'polite' => (slider.isRotating.value ? 'off' : 'polite')),
		hasRotationControl: computed((): boolean => props.isAutoplay && slider.maxIndex.value > 0),
		rotationLabel: computed((): string => (slider.isAutoplayStopped.value ? UI_CAROUSEL.PLAY : UI_CAROUSEL.PAUSE)),
		toggleRotation: (): void => (slider.isAutoplayStopped.value ? slider.playAutoplay() : slider.stopAutoplay()),
		slideGroupLabel: (index: number): string => formatMessage(UI_CAROUSEL.SLIDE, { current: index + 1, total: total() }),
		slideLabel: (index: number): string => formatMessage(UI_ARIA.SLIDE_POSITION, { current: index + 1, total: total() }),
	}
}

export function useBaseSlider(props: SliderProps, emit: BaseSliderEmits) {
	const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
	const { classes } = useCustomClass({ getClass: () => props.customClass, elementKeys: SLIDER_ELEMENTS })
	const slider = useSliderState(props, emit)
	const perView = computed(() => Math.max(1, props.slidesPerView))
	const isSlideVisible = (index: number): boolean => {
		if (props.animation !== 'slide') return index === slider.currentIndex.value
		return index >= slider.currentIndex.value && index < slider.currentIndex.value + perView.value
	}
	const videos = useSlideVideos(slider.viewportRef, isSlideVisible, slider.stopAutoplay)
	watch(slider.currentIndex, videos.pauseHiddenVideos, { flush: 'post' })

	return {
		sizeScaleStyle,
		classes,
		...slider,
		hasNavigation: computed(() => props.navigation !== 'none'),
		canNavigate: computed(() => slider.maxIndex.value > 0),
		arrowVariant: computed(() => (props.arrowsPosition === 'center' ? 'shadow' : 'outline')),
		perGroup: computed(() => Math.max(1, props.slidesPerGroup)),
		isSlideVisible,
		slideEffectStyle: useSlideEffect(props, () => slider.currentIndex.value),
		onVideoPlay: videos.onVideoPlay,
		...useCarouselA11y(props, slider),
		...useSliderThumbs(props, slider),
		...useHold(slider.goNext, slider.goPrev, direction => canStepTo(props, slider, direction)),
		exposed: {
			goTo: slider.goTo,
			goNext: slider.goNext,
			goPrev: slider.goPrev,
			stopAutoplay: slider.stopAutoplay,
			playAutoplay: slider.playAutoplay,
		},
	}
}
