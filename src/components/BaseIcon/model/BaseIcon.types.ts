import type { BaseComponentProps } from '../../../types/base.types'

/**
 * Пропсы компонента BaseIcon
 */
export interface BaseIconProps extends Omit<BaseComponentProps, 'color'> {
	/** Имя иконки (соответствует имени SVG-файла без расширения) */
	name: string
	/** Цвет (CSS-значение или переменная) */
	color?: string
	/** Поворот (градусы) */
	rotate?: number
	/** Отразить по горизонтали */
	isFlipX?: boolean
	/** Отразить по вертикали */
	isFlipY?: boolean
	/** Доступная метка для скринридеров (пустая строка — декоративная иконка) */
	ariaLabel?: string
}

/**
 * События компонента BaseIcon
 */
export type BaseIconEmits = Record<string, never>

/**
 * Слоты компонента BaseIcon
 */
export interface BaseIconSlots {
	default?: () => unknown
}
