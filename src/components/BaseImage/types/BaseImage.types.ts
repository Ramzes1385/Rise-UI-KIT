import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export type ImageFit = 'cover' | 'contain' | 'fill' | 'none'

export type ImageLoading = 'lazy' | 'eager'

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

export interface BaseImageProps extends BaseComponentProps<
	string,
	| 'root'
	| 'placeholder'
	| 'error'
	| 'img'
	| 'zoomOutButton'
	| 'zoomOutIcon'
	| 'zoomScale'
	| 'zoomInButton'
	| 'zoomInIcon'
	| 'zoomResetButton'
	| 'zoomResetIcon'
	| 'rotateLeftButton'
	| 'rotateLeftIcon'
	| 'rotateRightButton'
	| 'rotateRightIcon'
	| 'zoomCloseButton'
	| 'zoomCloseIcon'
	| 'galleryPrevButton'
	| 'galleryPrevIcon'
	| 'galleryNextButton'
	| 'galleryNextIcon'
	| 'galleryCounter'
> {
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
	/**
	 * Скругление в px (0–9999, масштабируется `sizeScale`; 9999 — круг).
	 * Без пропа — радиус md темы (`--rise-radius-md`), его меняет токен `--rise-radius`.
	 */
	borderRadius?: number
	/** Показывать плейсхолдер при загрузке */
	hasPlaceholder?: boolean
	/** Аспектное соотношение (например '16/9') */
	aspectRatio?: string
	/** URL-параметры для оптимизации (ширина) */
	srcWidth?: number
	/** Группа: конфигурация зума */
	zoomConfig?: ImageZoomConfig
	/**
	 * Добавить <source type="image/webp"> с тем же именем файла и расширением .webp.
	 * Включайте, только если рядом с изображением на сервере лежит .webp-копия: браузер выберет этот источник
	 * и при 404 не вернётся к src.
	 */
	convertToWebp?: boolean
	/**
	 * Добавить <source type="image/avif"> с тем же именем файла и расширением .avif.
	 * Включайте, только если рядом с изображением на сервере лежит .avif-копия.
	 */
	convertToAvif?: boolean
	/** Галерея изображений для навигации в режиме зума */
	gallery?: string[]
}

export interface BaseImageEmits {
	(event: 'load'): void
	(event: 'error'): void
	(event: 'zoom', scale: number): void
}

export interface BaseImageSlots {
	/** Заглушка, пока картинка загружается (по умолчанию — мерцающий фон) */
	placeholder?: () => unknown
	/** Содержимое при ошибке загрузки (по умолчанию — значок и текст «Ошибка загрузки») */
	error?: () => unknown
}

export type ImageProps = PropsWithDefaults<BaseImageProps, 'timeout' | 'loading' | 'convertToWebp' | 'convertToAvif' | 'sizeScale'>
