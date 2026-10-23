import type { UiProp } from '@composables/base/useUi'
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

/**
 * Части селекта для пропа `ui` (БЭМ-элементы `.base-select__<часть>`, `root` — обёртка компонента).
 * Поле: dropdown — обёртка выпадающего списка вокруг поля, label, required — звёздочка, trigger — рамка-кнопка,
 * values — выбранные значения, tag, tag-text, tag-close — метки мультивыбора, icon, value-text, placeholder, arrow,
 * error-text. Список: dropdown-content, search, search-icon, search-input, header, options, option, checkbox,
 * option-icon, option-content, option-label, option-desc, check — галочка выбранного, no-results, footer.
 */
export const SELECT_PARTS = [
	'dropdown',
	'label',
	'required',
	'trigger',
	'values',
	'tag',
	'tag-text',
	'tag-close',
	'icon',
	'value-text',
	'placeholder',
	'arrow',
	'error-text',
	'dropdown-content',
	'search',
	'search-icon',
	'search-input',
	'header',
	'options',
	'option',
	'checkbox',
	'option-icon',
	'option-content',
	'option-label',
	'option-desc',
	'check',
	'no-results',
	'footer',
] as const

export type BaseSelectPart = (typeof SELECT_PARTS)[number]

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
	/**
	 * Классы частей селекта (`root`, `trigger`, `tag`, `option`, `check`… — см. `SELECT_PARTS`) — добавляются к классам кита,
	 * в том числе в выпадающем списке. Глобально — `defaults.BaseSelect.ui` плагина, классы склеиваются.
	 *
	 * @example
	 * <BaseSelect :ui="{ trigger: 'ring-1', option: 'font-mono' }" />
	 */
	ui?: UiProp<BaseSelectPart>
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
