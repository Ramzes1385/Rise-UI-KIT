import { computed, onUnmounted, ref, watch } from 'vue'
import { UI_SIZE } from '@constants'
import { buildOptimizedSrc, buildSrcset, isExternalImage, replaceExtension } from '@utils/imageUtils'
import type { UseImageStateOptions } from './useImageState.types'

/** Описание: управляет состоянием изображения — загрузка, таймаут, fallback, оптимизированные src/srcset и стили контейнера */
function useImageState(options: UseImageStateOptions) {
	const isLoaded = ref(false)
	const hasError = ref(false)
	const isUsingFallback = ref(false)
	let loadingTimeoutId: number | null = null

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
			styles['min-height'] = UI_SIZE.IMAGE_LOADING_MIN_HEIGHT
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

	const avifSrc = computed((): string | null => {
		const src = options.src()
		if (isExternalImage(src)) return null
		return replaceExtension(src, '.avif')
	})

	const webpSrc = computed((): string | null => {
		const src = options.src()
		if (options.convertToWebp()) return replaceExtension(src, '.webp')
		if (isExternalImage(src)) return null
		return replaceExtension(src, '.webp')
	})

	const srcsetValue = computed((): string | undefined => buildSrcset(options.src(), options.srcWidth?.()))

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

	function handleLoad(): void {
		clearLoadingTimeout()
		isLoaded.value = true
		options.onLoad?.()
	}

	function handleError(): void {
		clearLoadingTimeout()
		const fallback = options.fallbackSrc?.()
		if (fallback && !isUsingFallback.value) {
			isUsingFallback.value = true
			hasError.value = false
			isLoaded.value = false
			startLoadingTimeout()
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
			startLoadingTimeout()
		},
		{ immediate: true },
	)

	onUnmounted(() => {
		clearLoadingTimeout()
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
