/** Composable: навигация слайдера — текущий индекс, страницы, переходы вперёд и назад с учётом loop */
import type { Ref } from 'vue'
import { computed, ref, watch } from 'vue'
import { clampSlideIndex, maxSlideIndex, slidePositions } from './sliderOptions'
import type { ResolvedSliderOptions, UseSliderNavigationReturn } from './types/useSlider.types'

/** Описание: держит индекс в границах при смене начального индекса и количества слайдов */
function watchIndexBounds(settings: ResolvedSliderOptions, currentIndex: Ref<number>): void {
	watch(settings.initialIndex, newIndex => {
		currentIndex.value = clampSlideIndex(settings, newIndex)
	})

	watch([settings.itemCount, settings.slidesPerView], () => {
		if (currentIndex.value > maxSlideIndex(settings)) currentIndex.value = maxSlideIndex(settings)
	})
}

/** Описание: текущий слайд и страницы; переход на следующую остановку (`slidePositions`: шаг `slidesPerGroup` и последний слайд), за краем — на другой край при loop; один экран слайдов — переходов нет */
function useSliderNavigation(settings: ResolvedSliderOptions): UseSliderNavigationReturn {
	const currentIndex = ref(clampSlideIndex(settings, settings.initialIndex()))

	/** Переход к слайду; индекс за краем — к краю (миниатюра последних слайдов при slidesPerView > 1); тот же слайд — без `onChange` */
	function goTo(index: number): void {
		const target = clampSlideIndex(settings, index)
		if (target === currentIndex.value) return
		currentIndex.value = target
		settings.onChange?.(target)
	}

	/** Номер слайда страницы; страница за краем — край */
	function pageStart(page: number): number {
		const positions = slidePositions(settings)
		return positions[Math.min(Math.max(Math.trunc(page) || 0, 0), positions.length - 1)]
	}

	function goNext(): void {
		const next = slidePositions(settings).find(position => position > currentIndex.value)
		if (next === undefined) {
			if (settings.isLoop()) goTo(0)
			return
		}
		goTo(next)
		settings.onNext?.()
	}

	function goPrev(): void {
		const prev = slidePositions(settings)
			.filter(position => position < currentIndex.value)
			.pop()
		if (prev === undefined) {
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
		pageCount: computed(() => slidePositions(settings).length),
		currentPage: computed(() => slidePositions(settings).filter(position => position <= currentIndex.value).length - 1),
		pageStart,
		goTo,
		goNext,
		goPrev,
		goToPage: (page: number): void => goTo(pageStart(page)),
	}
}

export { useSliderNavigation }
