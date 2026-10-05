import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Варианты оформления: те же, что у BaseCheckbox, — вариант получает каждый флажок группы */
export const CHECKBOX_GROUP_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Части группы для пропа `ui` (БЭМ-элементы `.base-checkbox-group__<часть>`, `root` — корень):
 * label — заголовок, required — звёздочка, options — список флажков, select-all — флажок «Выбрать все»,
 * checkbox — каждый флажок варианта (корень BaseCheckbox), error — текст ошибки.
 */
export const CHECKBOX_GROUP_PARTS = ['label', 'required', 'options', 'select-all', 'checkbox', 'error'] as const

export type BaseCheckboxGroupPart = (typeof CHECKBOX_GROUP_PARTS)[number]

export interface CheckboxGroupOption {
	/** Значение: попадает в массив v-model, когда флажок отмечен */
	value: string | number
	/** Подпись флажка */
	label: string
	/** Флажок недоступен */
	isDisabled?: boolean
}

export interface BaseCheckboxGroupProps extends BaseComponentProps<
	(typeof CHECKBOX_GROUP_VARIANTS)[number],
	'root' | 'label' | 'required' | 'options' | 'checkbox' | 'error'
> {
	/** Отмеченные значения (v-model) в порядке вариантов */
	modelValue?: (string | number)[]
	/** Варианты выбора */
	options: CheckboxGroupOption[]
	/** Заголовок группы — её имя для скринридера */
	label?: string
	/** Обязательный выбор: звёздочка у заголовка */
	isRequired?: boolean
	/** Текст ошибки под группой: описывает группу (`aria-describedby`) */
	error?: string
	/** Отключает все флажки */
	isDisabled?: boolean
	/** Флажки столбиком (по умолчанию — в строку с переносом) */
	isVertical?: boolean
	/** Флажок «Выбрать все» над вариантами: отмечает доступные варианты, при части отмеченных — частичный (indeterminate) */
	hasSelectAll?: boolean
	/** Подпись флажка «Выбрать все» (по умолчанию из словаря: «Выбрать все») */
	selectAllLabel?: string
	/**
	 * Классы частей группы (`root`, `options`, `checkbox`, `select-all`… — см. `CHECKBOX_GROUP_PARTS`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseCheckboxGroup: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseCheckboxGroup v-model="days" :options="weekdays" :ui="{ options: 'grid grid-cols-2', checkbox: 'py-1' }" />
	 */
	ui?: UiProp<BaseCheckboxGroupPart>
}

export interface BaseCheckboxGroupEmits {
	/** Новый набор отмеченных значений */
	(event: 'update:modelValue', value: (string | number)[]): void
	/** То же после действия пользователя */
	(event: 'change', value: (string | number)[]): void
}

export type CheckboxGroupProps = PropsWithDefaults<BaseCheckboxGroupProps, 'modelValue'>
