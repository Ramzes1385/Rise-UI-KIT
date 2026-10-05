import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { InputVariant } from '@components/BaseInput/types/BaseInput.types'

/** Варианты оформления — как у BaseInput: поле телефона — BaseInput с выбором страны слева */
export const PHONE_INPUT_VARIANTS = [
	'default',
	'ghost',
	'outline',
	'shadow',
	'soft',
	'filled',
	'underline',
] as const satisfies readonly InputVariant[]

/**
 * Страна в списке: код ISO 3166 (`RU`), телефонный код без плюса (`7`) и маска национального номера,
 * где `#` — цифра: `(###) ###-##-##`. Название берётся из Intl на языке кита
 */
export interface PhoneCountry {
	code: string
	dialCode: string
	mask: string
}

/** Номер, разобранный на страну и цифры национального номера */
export interface ParsedPhone {
	country: PhoneCountry | undefined
	digits: string
}

/**
 * Части поля телефона для пропа `ui` (БЭМ-элементы `.base-phone-input__<часть>`, `root` — обёртка компонента, корень BaseInput):
 * country — выбор страны слева в поле, trigger — кнопка выбора страны, flag — флаг (в кнопке и в списке), hidden — скрытое
 * название страны для экранного диктора, dial — код страны в кнопке, chevron — стрелка, list — список стран, option — строка
 * списка, option-name — название страны, option-dial — код страны в строке, check — отметка выбранной страны.
 */
export const PHONE_INPUT_PARTS = [
	'country',
	'trigger',
	'flag',
	'hidden',
	'dial',
	'chevron',
	'list',
	'option',
	'option-name',
	'option-dial',
	'check',
] as const

export type BasePhoneInputPart = (typeof PHONE_INPUT_PARTS)[number]

/**
 * Пропсы компонента BasePhoneInput
 */
export interface BasePhoneInputProps extends BaseComponentProps<InputVariant, 'root' | 'field' | 'country'> {
	/** Номер (`v-model`) в международном формате без пробелов: `+79161234567`; пустое поле — пустая строка */
	modelValue?: string
	/** Страна (`v-model:country`), код ISO 3166: `RU`, `KZ`, `BY`. По умолчанию — страна номера или первая в списке */
	country?: string
	/** Страны в списке; по умолчанию `PHONE_COUNTRIES` — Россия, страны СНГ и частые направления */
	countries?: readonly PhoneCountry[]
	/** Подпись поля */
	label?: string
	/** Подсказка в пустом поле; по умолчанию — маска страны: `(000) 000-00-00` */
	placeholder?: string
	/** Текст ошибки под полем */
	error?: string
	/** Обязательное поле */
	isRequired?: boolean
	/** Отключает поле и выбор страны */
	isDisabled?: boolean
	/**
	 * Классы частей поля (`root`, `country`, `trigger`, `flag`, `list`, `option`… — см. `PHONE_INPUT_PARTS`) — добавляются
	 * к классам кита. Глобально — `defaults.BasePhoneInput.ui` плагина, классы склеиваются. Части самого поля ввода —
	 * токены `--rise-input-*` и `ui` у BaseInput.
	 *
	 * @example
	 * <BasePhoneInput :ui="{ trigger: 'px-3', option: 'text-base' }" />
	 */
	ui?: UiProp<BasePhoneInputPart>
}

/**
 * События компонента BasePhoneInput
 */
export interface BasePhoneInputEmits {
	/** Номер после ввода или вставки: `+79161234567` */
	(event: 'update:modelValue', value: string): void
	/** Выбрана другая страна */
	(event: 'update:country', code: string): void
}
