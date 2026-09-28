/** Composable: управление состоянием изображения (загрузка, fallback, оптимизированные src) */
import { computed, onUnmounted, ref, watch } from 'vue'
import type { UseImageStateOptions } from './types/useImageState.types'
import { buildOptimizedSrc, buildSrcset, replaceExtension } from '@utils/imageUtils'

/** Высота заглушки, пока размер изображения неизвестен */
const LOADING_MIN_HEIGHT = '120px'

/** Описание: управляет состоянием изображения — загрузка, таймаут, fallback, оптимизированные src/srcset и стили контейнера */
function useImageState(options: UseImageStateOptions) {
	const isLoaded = ref(false)
	const hasError = ref(false)
	const isUsingFallback = ref(false)
	let loadingTimeoutId: number | null = null
	let visibilityObserver: IntersectionObserver | null = null

	const hasCustomDimensions = computed((): boolean => {
		return !!options.width?.() || !!options.height?.() || !!options.aspectRatio?.()
	})

	const containerStyle = computed((): Record<string, string> => {
		const styles: Record<string, string> = {}

		const aspectRatio = options.aspectRatio?.()
		const width = options.width?.()
		const height = options.height?.()

		if (aspectRatio) {
			styles['aspect-ratio'] = aspectRatio
		}

		if (width && !aspectRatio) {
			const widthValue = typeof width === 'number' ? `${width}px` : width
			styles.width = `calc(${widthValue} * var(--size-scale, 1))`
		}

		if (height && !aspectRatio) {
			const heightValue = typeof height === 'number' ? `${height}px` : height
			styles.height = `calc(${heightValue} * var(--size-scale, 1))`
		}

		if (!hasCustomDimensions.value && (!isLoaded.value || hasError.value)) {
			styles['aspect-ratio'] = '16/9'
			styles['min-height'] = LOADING_MIN_HEIGHT
			styles['width'] = '100%'
		}

		return styles
	})

	const borderRadiusStyle = computed((): Record<string, string> => {
		const radius = options.borderRadius()
		if (radius === 0) return { borderRadius: '0' }
		return { borderRadius: `calc(${radius}px * var(--size-scale, 1))` }
	})

	const optimizedSrc = computed((): string => buildOptimizedSrc(options.src(), options.srcWidth?.()))

	const currentSrc = computed((): string => {
		if (isUsingFallback.value && options.fallbackSrc?.()) {
			return options.fallbackSrc()!
		}
		return optimizedSrc.value
	})

	/**
	 * Производный <source> (файл-сосед с другим расширением) строится только по явному флагу:
	 * браузер выбирает <source> по type, не проверяя существование файла, и при 404 не переходит
	 * к <img src> — автоматическое добавление ломало любые изображения без .avif/.webp-копий.
	 * Пока показывается fallbackSrc, производные источники убираются, иначе они перекрывали бы его.
	 */
	function buildFormatSrc(isEnabled: boolean, extension: string): string | null {
		if (!isEnabled || isUsingFallback.value) return null
		const src = options.src()
		if (!src || src.startsWith('data:') || src.startsWith('blob:')) return null
		const formatSrc = replaceExtension(src, extension)
		return formatSrc === src ? null : formatSrc
	}

	const avifSrc = computed((): string | null => buildFormatSrc(options.convertToAvif?.() ?? false, '.avif'))

	const webpSrc = computed((): string | null => buildFormatSrc(options.convertToWebp(), '.webp'))

	// srcset приоритетнее src: пока показывается fallbackSrc, варианты исходного изображения не выводятся
	const srcsetValue = computed((): string | undefined => {
		if (isUsingFallback.value) return undefined
		return buildSrcset(options.src(), options.srcWidth?.())
	})

	const sizesValue = computed((): string => {
		const width = options.width?.()
		if (width) return `${width}px`
		return '100vw'
	})

	function clearLoadingTimeout(): void {
		if (loadingTimeoutId !== null) {
			clearTimeout(loadingTimeoutId)
			loadingTimeoutId = null
		}
	}

	function startLoadingTimeout(): void {
		clearLoadingTimeout()
		const timeout = options.timeout()
		if (timeout && timeout > 0) {
			loadingTimeoutId = window.setTimeout(() => {
				if (!isLoaded.value && !hasError.value) {
					handleError()
				}
			}, timeout)
		}
	}

	function stopVisibilityObserver(): void {
		visibilityObserver?.disconnect()
		visibilityObserver = null
	}

	/**
	 * Запускает отсчёт таймаута загрузки. lazy-изображение браузер запрашивает только при приближении
	 * к viewport, поэтому для него отсчёт начинается с попадания в зону видимости: иначе картинка ниже
	 * первого экрана уходила в ошибку (и <img> удалялся) раньше, чем её загрузка вообще начиналась.
	 * Без IntersectionObserver начало lazy-загрузки неизвестно — таймаут к такому изображению не применяется.
	 */
	function armLoadingTimeout(): void {
		clearLoadingTimeout()
		stopVisibilityObserver()
		if (isLoaded.value || hasError.value) return
		if (options.loading?.() !== 'lazy') {
			startLoadingTimeout()
			return
		}
		const img = options.imgRef?.value
		if (!img || typeof IntersectionObserver === 'undefined') return
		visibilityObserver = new IntersectionObserver(entries => {
			if (!entries.some(entry => entry.isIntersecting)) return
			stopVisibilityObserver()
			startLoadingTimeout()
		})
		visibilityObserver.observe(img)
	}

	function handleLoad(): void {
		clearLoadingTimeout()
		stopVisibilityObserver()
		isLoaded.value = true
		options.onLoad?.()
	}

	function handleError(): void {
		clearLoadingTimeout()
		stopVisibilityObserver()
		const fallback = options.fallbackSrc?.()
		if (fallback && !isUsingFallback.value) {
			isUsingFallback.value = true
			hasError.value = false
			isLoaded.value = false
			armLoadingTimeout()
		} else {
			hasError.value = true
			options.onError?.()
		}
	}

	watch(
		options.src,
		() => {
			isLoaded.value = false
			hasError.value = false
			isUsingFallback.value = false
			armLoadingTimeout()
		},
		{ immediate: true },
	)

	// <img> появляется только после монтирования и пересоздаётся после ошибки — наблюдение переносится на актуальный элемент
	if (options.imgRef) {
		watch(
			options.imgRef,
			() => {
				if (options.loading?.() === 'lazy') armLoadingTimeout()
			},
			{ flush: 'post' },
		)
	}

	onUnmounted(() => {
		clearLoadingTimeout()
		stopVisibilityObserver()
	})

	return {
		isLoaded,
		hasError,
		containerStyle,
		borderRadiusStyle,
		currentSrc,
		avifSrc,
		webpSrc,
		srcsetValue,
		sizesValue,
		handleLoad,
		handleError,
	}
}

export { useImageState }
