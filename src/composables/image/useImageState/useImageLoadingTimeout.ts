/** Composable: таймаут загрузки изображения; для lazy-изображения отсчёт идёт с попадания в зону видимости */
import { onUnmounted, watch } from 'vue'
import type { UseImageLoadingTimeoutOptions } from './types/useImageState.types'

/** Описание: запускает и снимает таймаут загрузки; `arm` — перезапуск, `stop` — снять таймер и наблюдение */
function useImageLoadingTimeout({ options, isLoaded, hasError, onTimeout }: UseImageLoadingTimeoutOptions) {
	let loadingTimeoutId: number | null = null
	let visibilityObserver: IntersectionObserver | null = null

	function clearLoadingTimeout(): void {
		if (loadingTimeoutId === null) return
		clearTimeout(loadingTimeoutId)
		loadingTimeoutId = null
	}

	function startLoadingTimeout(): void {
		clearLoadingTimeout()
		const timeout = options.timeout()
		if (!timeout || timeout <= 0) return
		loadingTimeoutId = window.setTimeout(() => {
			if (!isLoaded.value && !hasError.value) onTimeout()
		}, timeout)
	}

	function stop(): void {
		clearLoadingTimeout()
		visibilityObserver?.disconnect()
		visibilityObserver = null
	}

	/**
	 * Запускает отсчёт таймаута загрузки. lazy-изображение браузер запрашивает только у viewport, поэтому отсчёт идёт
	 * с попадания в зону видимости: иначе картинка ниже первого экрана уходила в ошибку (и <img> удалялся) до начала загрузки.
	 * Без IntersectionObserver начало lazy-загрузки неизвестно — таймаут к такому изображению не применяется.
	 */
	function arm(): void {
		stop()
		if (isLoaded.value || hasError.value) return
		if (options.loading?.() !== 'lazy') {
			startLoadingTimeout()
			return
		}
		const img = options.imgRef?.value
		if (!img || typeof IntersectionObserver === 'undefined') return
		visibilityObserver = new IntersectionObserver(entries => {
			if (!entries.some(entry => entry.isIntersecting)) return
			stop()
			startLoadingTimeout()
		})
		visibilityObserver.observe(img)
	}

	// <img> появляется только после монтирования и пересоздаётся после ошибки — наблюдение переносится на актуальный элемент
	if (options.imgRef) {
		watch(
			options.imgRef,
			() => {
				if (options.loading?.() === 'lazy') arm()
			},
			{ flush: 'post' },
		)
	}

	onUnmounted(stop)

	return { arm, stop }
}

export { useImageLoadingTimeout }
