import type { Ref } from 'vue'

export interface UseImageStateOptions {
	src: () => string
	fallbackSrc?: () => string | undefined
	timeout: () => number
	width?: () => number | string | undefined
	height?: () => number | string | undefined
	aspectRatio?: () => string | undefined
	borderRadius: () => number | undefined
	srcWidth?: () => number | undefined
	/** Добавить <source> WebP с тем же именем файла и расширением .webp */
	convertToWebp: () => boolean
	/** Добавить <source> AVIF с тем же именем файла и расширением .avif */
	convertToAvif?: () => boolean
	/** Режим загрузки <img>: для lazy таймаут отсчитывается с попадания изображения в зону видимости */
	loading?: () => 'lazy' | 'eager' | undefined
	/** Элемент <img>, за видимостью которого следит таймаут lazy-загрузки */
	imgRef?: Readonly<Ref<HTMLImageElement | null>>
	onLoad?: () => void
	onError?: () => void
}

/** Параметры таймаута загрузки изображения (useImageLoadingTimeout) */
export interface UseImageLoadingTimeoutOptions {
	/** Параметры useImageState: timeout, loading, imgRef */
	options: UseImageStateOptions
	/** Изображение загружено */
	isLoaded: Readonly<Ref<boolean>>
	/** Изображение не загрузилось */
	hasError: Readonly<Ref<boolean>>
	/** Вызывается, когда время загрузки истекло, а изображение не загрузилось и не упало */
	onTimeout: () => void
}
