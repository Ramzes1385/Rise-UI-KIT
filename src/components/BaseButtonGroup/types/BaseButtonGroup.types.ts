import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Вариант оформления один: вид задают кнопки внутри */
export const BUTTON_GROUP_VARIANTS = ['default'] as const

/**
 * Части группы для пропа `ui`: своих БЭМ-элементов у группы нет — только `root` (сама группа);
 * кнопки внутри настраиваются своими пропами `ui`.
 */
export const BUTTON_GROUP_PARTS = [] as const

export type BaseButtonGroupPart = (typeof BUTTON_GROUP_PARTS)[number]

export interface BaseButtonGroupProps extends BaseComponentProps<(typeof BUTTON_GROUP_VARIANTS)[number], 'root'> {
	/** Направление: кнопки в ряд или столбиком */
	orientation?: 'horizontal' | 'vertical'
	/** Имя группы для скринридера, например «Выравнивание текста» */
	ariaLabel?: string
	/**
	 * Классы частей группы (`root`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseButtonGroup: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseButtonGroup :ui="{ root: 'shadow-sm' }" aria-label="Период">…</BaseButtonGroup>
	 */
	ui?: UiProp<BaseButtonGroupPart>
}

export interface BaseButtonGroupSlots {
	/** Кнопки (BaseButton, BaseSplitButton, BaseDropdownMenu с кнопкой) */
	default?: () => unknown
}
