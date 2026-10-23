import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { DropdownMenuItem, DropdownMenuItems } from '@components/BaseDropdownMenu'

/** Варианты — как у BaseButton: обе кнопки одного варианта */
export const SPLIT_BUTTON_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft', 'tonal'] as const

/**
 * Части кнопки с меню для пропа `ui` (БЭМ-элементы `.base-split-button__<часть>`, `root` — группа из двух кнопок):
 * main — основная кнопка (BaseButton), menu — обёртка меню (BaseDropdownMenu), toggle — кнопка-стрелка меню (BaseButton).
 * Вид самих кнопок задают токены `--rise-button-*` — они действуют на обе половины.
 */
export const SPLIT_BUTTON_PARTS = ['main', 'menu', 'toggle'] as const

export type BaseSplitButtonPart = (typeof SPLIT_BUTTON_PARTS)[number]

export interface BaseSplitButtonProps extends BaseComponentProps<(typeof SPLIT_BUTTON_VARIANTS)[number], 'root' | 'main' | 'toggle'> {
	/** Подпись основной кнопки (заменяется слотом default) */
	label?: string
	/** Пункты меню дополнительных действий (как у BaseDropdownMenu) */
	items: DropdownMenuItems
	/** Имя кнопки меню для скринридера (по умолчанию «Другие действия») */
	menuLabel?: string
	/** Отключает обе кнопки */
	isDisabled?: boolean
	/** Загрузка основного действия: основная кнопка занята, меню доступно */
	isLoading?: boolean
	/**
	 * Классы частей (`root`, `main`, `menu`, `toggle`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseSplitButton: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseSplitButton label="Сохранить" :items="items" :ui="{ root: 'shadow-sm', toggle: 'px-3' }" />
	 */
	ui?: UiProp<BaseSplitButtonPart>
}

export interface BaseSplitButtonEmits {
	/** Основное действие */
	(event: 'click', e: MouseEvent): void
	/** Выбран пункт меню */
	(event: 'select', item: DropdownMenuItem, e: Event): void
}

export interface BaseSplitButtonSlots {
	/** Содержимое основной кнопки вместо label */
	default?: () => unknown
}
