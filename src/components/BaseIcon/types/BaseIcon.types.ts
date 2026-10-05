import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Части иконки для пропа `ui` (БЭМ-элементы `.base-icon__<часть>`, `root` — обёртка): svg — сам SVG-элемент. */
export const ICON_PARTS = ['svg'] as const

export type BaseIconPart = (typeof ICON_PARTS)[number]

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
	/**
	 * Классы частей иконки (`root`, `svg`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseIcon: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseIcon name="star" :ui="{ root: 'icon-tile', svg: 'icon-glow' }" />
	 */
	ui?: UiProp<BaseIconPart>
}

export type BaseIconEmits = Record<string, never>

/** Слотов нет: содержимое строится из props */
export type BaseIconSlots = Record<never, never>
