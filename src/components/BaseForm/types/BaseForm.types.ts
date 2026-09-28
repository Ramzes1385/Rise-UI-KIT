import type { BaseComponentProps } from '@composables/useBaseComponent'
import type { FormIssue, FormValidationResult, StandardSchemaV1 } from '@utils/formUtils'

export const FORM_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

export interface BaseFormProps extends BaseComponentProps<(typeof FORM_VARIANTS)[number], 'root' | 'overlay' | 'content'> {
	/** Состояние загрузки: submit не эмитится, поля формы отключены, у формы aria-busy */
	isLoading?: boolean
	/** Отключенное состояние: submit не эмитится, поля формы отключены (в том числе для клавиатуры) */
	isDisabled?: boolean
	/**
	 * Схема Standard Schema (Zod, Valibot, ArkType и другие): перед `submit` данные `state` проверяются ею.
	 * Ошибки показывают BaseFormField с тем же `name`; после первой отправки проверка повторяется при каждом изменении данных
	 */
	schema?: StandardSchemaV1
	/** Данные формы — их проверяет `schema` и получает `submit` */
	state?: Record<string, unknown>
}

export interface BaseFormEmits {
	/** Отправка: `data` — данные после схемы (со `schema`) или `state` */
	(event: 'submit', e: Event, data?: unknown): void
	/** Отправка не прошла проверку схемой: ошибки по именам полей (фокус — на первом поле с ошибкой) */
	(event: 'invalid', issues: FormIssue[]): void
}

export interface BaseFormExpose {
	/** Проверить `state` схемой и показать ошибки; без схемы — успех */
	validate: () => Promise<FormValidationResult>
	/** Убрать ошибки и повторную проверку при вводе */
	reset: () => void
	/** Текущие ошибки: имя поля → текст */
	errors: Readonly<Record<string, string>>
}

export interface BaseFormSlots {
	default?: () => unknown
}
