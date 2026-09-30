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
}

/**
 * События компонента BaseMoneyInput
 */
export interface BaseMoneyInputEmits {
	/** Сумма при вводе; после ухода из поля — округлённая и в пределах `min` и `max` */
	(event: 'update:modelValue', value: number | null): void
}
