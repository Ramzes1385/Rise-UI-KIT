import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export interface BaseIconProps extends Omit<BaseComponentProps<string, 'root' | 'svg'>, 'color'> {
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

export type BaseIconEmits = Record<string, never>

/** Слотов нет: содержимое строится из props */
export type BaseIconSlots = Record<never, never>
