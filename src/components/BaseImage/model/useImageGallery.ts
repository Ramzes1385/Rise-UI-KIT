import { computed, ref } from 'vue'

interface UseImageGalleryOptions {
	gallery: () => string[] | undefined
	src: () => string
	resetZoom: () => void
}

interface UseImageGalleryReturn {
	galleryIndex: ReturnType<typeof ref<number>>
	galleryList: ReturnType<typeof computed<string[]>>
	hasGallery: ReturnType<typeof computed<boolean>>
	hasGalleryPrev: ReturnType<typeof computed<boolean>>
	hasGalleryNext: ReturnType<typeof computed<boolean>>
	currentZoomSrc: ReturnType<typeof computed<string>>
	handleGalleryPrev: () => void
	handleGalleryNext: () => void
	handleGalleryGo: (index: number) => void
}

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
