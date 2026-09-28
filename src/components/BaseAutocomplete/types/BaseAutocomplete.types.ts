import type { PropsWithDefaults } from '@composables/useDefaults'
import type { FieldInputAttrs } from '@composables/useFormContext'
import type { BaseComponentProps } from '@composables/useBaseComponent'
import type { InputVariant } from '@components/BaseInput/types/BaseInput.types'

/** Варианты оформления — как у BaseInput: поле автодополнения — BaseInput со списком вариантов */
export const AUTOCOMPLETE_VARIANTS = [
	'default',
	'ghost',
	'outline',
	'shadow',
	'soft',
	'filled',
	'underline',
] as const satisfies readonly InputVariant[]

export interface AutocompleteOption {
	/** Значение: уходит в v-model при выборе */
	value: string | number
	/** Подпись: показывается в списке и в поле после выбора */
	label: string
	/** Вторая строка под подписью */
	description?: string
	/** Вариант нельзя выбрать */
	isDisabled?: boolean
}

export interface BaseAutocompleteProps extends BaseComponentProps<InputVariant, 'root' | 'field' | 'panel' | 'option' | 'empty'> {
	/** Выбранное значение (v-model); `null` — ничего не выбрано */
	modelValue?: string | number | null
	/** Варианты */
	options: AutocompleteOption[]
	/** Подпись поля */
	label?: string
	/** Подсказка в пустом поле */
	placeholder?: string
	/** Текст ошибки: показывается под полем и описывает его */
	error?: string
	/** Отключает поле */
	isDisabled?: boolean
	/** Только чтение: список не открывается */
	isReadonly?: boolean
	/** Обязательное поле: звёздочка и `aria-required` */
	isRequired?: boolean
	/**
	 * Свой вариант: набранный текст без выбора из списка тоже становится значением (после `normalize`).
	 * Без него такой текст при выходе из поля заменяется подписью выбранного варианта
	 */
	isCustomAllowed?: boolean
	/** Привести набранный текст к значению своего варианта; `null` — ввод неверный, значение не меняется */
	normalize?: (text: string) => string | null
	/** Варианты уже отобраны сервером по запросу (событие `search`): список показывается без фильтрации */
	isRemote?: boolean
	/** Идёт загрузка вариантов: в списке — «Загрузка…» */
	isLoading?: boolean
	/** Своя фильтрация вариантов по запросу; по умолчанию — подпись содержит запрос без учёта регистра */
	filter?: (option: AutocompleteOption, query: string) => boolean
	/** Сколько вариантов показывать в списке (по умолчанию все) */
	maxResults?: number
	/** Имя поля без видимой подписи */
	ariaLabel?: string
	/** Атрибуты нативного поля (`name`, `data-*`, свой `id`) */
	inputAttrs?: FieldInputAttrs
}

export interface BaseAutocompleteEmits {
	/** Новое значение: выбор из списка, свой вариант, очистка */
	(event: 'update:modelValue', value: string | number | null): void
	/** То же после действия пользователя */
	(event: 'change', value: string | number | null): void
	/** Набранный запрос — для загрузки вариантов с сервера (`isRemote`) */
	(event: 'search', query: string): void
	(event: 'blur', e: FocusEvent): void
	(event: 'focus', e: FocusEvent): void
}

export interface BaseAutocompleteSlots {
	/** Своя разметка варианта в списке (роль option и выбор остаются у компонента) */
	option?: (props: { option: AutocompleteOption; isActive: boolean; isSelected: boolean }) => unknown
	/** Текст, когда ничего не найдено */
	empty?: () => unknown
}

export type AutocompleteProps = PropsWithDefaults<BaseAutocompleteProps, 'modelValue'>
