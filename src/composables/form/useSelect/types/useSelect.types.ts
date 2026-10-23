import type { Ref } from 'vue'
import type { useSelect } from '../useSelect'
import type { BaseSelectEmits, BaseSelectOption, BaseSelectProps } from '@components/BaseSelect/types/BaseSelect.types'

export interface UseSelectOptions {
	props: BaseSelectProps
	emit: BaseSelectEmits
	onBlur: () => void
	/** Блокировка с учётом формы вокруг; без неё — `props.isDisabled` */
	isDisabled?: () => boolean
}

/** Часть состояния useSelect, которой управляет клавиатура триггера */
export type SelectKeyboardState = Pick<
	ReturnType<typeof useSelect>,
	| 'isOpen'
	| 'activeIndex'
	| 'openDropdown'
	| 'toggleDropdown'
	| 'handleClose'
	| 'selectActive'
	| 'moveActive'
	| 'setActiveEdge'
	| 'typeaheadActive'
	| 'isTypingAhead'
>

export interface UseSelectKeysOptions {
	/** Состояние списка из useSelect */
	select: SelectKeyboardState
	/** Список заблокирован: клавиши ничего не делают */
	isDisabled: () => boolean
	/** В списке есть поле поиска: буквы набираются в нём, а не ищут опцию по началу подписи */
	isSearchable?: () => boolean
}

/** Значение опции выпадающего списка */
export type SelectValue = BaseSelectOption['value']

/** Направление сдвига активной опции: 1 — вниз, -1 — вверх */
export type SelectStep = 1 | -1

/** Внутреннее состояние useSelect, общее для действий выбора */
export interface SelectContext {
	props: BaseSelectProps
	emit: BaseSelectEmits
	onBlur: () => void
	isDisabled: () => boolean
	isOpen: Ref<boolean>
	searchQuery: Ref<string>
}
