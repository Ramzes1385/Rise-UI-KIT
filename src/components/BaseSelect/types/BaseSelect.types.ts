import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { FieldInputAttrs } from '@composables/form/useFormContext'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const SELECT_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft', 'underline'] as const

export interface BaseSelectOption {
	/** Значение */
	value: string | number
	/** Отображаемый текст */
	label: string
	/** Иконка (опционально) */
	icon?: string
	/** Дополнительное описание */
	description?: string
	/** Отключена ли опция */
	isDisabled?: boolean
}

type BaseSelectVariant = (typeof SELECT_VARIANTS)[number]

export interface BaseSelectProps extends BaseComponentProps<
	BaseSelectVariant,
	| 'root'
	| 'dropdown'
	| 'label'
	| 'required'
	| 'trigger'
	| 'values'
	| 'tag'
	| 'tagText'
	| 'tagClose'
	| 'placeholder'
	| 'icon'
	| 'valueText'
	| 'arrow'
	| 'errorText'
	| 'dropdownContent'
	| 'search'
	| 'searchInput'
	| 'options'
	| 'option'
	| 'checkbox'
	| 'optionIcon'
	| 'optionContent'
	| 'optionLabel'
	| 'optionDesc'
	| 'noResults'
> {
	/** Выбранное значение (или массив для мультивыбора) */
	modelValue?: string | number | (string | number)[]
	/** Список опций */
	options: BaseSelectOption[]
	/** Плейсхолдер */
	placeholder?: string
	/** Заголовок поля */
	label?: string
	/** Имя поля без видимой подписи (`aria-label` триггера); без него имя — плейсхолдер */
	ariaLabel?: string
	/** Атрибуты триггера (`role="combobox"`): `aria-*`, `data-*`; `id` — свой id триггера, `aria-describedby` добавляется к описаниям кита */
	triggerAttrs?: FieldInputAttrs
	/** Обязательное поле */
	isRequired?: boolean
	/** Мультивыбор */
	isMultiple?: boolean
	/** Возможность поиска */
	isSearchable?: boolean
	/** Отключенное состояние */
	isDisabled?: boolean
	/** Текст ошибки */
	error?: string
}

export interface BaseSelectEmits {
	(event: 'update:modelValue', value: string | number | (string | number)[]): void
	(event: 'change', value: string | number | (string | number)[]): void
}

export interface BaseSelectSlots {
	/** Всё содержимое кнопки-триггера вместо выбранных значений: `isOpen`, подпись выбранного и подписи при `isMultiple` */
	trigger?: (props: { isOpen: boolean; selectedLabel: string; selectedLabels: string[] }) => unknown
	/** Выбранные значения при `isMultiple` вместо меток-бейджей; `remove(value)` снимает выбор */
	tag?: (props: { labels: string[]; items: BaseSelectOption[]; remove: (value: string | number) => void }) => unknown
	/** Выбранный вариант в триггере при одиночном выборе */
	selected?: (props: { option: BaseSelectOption }) => unknown
	/** Верх выпадающего списка, над вариантами */
	header?: () => unknown
	/** Строка варианта в списке: `option` и отмечен ли он (`isSelected`) */
	option?: (props: { option: BaseSelectOption; isSelected: boolean }) => unknown
	/** Содержимое списка, когда вариантов нет или поиск ничего не нашёл */
	empty?: () => unknown
	/** Низ выпадающего списка, под вариантами */
	footer?: () => unknown
}

export type SelectProps = PropsWithDefaults<BaseSelectProps, 'modelValue' | 'isRequired'>
