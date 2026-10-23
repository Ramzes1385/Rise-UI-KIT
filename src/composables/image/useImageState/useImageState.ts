/** Composable: управление состоянием изображения (загрузка, fallback, оптимизированные src) */
import { computed, ref, watch } from 'vue'
import { useImageSources } from './useImageSources'
import { useImageLoadingTimeout } from './useImageLoadingTimeout'
import type { UseImageStateOptions } from './types/useImageState.types'
import { buildBorderRadiusStyle, buildImageContainerStyle } from './imageContainerStyle'

/** Описание: управляет состоянием изображения — загрузка, таймаут, fallback, оптимизированные src/srcset и стили контейнера */
function useImageState(options: UseImageStateOptions) {
	const isLoaded = ref(false)
	const hasError = ref(false)
	const isUsingFallback = ref(false)
	const loadingTimeout = useImageLoadingTimeout({ options, isLoaded, hasError, onTimeout: () => handleError() })

	const containerStyle = computed((): Record<string, string> => buildImageContainerStyle(options, !isLoaded.value || hasError.value))
	const borderRadiusStyle = computed((): Record<string, string> => buildBorderRadiusStyle(options.borderRadius()))

	function handleLoad(): void {
		loadingTimeout.stop()
		isLoaded.value = true
		options.onLoad?.()
	}

	function handleError(): void {
		loadingTimeout.stop()
		const fallback = options.fallbackSrc?.()
		if (fallback && !isUsingFallback.value) {
			isUsingFallback.value = true
			hasError.value = false
			isLoaded.value = false
			loadingTimeout.arm()
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
			if (options.src()) loadingTimeout.arm()
			else loadingTimeout.stop()
		},
		{ immediate: true },
	)

	return { isLoaded, hasError, containerStyle, borderRadiusStyle, ...useImageSources(options, isUsingFallback), handleLoad, handleError }
}

export { useImageState }
