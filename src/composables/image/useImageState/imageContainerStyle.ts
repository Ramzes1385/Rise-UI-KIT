/** Утилиты: стили контейнера изображения (размеры, заглушка загрузки, скругление) */
import type { UseImageStateOptions } from './types/useImageState.types'

/** Высота заглушки, пока размер изображения неизвестен */
const LOADING_MIN_HEIGHT = '120px'

/** Описание: размер с учётом масштаба (`--size-scale`); число — в пикселях */
function scaledSize(value: number | string): string {
	const size = typeof value === 'number' ? `${value}px` : value
	return `calc(${size} * var(--size-scale, 1))`
}

/** Описание: заданы ли размеры изображения (ширина, высота или пропорции) */
function hasCustomDimensions(options: UseImageStateOptions): boolean {
	return !!options.width?.() || !!options.height?.() || !!options.aspectRatio?.()
}

/** Описание: стили размеров из width, height и aspectRatio; пропорции важнее ширины и высоты */
function buildDimensionStyle(options: UseImageStateOptions): Record<string, string> {
	const aspectRatio = options.aspectRatio?.()
	if (aspectRatio) return { 'aspect-ratio': aspectRatio }
	const styles: Record<string, string> = {}
	const width = options.width?.()
	const height = options.height?.()
	if (width) styles.width = scaledSize(width)
	if (height) styles.height = scaledSize(height)
	return styles
}

/**
 * Описание: стили контейнера изображения. Пока изображение без заданных размеров не загружено
 * или не загрузилось, контейнер держит заглушку 16:9 с минимальной высотой.
 */
function buildImageContainerStyle(options: UseImageStateOptions, isPending: boolean): Record<string, string> {
	const styles = buildDimensionStyle(options)
	if (isPending && !hasCustomDimensions(options)) {
		styles['aspect-ratio'] = '16/9'
		styles['min-height'] = LOADING_MIN_HEIGHT
		styles['width'] = '100%'
	}
	return styles
}

/** Описание: стиль скругления контейнера с учётом масштаба */
function buildBorderRadiusStyle(radius: number | undefined): Record<string, string> {
	if (radius === 0) return { borderRadius: '0' }
	return { borderRadius: `calc(${radius}px * var(--size-scale, 1))` }
}

export { buildBorderRadiusStyle, buildImageContainerStyle }
