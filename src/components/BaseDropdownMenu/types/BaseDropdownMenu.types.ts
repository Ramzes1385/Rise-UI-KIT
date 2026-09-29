import type { BaseComponentProps } from '@composables/useBaseComponent'
import type { DropdownPosition } from '@components/BaseDropdown/types/BaseDropdown.types'

/**
 * Варианты панели меню — те же, что у BaseDropdown: default — рамка и тень; outline — рамка заметнее, без тени;
 * shadow — только тень, крупнее; soft — мягкий нейтральный фон без рамки; ghost — без фона, рамки и тени.
 */
export const DROPDOWN_MENU_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

export type DropdownMenuVariant = (typeof DROPDOWN_MENU_VARIANTS)[number]

/**
 * Тип пункта: `item` — действие или ссылка (по умолчанию); `checkbox` — флажок; `radio` — переключатель
 * (один из группы); `label` — подпись группы; `separator` — линия между пунктами.
 */
export type DropdownMenuItemType = 'item' | 'checkbox' | 'radio' | 'label' | 'separator'

export interface DropdownMenuItem {
	/** Подпись пункта */
	label?: string
	/** Тип пункта, по умолчанию `item` */
	type?: DropdownMenuItemType
	/** Иконка перед подписью (имя из спрайта) */
	icon?: string
	/** Подпись сочетания клавиш справа, например «Ctrl+C». Только текст: сочетание меню не назначает */
	shortcut?: string
	/** Флажок или переключатель отмечен */
	isChecked?: boolean
	/** Пункт недоступен: пропускается стрелками и не выбирается */
	isDisabled?: boolean
	/** Необратимое действие (удалить): цвет ошибки */
	isDanger?: boolean
	/** Маршрут приложения: пункт становится ссылкой (BaseLink) */
	to?: string
	/** Внешний адрес: пункт становится ссылкой (BaseLink) */
	href?: string
	/** Target ссылки */
	target?: '_blank' | '_self'
	/** Подменю: открывается стрелкой вправо, Enter, Space, кликом или наведением */
	children?: DropdownMenuItem[] | DropdownMenuItem[][]
	/** Выбор пункта. У флажка и переключателя вызывается после `onUpdateChecked` */
	onSelect?: (event: Event) => void
	/** Новая отметка флажка (`!isChecked`) или переключателя (`true`). Состояние хранит приложение */
	onUpdateChecked?: (isChecked: boolean) => void
}

/** Пункты меню: список или группы (группы разделены линией) */
export type DropdownMenuItems = DropdownMenuItem[] | DropdownMenuItem[][]

export interface BaseDropdownMenuProps extends BaseComponentProps<
	DropdownMenuVariant,
	'root' | 'trigger' | 'panel' | 'item' | 'label' | 'separator'
> {
	/** Пункты меню: список или группы */
	items: DropdownMenuItems
	/** Меню открыто (`v-model:is-open`). Без пропа меню открывается и закрывается само */
	isOpen?: boolean
	/** Позиция меню относительно кнопки; у края окна меню переворачивается и сдвигается */
	position?: DropdownPosition
	/** Имя меню для скринридера. По умолчанию меню называется текстом кнопки */
	ariaLabel?: string
	/**
	 * Флажок или переключатель закрывает меню и при выборе мышью (по умолчанию закрывает только Enter,
	 * мышью можно отметить несколько). Для меню выбора одного значения: скорость, качество, серия
	 */
	closeOnCheck?: boolean
}

export interface BaseDropdownMenuEmits {
	(event: 'update:isOpen', value: boolean): void
	/** Выбор пункта (и в подменю). Событие — клик или нажатие клавиши */
	(event: 'select', item: DropdownMenuItem, e: Event): void
	/** Меню закрылось */
	(event: 'close'): void
}

export interface DropdownMenuTriggerSlotProps {
	/** Меню открыто */
	isOpen: boolean
	/**
	 * ARIA-атрибуты кнопки. Кит ставит их на первую кнопку в слоте сам; `v-bind="triggerProps"` нужен,
	 * если кнопка вложена глубже (например, в своём компоненте)
	 */
	triggerProps: Record<string, string | undefined>
}

export interface BaseDropdownMenuSlots {
	/** Кнопка, открывающая меню */
	default?: (props: DropdownMenuTriggerSlotProps) => unknown
}

export interface BaseDropdownMenuExpose {
	/** Открыть меню; `focus` — куда поставить фокус: первый пункт, последний или само меню */
	open: (focus?: 'first' | 'last' | 'menu') => void
	/** Закрыть меню */
	close: () => void
}

export type FocusTarget = 'first' | 'last' | 'menu'
