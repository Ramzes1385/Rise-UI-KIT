import type { CustomColor } from '@/shared/composables/useCustomColor'

/**
 * Вариант лоадера
 */
export type LoaderVariant = 'spinner' | 'dots' | 'pulse' | 'bars'

/**
 * Размер лоадера
 */
export type LoaderSize = 'xs' | 'sm' | 'md' | 'lg'

/**
 * Пропсы компонента BaseLoader
 */
export interface BaseLoaderProps {
	/** Вариант анимации */
	variant?: LoaderVariant
	/** Размер */
	size?: LoaderSize
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Показывать текст */
	hasLabel?: boolean
	/** Текст загрузки */
	label?: string
	/** Полноэкранный оверлей */
	isOverlay?: boolean
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
}
