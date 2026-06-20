import type { BaseComponentProps } from '../../../types/base.types'

/**
 * Режим заполнения изображения
 */
export type ImageFit = 'cover' | 'contain' | 'fill' | 'none'

/**
 * Режим ленивой загрузки
 */
export type ImageLoading = 'lazy' | 'eager'

/**
 * Конфигурация зума изображения
 */
export interface ImageZoomConfig {
	/** Включить зум по клику */
	hasZoom?: boolean
	/** Закрытие зума по клику на оверлей */
	closeOnOverlay?: boolean
	/** Начальный масштаб зума */
	initialScale?: number
	/** Шаг масштаба при зуме */
	zoomStep?: number
	/** Минимальный масштаб */
	minScale?: number
	/** Максимальный масштаб */
	maxScale?: number
	/** Показывать мини-карту при зуме */
	showMinimap?: boolean
}

/**
 * Пропсы компонента BaseImage
 */
export interface BaseImageProps extends BaseComponentProps {
	/** URL изображения */
	src: string
	/** Альтернативный текст */
	alt: string
	/** URL резервного изображения при ошибке загрузки */
	fallbackSrc?: string
	/** Таймаут загрузки изображения в миллисекундах (если не загрузилось за это время, считается ошибкой) */
	timeout?: number
	/** Ширина */
	width?: number | string
	/** Высота */
	height?: number | string
	/** Режим заполнения */
	fit?: ImageFit
	/** Ленивая загрузка */
	loading?: ImageLoading
	/** Скругление (0–9999px) */
	borderRadius?: number
	/** Показывать плейсхолдер при загрузке */
	hasPlaceholder?: boolean
	/** Аспектное соотношение (например '16/9') */
	aspectRatio?: string
	/** URL-параметры для оптимизации (ширина) */
	srcWidth?: number
	/** Группа: конфигурация зума */
	zoomConfig?: ImageZoomConfig
	/** Конвертировать в WebP формат */
	convertToWebp?: boolean
	/** Галерея изображений для навигации в режиме зума */
	gallery?: string[]
}

/**
 * События компонента BaseImage
 */
export interface BaseImageEmits {
	(event: 'load'): void
	(event: 'error'): void
	(event: 'zoom', scale: number): void
}

/**
 * Слоты компонента BaseImage
 */
export interface BaseImageSlots {
	placeholder?: () => unknown
	error?: () => unknown
}
