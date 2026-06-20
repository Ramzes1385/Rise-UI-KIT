import type { BaseComponentProps } from '../../../types/base.types'

/**
 * Вариант лоадера
 */
export type LoaderVariant = 'spinner' | 'dots' | 'pulse' | 'bars'

/**
 * Пропсы компонента BaseLoader
 */
export interface BaseLoaderProps extends BaseComponentProps<LoaderVariant> {
	/** Показывать текст */
	hasLabel?: boolean
	/** Текст загрузки */
	label?: string
	/** Оверлей поверх родительского контейнера */
	isOverlay?: boolean
}

/**
 * События компонента BaseLoader
 */
export type BaseLoaderEmits = Record<string, never>

/**
 * Слоты компонента BaseLoader
 */
export interface BaseLoaderSlots {
	default?: () => unknown
}
