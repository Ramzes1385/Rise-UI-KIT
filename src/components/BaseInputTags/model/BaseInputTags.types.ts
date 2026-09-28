import type { FieldInputAttrs } from '@composables/useFormContext'
import type { BaseComponentProps } from '@composables/useBaseComponent'
import type { InputVariant } from '@components/BaseInput/model/BaseInput.types'

/** Варианты оформления — как у BaseInput: теги стоят внутри рамки поля перед строкой ввода */
export const INPUT_TAGS_VARIANTS = [
	'default',
	'ghost',
	'outline',
	'shadow',
	'soft',
	'filled',
	'underline',
] as const satisfies readonly InputVariant[]

/**
 * Пропсы компонента BaseInputTags
 */
export interface BaseInputTagsProps extends BaseComponentProps<InputVariant, 'root' | 'field' | 'list' | 'tag' | 'remove'> {
	/** Теги (v-model) */
	modelValue?: string[]
	/** Подпись поля */
	label?: string
	/** Подсказка в пустой строке ввода */
	placeholder?: string
	/** Текст ошибки: показывается под полем и описывает его */
	error?: string
	/** Отключает поле и удаление тегов */
	isDisabled?: boolean
	/** Только чтение: теги видны, добавлять и удалять нельзя */
	isReadonly?: boolean
	/** Обязательное поле: звёздочка и `aria-required` */
	isRequired?: boolean
	/** Сколько тегов можно добавить */
	maxTags?: number
	/** Без повторов (по умолчанию): такой же тег не добавляется */
	isUnique?: boolean
	/** Символы, которые завершают тег при вводе и вставке (Enter завершает всегда). По умолчанию — запятая */
	separators?: string[]
	/** Добавлять набранный текст тегом при выходе из поля (по умолчанию да) */
	isAddOnBlur?: boolean
	/** Проверка тега: `false` — тег не добавляется, текст остаётся в поле */
	validate?: (tag: string) => boolean
	/** Имя поля без видимой подписи */
	ariaLabel?: string
	/** Атрибуты нативного поля (`name`, `data-*`, свой `id`) */
	inputAttrs?: FieldInputAttrs
}

/**
 * События компонента BaseInputTags
 */
export interface BaseInputTagsEmits {
	/** Новый список тегов */
	(event: 'update:modelValue', value: string[]): void
	/** Добавлен тег */
	(event: 'add', tag: string): void
	/** Удалён тег */
	(event: 'remove', tag: string): void
	(event: 'blur', e: FocusEvent): void
	(event: 'focus', e: FocusEvent): void
}
