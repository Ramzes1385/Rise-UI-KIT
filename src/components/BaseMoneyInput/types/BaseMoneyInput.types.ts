import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { InputVariant } from '@components/BaseInput/types/BaseInput.types'

/** Варианты оформления — как у BaseInput: поле суммы — BaseInput со знаком валюты */
export const MONEY_INPUT_VARIANTS = [
	'default',
	'ghost',
	'outline',
	'shadow',
	'soft',
	'filled',
	'underline',
] as const satisfies readonly InputVariant[]

/** Формат суммы для языка и валюты: разделители, знак валюты и его место, знаков после запятой */
export interface MoneyFormat {
	locale: string
	group: string
	decimal: string
	symbol: string
	isSymbolFirst: boolean
	fraction: number
	isNegativeAllowed: boolean
}

/**
 * Части поля суммы для пропа `ui` (`root` — корень). Своих БЭМ-элементов у обёртки нет: части принадлежат внутреннему
 * BaseInput и передаются ему — label, required — звёздочка, wrapper — рамка поля, prefix и postfix — знак валюты,
 * field — `<input>`, error-text.
 */
export const MONEY_INPUT_PARTS = ['label', 'required', 'wrapper', 'prefix', 'field', 'postfix', 'error-text'] as const

export type BaseMoneyInputPart = (typeof MONEY_INPUT_PARTS)[number]

/**
 * Пропсы компонента BaseMoneyInput
 */
export interface BaseMoneyInputProps extends BaseComponentProps<InputVariant, 'root' | 'field'> {
	/** Сумма (`v-model`); `null` — поле пустое */
	modelValue?: number | null
	/** Валюта ISO 4217: `RUB`, `USD`, `EUR`, `KZT`. От неё зависят знак и число знаков после запятой */
	currency?: string
	/** Наименьшая сумма; отрицательные суммы вводятся, только если `min` меньше нуля. По умолчанию 0 */
	min?: number
	/** Наибольшая сумма */
	max?: number
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
	/**
	 * Классы частей поля (`root`, `wrapper`, `field`, `prefix`… — см. `MONEY_INPUT_PARTS`) — добавляются к классам кита.
	 * Глобально — `defaults.BaseMoneyInput.ui` плагина, классы склеиваются.
	 *
	 * @example
	 * <BaseMoneyInput :ui="{ prefix: 'text-success', field: 'font-mono' }" />
	 */
	ui?: UiProp<BaseMoneyInputPart>
}

/**
 * События компонента BaseMoneyInput
 */
export interface BaseMoneyInputEmits {
	/** Сумма при вводе; после ухода из поля — округлённая и в пределах `min` и `max` */
	(event: 'update:modelValue', value: number | null): void
}
