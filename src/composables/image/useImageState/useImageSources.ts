/** Composable: источники изображения — оптимизированный src, fallback, производные AVIF/WebP, srcset и sizes */
import type { Ref } from 'vue'
import { computed } from 'vue'
import type { UseImageStateOptions } from './types/useImageState.types'
import { buildOptimizedSrc, buildSizes, buildSrcset, replaceExtension } from '@utils/media/imageUtils'

/** Описание: src, srcset и sizes изображения; пока показывается fallbackSrc, производные источники убираются */
function useImageSources(options: UseImageStateOptions, isUsingFallback: Readonly<Ref<boolean>>) {
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

	const sizesValue = computed((): string => buildSizes(options.width?.()))

	return { currentSrc, avifSrc, webpSrc, srcsetValue, sizesValue }
}

export { useImageSources }
