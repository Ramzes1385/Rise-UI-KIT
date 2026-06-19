import type { ComputedRef, Ref } from 'vue'

export interface UseImageGalleryOptions {
	gallery: () => string[] | undefined
	src: () => string
	resetZoom: () => void
}

export interface UseImageGalleryReturn {
	galleryIndex: Ref<number>
	galleryList: ComputedRef<string[]>
	hasGallery: ComputedRef<boolean>
	hasGalleryPrev: ComputedRef<boolean>
	hasGalleryNext: ComputedRef<boolean>
	currentZoomSrc: ComputedRef<string>
	handleGalleryPrev: () => void
	handleGalleryNext: () => void
	handleGalleryGo: (index: number) => void
}
