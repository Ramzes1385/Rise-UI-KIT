/** Composable: навигация слайдера — текущий индекс, страницы, переходы вперёд и назад с учётом loop */
import type { Ref } from 'vue'
import { computed, ref, watch } from 'vue'
import { clampSlideIndex, maxSlideIndex, perGroup } from './sliderOptions'
import type { ResolvedSliderOptions, UseSliderNavigationReturn } from './types/useSlider.types'

/** Описание: держит индекс в границах при смене начального индекса и количества слайдов */
function watchIndexBounds(settings: ResolvedSliderOptions, currentIndex: Ref<number>): void {
	watch(settings.initialIndex, newIndex => {
		currentIndex.value = clampSlideIndex(settings, newIndex)
	})

	watch(settings.itemCount, () => {
		if (currentIndex.value >= settings.itemCount()) {
			currentIndex.value = clampSlideIndex(settings, currentIndex.value)
		}
	})
}

/** Описание: текущий слайд и страницы; переход на slidesPerGroup, за краем — на другой край при loop */
function useSliderNavigation(settings: ResolvedSliderOptions): UseSliderNavigationReturn {
	const currentIndex = ref(clampSlideIndex(settings, settings.initialIndex()))

	function goTo(index: number): void {
		if (index < 0 || index > maxSlideIndex(settings)) return
		currentIndex.value = index
		settings.onChange?.(index)
	}

	function goNext(): void {
		const next = currentIndex.value + perGroup(settings)
		if (next > maxSlideIndex(settings)) {
			if (settings.isLoop()) goTo(0)
			return
		}
		goTo(next)
		settings.onNext?.()
	}

	function goPrev(): void {
		const prev = currentIndex.value - perGroup(settings)
		if (prev < 0) {
			if (settings.isLoop()) goTo(maxSlideIndex(settings))
			return
		}
		goTo(prev)
		settings.onPrev?.()
	}

	watchIndexBounds(settings, currentIndex)

	return {
		currentIndex,
		maxIndex: computed(() => maxSlideIndex(settings)),
		pageCount: computed(() => Math.ceil((maxSlideIndex(settings) + 1) / perGroup(settings))),
		currentPage: computed(() => Math.floor(currentIndex.value / perGroup(settings))),
		goTo,
		goNext,
		goPrev,
		goToPage: (page: number): void => goTo(clampSlideIndex(settings, page * perGroup(settings))),
	}
}

export { useSliderNavigation }
