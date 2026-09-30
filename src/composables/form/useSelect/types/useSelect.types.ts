import type { useSelect } from '../useSelect'
import type { BaseSelectEmits, BaseSelectProps } from '@components/BaseSelect/types/BaseSelect.types'

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
