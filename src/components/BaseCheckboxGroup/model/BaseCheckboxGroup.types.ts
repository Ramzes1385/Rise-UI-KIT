import type { BaseComponentProps } from '@composables/useBaseComponent'

/** Варианты оформления: те же, что у BaseCheckbox, — вариант получает каждый флажок группы */
export const CHECKBOX_GROUP_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/** Вариант выбора в группе */
export interface CheckboxGroupOption {
	/** Значение: попадает в массив v-model, когда флажок отмечен */
	value: string | number
	/** Подпись флажка */
	label: string
	/** Флажок недоступен */
	isDisabled?: boolean
}

/**
 * Пропсы компонента BaseCheckboxGroup
 */
export interface BaseCheckboxGroupProps extends BaseComponentProps<(typeof CHECKBOX_GROUP_VARIANTS)[number], 'root' | 'label' | 'required' | 'options' | 'checkbox' | 'error'> {
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
}

/**
 * События компонента BaseCheckboxGroup
 */
export interface BaseCheckboxGroupEmits {
	/** Новый набор отмеченных значений */
	(event: 'update:modelValue', value: (string | number)[]): void
	/** То же после действия пользователя */
	(event: 'change', value: (string | number)[]): void
}
