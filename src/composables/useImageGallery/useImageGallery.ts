import { computed, ref } from 'vue'
import type { UseImageGalleryOptions, UseImageGalleryReturn } from './useImageGallery.types'

/** Описание: управляет галереей изображений — навигация вперёд/назад, переход к конкретному индексу и текущий src с учётом zoom */
function useImageGallery(options: UseImageGalleryOptions): UseImageGalleryReturn {
	const { gallery, src, resetZoom } = options

	const galleryIndex = ref(0)
	const galleryList = computed((): string[] => gallery() ?? [])
	const hasGallery = computed((): boolean => galleryList.value.length > 1)
	const hasGalleryPrev = computed((): boolean => hasGallery.value && galleryIndex.value > 0)
	const hasGalleryNext = computed((): boolean => hasGallery.value && galleryIndex.value < galleryList.value.length - 1)
	const currentZoomSrc = computed((): string => {
		if (hasGallery.value) return galleryList.value[galleryIndex.value] ?? src()
		return src()
	})

	function handleGalleryPrev(): void {
		if (!hasGalleryPrev.value) return
		galleryIndex.value--
		resetZoom()
	}

	function handleGalleryNext(): void {
		if (!hasGalleryNext.value) return
		galleryIndex.value++
		resetZoom()
	}

	function handleGalleryGo(index: number): void {
		/* istanbul ignore next -- defensive guard: index всегда в пределах thumbnails (v-for на galleryList), out-of-bounds недостижим из UI */
		if (index < 0 || index >= galleryList.value.length) return
		galleryIndex.value = index
		resetZoom()
	}

	return {
		galleryIndex,
		galleryList,
		hasGallery,
		hasGalleryPrev,
		hasGalleryNext,
		currentZoomSrc,
		handleGalleryPrev,
		handleGalleryNext,
		handleGalleryGo,
	}
}

export { useImageGallery }
