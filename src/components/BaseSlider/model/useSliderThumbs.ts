import { computed, ref, watch } from 'vue'
import type { useSlider } from '@composables/range/useSlider'
import { useReducedMotion } from '@composables/app/useReducedMotion'
import { useScrollableRegion } from '@composables/interaction/useScrollableRegion'
import type { SliderProps, SliderThumbnailsPosition } from '../types/BaseSlider.types'

const HORIZONTAL_STEPS: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1 }
const VERTICAL_STEPS: Record<string, number> = { ArrowUp: -1, ArrowDown: 1 }

function isColumn(strip: HTMLElement): boolean {
	return getComputedStyle(strip).flexDirection.startsWith('column')
}

function overshoot(start: number, end: number): number {
	if (start < 0) return start
	return Math.max(0, end)
}

function revealOffset(strip: HTMLElement, thumb: HTMLElement): { top: number; left: number } {
	const style = getComputedStyle(strip)
	const box = strip.getBoundingClientRect()
	const item = thumb.getBoundingClientRect()
	const top = overshoot(
		item.top - box.top - (parseFloat(style.paddingTop) || 0),
		item.bottom - box.bottom + (parseFloat(style.paddingBottom) || 0),
	)
	const left = overshoot(
		item.left - box.left - (parseFloat(style.paddingLeft) || 0),
		item.right - box.right + (parseFloat(style.paddingRight) || 0),
	)
	return { top: strip.scrollTop + top, left: strip.scrollLeft + left }
}

function targetIndex(key: string, steps: Record<string, number>, position: { index: number; count: number }): number | undefined {
	if (key === 'Home') return 0
	if (key === 'End') return position.count - 1
	const step = steps[key]
	if (step === undefined) return undefined
	return (position.index + step + position.count) % position.count
}

function sideClass(position: SliderThumbnailsPosition, navigation: SliderProps['navigation']): string | undefined {
	const hasThumbs = navigation === 'thumbnails' || navigation === 'both'
	if (!hasThumbs || position === 'bottom') return undefined
	return `base-slider--thumbs-${position}`
}

export function useSliderThumbs(props: SliderProps, slider: Pick<ReturnType<typeof useSlider>, 'currentIndex' | 'goTo'>) {
	const thumbsRef = ref<HTMLElement | null>(null)
	const isReducedMotion = useReducedMotion()
	const { isScrollable } = useScrollableRegion({ elementRef: thumbsRef, orientation: 'both' })

	function thumbAt(index: number): HTMLElement | undefined {
		return thumbsRef.value?.children[index] as HTMLElement | undefined
	}

	function revealActive(): void {
		const strip = thumbsRef.value
		const thumb = thumbAt(slider.currentIndex.value)
		if (!strip || !thumb || !isScrollable.value) return
		strip.scrollTo({ ...revealOffset(strip, thumb), behavior: isReducedMotion.value ? 'auto' : 'smooth' })
	}

	watch([slider.currentIndex, isScrollable], revealActive, { flush: 'post' })

	function onThumbKeydown(event: KeyboardEvent, index: number): void {
		const strip = thumbsRef.value!
		const steps = isColumn(strip) ? VERTICAL_STEPS : HORIZONTAL_STEPS
		const target = targetIndex(event.key, steps, { index, count: strip.children.length })
		if (target === undefined) return
		event.preventDefault()
		slider.goTo(target)
		thumbAt(target)?.focus({ preventScroll: true })
	}

	return {
		thumbsRef,
		onThumbKeydown,
		thumbsSideClass: computed((): string | undefined => sideClass(props.thumbnailsPosition, props.navigation)),
	}
}
