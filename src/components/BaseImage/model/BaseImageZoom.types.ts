import type { useImageGallery } from './useImageGallery'
import type { useImageZoom } from '@composables/useImageZoom'

/** Props компонента BaseImageZoom */
export interface BaseImageZoomProps {
	/** API зума изображения */
	zoom: ReturnType<typeof useImageZoom>
	/** API галереи изображений */
	gallery: ReturnType<typeof useImageGallery>
	/** Альтернативный текст */
	alt: string
	/** Объект CSS-классов для кастомизации элементов зума */
	classes: Record<string, string>
	/** Показывать мини-карту при зуме */
	showMinimap: boolean
	/** Текущий масштаб */
	currentScale: number
}
