import type { CustomClassProp } from '@composables/useCustomClass'

/**
 * Пропсы компонента BaseIcon
 */
export interface BaseIconProps {
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
	/** Масштаб размера (100 = 20px, 60 = 12px, 140 = 28px) */
	sizeScale?: number
	/** Кастомные классы (строка или объект) */
	customClass?: CustomClassProp
}
