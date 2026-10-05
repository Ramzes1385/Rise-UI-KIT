import type { BaseImagePart } from './BaseImage.types'
import type { UiClassFn } from '@composables/base/useUi'
import type { useImageZoom } from '@composables/image/useImageZoom'
import type { useImageGallery } from '@composables/image/useImageGallery'

export interface BaseImageZoomProps {
	/** API зума изображения */
	zoom: ReturnType<typeof useImageZoom>
	/** API галереи изображений */
	gallery: ReturnType<typeof useImageGallery>
	/** Альтернативный текст */
	alt: string
	/** Объект CSS-классов для кастомизации элементов зума */
	classes: Record<string, string | undefined>
	/** Классы частей из пропа `ui` BaseImage: `ui('zoom-toolbar')` → БЭМ-класс и классы приложения */
	ui: UiClassFn<BaseImagePart>
	/** Показывать мини-карту при зуме */
	showMinimap: boolean
	/** Текущий масштаб */
	currentScale: number
}

export interface BaseImageZoomEmits {
	/** Окно просмотра закрылось и его анимация ухода закончилась — родитель может убрать компонент */
	(event: 'after-leave'): void
}
