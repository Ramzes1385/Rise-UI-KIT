import type { CustomClassProp } from '@composables/useCustomClass'
import type { CustomColor } from '@composables/useCustomColor'

/**
 * Вариант лоадера
 */
export type LoaderVariant = 'spinner' | 'dots' | 'pulse' | 'bars'

/**
 * Пропсы компонента BaseLoader
 */
export interface BaseLoaderProps {
	/** Вариант анимации */
	variant?: LoaderVariant
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Показывать текст */
	hasLabel?: boolean
	/** Текст загрузки */
	label?: string
	/** Оверлей поверх родительского контейнера */
	isOverlay?: boolean
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
	/** Кастомные классы (строка или объект) */
	customClass?: CustomClassProp
}
