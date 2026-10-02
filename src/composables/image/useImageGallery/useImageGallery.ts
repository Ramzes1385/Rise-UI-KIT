/** Composable: управление галереей изображений (навигация, текущий src и alt) */
import { computed, ref, watch } from 'vue'
import type { ImageGalleryItem, ImageGallerySource, UseImageGalleryOptions, UseImageGalleryReturn } from './types/useImageGallery.types'

/** Описание: элемент галереи объектом — строка становится `{ src }` */
function toGalleryItem(source: ImageGallerySource): ImageGalleryItem {
	return typeof source === 'string' ? { src: source } : source
}

/**
 * Описание: управляет галереей изображений — навигация вперёд/назад, переход к конкретному индексу, текущие src и alt с учётом zoom.
 * Галерея сократилась — номер текущего изображения остаётся в её границах.
 */
function useImageGallery(options: UseImageGalleryOptions): UseImageGalleryReturn {
	const { gallery, src, resetZoom } = options

	const galleryIndex = ref(0)
	const items = computed((): ImageGalleryItem[] => (gallery() ?? []).map(toGalleryItem))
	const galleryList = computed((): string[] => items.value.map(item => item.src))
	const hasGallery = computed((): boolean => galleryList.value.length > 1)
	const hasGalleryPrev = computed((): boolean => hasGallery.value && galleryIndex.value > 0)
	const hasGalleryNext = computed((): boolean => hasGallery.value && galleryIndex.value < galleryList.value.length - 1)
	const currentItem = computed((): ImageGalleryItem | undefined => (hasGallery.value ? items.value[galleryIndex.value] : undefined))

	watch(
		() => galleryList.value.length,
		length => {
			if (galleryIndex.value >= length) galleryIndex.value = Math.max(0, length - 1)
		},
	)

	function go(index: number): void {
		galleryIndex.value = index
		resetZoom()
	}

	return {
		galleryIndex,
		galleryList,
		hasGallery,
		hasGalleryPrev,
		hasGalleryNext,
		currentZoomSrc: computed((): string => currentItem.value?.src ?? src()),
		currentAlt: computed((): string | undefined => currentItem.value?.alt),
		handleGalleryPrev: (): void => {
			if (hasGalleryPrev.value) go(galleryIndex.value - 1)
		},
		handleGalleryNext: (): void => {
			if (hasGalleryNext.value) go(galleryIndex.value + 1)
		},
		handleGalleryGo: (index: number): void => {
			if (index >= 0 && index < galleryList.value.length) go(index)
		},
	}
}

export { useImageGallery }
