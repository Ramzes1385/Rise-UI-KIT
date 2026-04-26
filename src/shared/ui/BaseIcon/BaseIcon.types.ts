import type { CustomColor } from '@/shared/composables/useCustomColor'

/** Варианты отображения иконки */
export const ICON_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Пропсы компонента BaseIcon
 */
export interface BaseIconProps {
	/** Имя иконки (соответствует имени SVG-файла без расширения) */
	name: string
	/** Размер */
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
	/** Вариант отображения */
	variant?: (typeof ICON_VARIANTS)[number]
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Поворот (градусы) */
	rotate?: number
	/** Отразить по горизонтали */
	isFlipX?: boolean
	/** Отразить по вертикали */
	isFlipY?: boolean
	/** Доступная метка для скринридеров (пустая строка — декоративная иконка) */
	ariaLabel?: string
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
}
