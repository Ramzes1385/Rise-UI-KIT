import type { ImgHTMLAttributes } from 'vue'
import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { SeoComponentProps } from '@composables/seo/useStructuredData'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { ImageGallerySource } from '@composables/image/useImageGallery'

export type ImageFit = 'cover' | 'contain' | 'fill' | 'none'

export type ImageLoading = 'lazy' | 'eager'

/**
 * Части изображения для пропа `ui` (БЭМ-элементы `.base-image__<часть>`, `root` — контейнер):
 * placeholder, shimmer — заглушка загрузки и её мерцание; error, error-icon, error-text — блок ошибки; frame — обёртка
 * (кнопка при зуме); img — само изображение. Окно просмотра: zoom — оверлей, zoom-toolbar, zoom-btn, zoom-scale,
 * zoom-divider — панель кнопок; zoom-nav — стрелки галереи; zoom-container, zoom-img — область и изображение;
 * zoom-gallery, zoom-gallery-track, zoom-thumb, zoom-thumb-img, zoom-counter — лента миниатюр и счётчик;
 * minimap, minimap-img, minimap-viewport — мини-карта.
 */
export const IMAGE_PARTS = [
	'placeholder',
	'shimmer',
	'error',
	'error-icon',
	'error-text',
	'frame',
	'img',
	'zoom',
	'zoom-toolbar',
	'zoom-btn',
	'zoom-scale',
	'zoom-divider',
	'zoom-nav',
	'zoom-container',
	'zoom-img',
	'zoom-gallery',
	'zoom-gallery-track',
	'zoom-thumb',
	'zoom-thumb-img',
	'zoom-counter',
	'minimap',
	'minimap-img',
	'minimap-viewport',
] as const

export type BaseImagePart = (typeof IMAGE_PARTS)[number]

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

export interface BaseImageProps
	extends
		SeoComponentProps,
		Omit<
			BaseComponentProps<
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
			>,
			'variant'
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
	/**
	 * Галерея изображений для навигации в режиме зума: адреса строками или `{ src, alt }`.
	 * Свой `alt` элемента озвучивается в имени окна просмотра при листании; без него — `alt` изображения.
	 */
	gallery?: ImageGallerySource[]
	/**
	 * Атрибуты самого `<img>`: `crossorigin`, `fetchpriority`, `referrerpolicy` и др.
	 * Атрибуты на компоненте (`class`, `style`, `data-*`) уходят на корневой блок.
	 */
	imgAttrs?: ImgHTMLAttributes
	/**
	 * Классы частей изображения и окна просмотра (список — `IMAGE_PARTS`: `root`, `placeholder`, `img`, `zoom`,
	 * `zoom-toolbar`, `zoom-thumb`…) — добавляются к классам кита. Глобально —
	 * `createUiKitPlugin({ defaults: { BaseImage: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseImage :src="src" alt="Горы" :ui="{ root: 'shadow-lg', zoom: 'backdrop-blur' }" />
	 */
	ui?: UiProp<BaseImagePart>
}

export interface BaseImageEmits {
	(event: 'load'): void
	(event: 'error'): void
	/** Масштаб в окне просмотра изменился */
	(event: 'zoom', scale: number): void
	/** Окно просмотра открылось */
	(event: 'zoom-open'): void
	/** Окно просмотра закрылось */
	(event: 'zoom-close'): void
}

/** Методы экземпляра BaseImage (`ref`) */
export interface BaseImageExpose {
	/** Открыть окно просмотра (только при `zoomConfig.hasZoom`) */
	openZoom: () => void
	/** Закрыть окно просмотра */
	closeZoom: () => void
}

export interface BaseImageSlots {
	/** Заглушка, пока картинка загружается (по умолчанию — мерцающий фон) */
	placeholder?: () => unknown
	/** Содержимое при ошибке загрузки (по умолчанию — значок и текст «Ошибка загрузки») */
	error?: () => unknown
}

export type ImageProps = PropsWithDefaults<BaseImageProps, 'timeout' | 'loading' | 'convertToWebp' | 'convertToAvif' | 'sizeScale'>
