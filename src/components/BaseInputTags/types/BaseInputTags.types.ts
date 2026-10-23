import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { FieldInputAttrs } from '@composables/form/useFormContext'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { InputVariant } from '@components/BaseInput/types/BaseInput.types'

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

/** Разделители по умолчанию: запятая, полноширинная запятая китайского (`，`) и японская `、` */
export const INPUT_TAGS_SEPARATORS = [',', '，', '、'] as const

/**
 * Части поля тегов для пропа `ui` (БЭМ-элементы `.base-input-tags__<часть>`, `root` — обёртка компонента): list — список
 * тегов, tag — тег, text — текст тега, remove — кнопка удаления, status — скрытое объявление для чтения с экрана.
 * Рамку и строку ввода рисует BaseInput: их классы — `customClass.field` и токены `--rise-input-*`.
 */
export const INPUT_TAGS_PARTS = ['list', 'tag', 'text', 'remove', 'status'] as const

export type BaseInputTagsPart = (typeof INPUT_TAGS_PARTS)[number]

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
	/**
	 * Символы, которые завершают тег при вводе и вставке (Enter завершает всегда). По умолчанию — запятая, китайская
	 * запятая `，` и японская `、`; свой список заменяет умолчание целиком
	 */
	separators?: string[]
	/** Добавлять набранный текст тегом при выходе из поля (по умолчанию да) */
	isAddOnBlur?: boolean
	/** Проверка тега: `false` — тег не добавляется, текст остаётся в поле */
	validate?: (tag: string) => boolean
	/** Имя поля без видимой подписи */
	ariaLabel?: string
	/** Атрибуты нативного поля (`name`, `data-*`, свой `id`) */
	inputAttrs?: FieldInputAttrs
	/**
	 * Классы частей поля тегов (`root`, `list`, `tag`, `text`, `remove`, `status` — см. `INPUT_TAGS_PARTS`) — добавляются
	 * к классам кита. Глобально — `defaults.BaseInputTags.ui` плагина, классы склеиваются.
	 *
	 * @example
	 * <BaseInputTags :ui="{ tag: 'font-mono', remove: 'opacity-70' }" />
	 */
	ui?: UiProp<BaseInputTagsPart>
}

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

export type InputTagsProps = PropsWithDefaults<BaseInputTagsProps, 'modelValue' | 'separators'>
