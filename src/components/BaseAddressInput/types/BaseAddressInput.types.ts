import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { InputVariant } from '@components/BaseInput/types/BaseInput.types'

/** Варианты оформления — как у BaseInput и BaseAutocomplete */
export const ADDRESS_INPUT_VARIANTS = [
	'default',
	'ghost',
	'outline',
	'shadow',
	'soft',
	'filled',
	'underline',
] as const satisfies readonly InputVariant[]

/**
 * Подсказка адреса: `value` — адрес для поля, `unrestrictedValue` — полный адрес с индексом и регионом,
 * `data` — всё, что вернул сервис (координаты, ФИАС, индекс)
 */
export interface AddressSuggestion {
	value: string
	unrestrictedValue?: string
	data?: Record<string, unknown>
}

/** Источник подсказок: запрос и сигнал отмены — ответ устаревшего запроса отбрасывается */
export type AddressSource = (query: string, options: { signal: AbortSignal }) => Promise<AddressSuggestion[]>

/** Настройки адаптера DaData: ключ API и необязательные поля запроса (`count`, `locations`, `from_bound`) */
export interface DadataAddressOptions {
	token: string
	url?: string
	count?: number
	[option: string]: unknown
}

/**
 * Пропсы компонента BaseAddressInput
 */
export interface BaseAddressInputProps extends BaseComponentProps<InputVariant, 'root' | 'field' | 'panel' | 'option'> {
	/** Адрес (`v-model`): выбранная подсказка или набранный текст */
	modelValue?: string
	/** Источник подсказок: свой сервер или `createDadataAddressSource({ token })` */
	source: AddressSource
	/** С какой длины запроса искать; по умолчанию 3 */
	minChars?: number
	/** Пауза после ввода перед запросом, мс; по умолчанию 300 */
	debounce?: number
	/** Подпись поля */
	label?: string
	/** Подсказка в пустом поле */
	placeholder?: string
	/** Текст ошибки под полем */
	error?: string
	/** Обязательное поле */
	isRequired?: boolean
	/** Отключает поле */
	isDisabled?: boolean
}

/**
 * События компонента BaseAddressInput
 */
export interface BaseAddressInputEmits {
	/** Новый адрес: выбор подсказки или свой текст после ухода из поля */
	(event: 'update:modelValue', value: string): void
	/** Выбрана подсказка: со всеми данными сервиса */
	(event: 'select', suggestion: AddressSuggestion): void
}
