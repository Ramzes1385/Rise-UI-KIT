import type { UiClassFn } from '@composables/base/useUi'
import type { BaseSelectOption, BaseSelectPart } from './BaseSelect.types'

export interface BaseSelectDropdownProps {
	/** Отфильтрованные опции */
	filteredOptions: BaseSelectOption[]
	/** Показывать поиск */
	isSearchable: boolean
	/** Мультивыбор */
	isMultiple: boolean
	/** Масштаб размера */
	sizeScale: number
	/** Проверка, выбрана ли опция */
	isSelected: (value: string | number) => boolean
	/** Классы частей из пропа `ui` селекта: БЭМ-класс кита и классы приложения */
	partClass: UiClassFn<BaseSelectPart>
	/** Движение выключено (пресет `none`, «уменьшить движение»): галочка появляется сразу */
	isMotionReduced: boolean
	/** Объект CSS-классов для кастомизации элементов дропдауна */
	classes: Record<string, string | undefined>
	/** CSS-стили масштабирования */
	sizeScaleStyle: Record<string, string> | undefined
	/** id списка опций (role="listbox"): на него ссылается aria-controls триггера */
	listboxId: string
	/** id подписи селекта — имя списка; без подписи имя берётся из listboxLabel */
	labelledby?: string
	/** Имя списка, если подписи нет (плейсхолдер селекта) */
	listboxLabel?: string
	/** Индекс активной (подсвеченной) опции; -1 — нет */
	activeIndex: number
	/** id опции по её индексу — для aria-activedescendant */
	getOptionId: (index: number) => string
}

export interface BaseSelectDropdownEmits {
	(event: 'select', option: BaseSelectOption): void
	/** Указатель над опцией — она становится активной */
	(event: 'activate', index: number): void
	/** Клавиши в поле поиска (стрелки и Enter управляют списком) */
	(event: 'search-keydown', e: KeyboardEvent): void
}

export interface BaseSelectDropdownSlots {
	header?: () => unknown
	option?: (props: { option: BaseSelectOption; isSelected: boolean }) => unknown
	empty?: () => unknown
	footer?: () => unknown
}
