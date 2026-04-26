import type { CustomColor } from '@/shared/composables/useCustomColor'

/** Варианты отображения изображения */
export const IMAGE_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Режим заполнения изображения
 */
export type ImageFit = 'cover' | 'contain' | 'fill' | 'none'

/**
 * Режим ленивой загрузки
 */
export type ImageLoading = 'lazy' | 'eager'

/**
 * Пропсы компонента BaseImage
 */
export interface BaseImageProps {
	/** URL изображения */
	src: string
	/** Альтернативный текст */
	alt: string
	/** Ширина */
	width?: number | string
	/** Высота */
	height?: number | string
	/** Режим заполнения */
	fit?: ImageFit
	/** Вариант отображения */
	variant?: (typeof IMAGE_VARIANTS)[number]
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Ленивая загрузка */
	loading?: ImageLoading
	/** Скругление */
	borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full'
	/** Показывать плейсхолдер при загрузке */
	hasPlaceholder?: boolean
	/** Аспектное соотношение (например '16/9') */
	aspectRatio?: string
	/** URL-параметры для оптимизации (ширина) */
	srcWidth?: number
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
	/** Конвертировать в WebP формат */
	convertToWebp?: boolean
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
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
