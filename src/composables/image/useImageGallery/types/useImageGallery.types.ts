import type { ComputedRef, Ref } from 'vue'

/** Элемент галереи: адрес и свой альтернативный текст (без `alt` — текст изображения, из которого открыт просмотр) */
export interface ImageGalleryItem {
	/** URL изображения */
	src: string
	/** Альтернативный текст этого изображения */
	alt?: string
}

/** Элемент галереи: адрес строкой или объект с адресом и `alt` */
export type ImageGallerySource = string | ImageGalleryItem

export interface UseImageGalleryOptions {
	/** Изображения галереи (геттер) */
	gallery: () => ImageGallerySource[] | undefined
	/** Изображение вне галереи или при одном элементе (геттер) */
	src: () => string
	/** Сброс масштаба при смене изображения */
	resetZoom: () => void
}

export interface UseImageGalleryReturn {
	/** Номер текущего изображения */
	galleryIndex: Ref<number>
	/** Адреса изображений галереи */
	galleryList: ComputedRef<string[]>
	/** В галерее больше одного изображения */
	hasGallery: ComputedRef<boolean>
	/** Есть предыдущее изображение */
	hasGalleryPrev: ComputedRef<boolean>
	/** Есть следующее изображение */
	hasGalleryNext: ComputedRef<boolean>
	/** Адрес изображения в просмотре */
	currentZoomSrc: ComputedRef<string>
	/** `alt` текущего элемента галереи; не задан — `undefined` */
	currentAlt: ComputedRef<string | undefined>
	/** Предыдущее изображение */
	handleGalleryPrev: () => void
	/** Следующее изображение */
	handleGalleryNext: () => void
	/** Изображение по номеру */
	handleGalleryGo: (index: number) => void
}
