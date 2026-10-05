import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { InputVariant } from '@components/BaseInput/types/BaseInput.types'

/** Варианты оформления — как у BaseInput */
export const REQUISITE_INPUT_VARIANTS = [
	'default',
	'ghost',
	'outline',
	'shadow',
	'soft',
	'filled',
	'underline',
] as const satisfies readonly InputVariant[]

/**
 * Реквизиты: `inn` — ИНН (10 цифр у организации, 12 у человека и ИП), `kpp` — КПП, `ogrn` — ОГРН, `ogrnip` —
 * ОГРНИП, `bik` — БИК, `account` и `correspondentAccount` — расчётный и корреспондентский счёт (проверяются вместе
 * с БИК), `snils` — СНИЛС
 */
export const REQUISITE_KINDS = ['inn', 'kpp', 'ogrn', 'ogrnip', 'bik', 'account', 'correspondentAccount', 'snils'] as const

/** Вид реквизита */
export type RequisiteKind = (typeof REQUISITE_KINDS)[number]

/** Состояние значения: пусто, не хватает знаков, верно, ошибка в контрольном числе или формате */
export type RequisiteStatus = 'empty' | 'incomplete' | 'valid' | 'invalid'

/** Правило реквизита: маска (`#` — цифра, `*` — цифра или латинская буква), допустимые длины и проверка */
export interface RequisiteRule {
	mask: string
	lengths: readonly number[]
	check: (value: string, bik: string) => boolean
}

/**
 * Части поля реквизита для пропа `ui` (`root` — корень). Своих БЭМ-элементов у обёртки нет: части принадлежат внутреннему
 * BaseInput и передаются ему — label, required — звёздочка, wrapper — рамка поля, field — `<input>`, error-text.
 */
export const REQUISITE_INPUT_PARTS = ['label', 'required', 'wrapper', 'field', 'error-text'] as const

export type BaseRequisiteInputPart = (typeof REQUISITE_INPUT_PARTS)[number]

/**
 * Пропсы компонента BaseRequisiteInput
 */
export interface BaseRequisiteInputProps extends BaseComponentProps<InputVariant, 'root' | 'field'> {
	/** Значение (`v-model`): только цифры, у КПП — цифры и заглавные латинские буквы */
	modelValue?: string
	/** Какой реквизит вводится */
	kind: RequisiteKind
	/** БИК банка: нужен, чтобы проверить расчётный и корреспондентский счёт */
	bik?: string
	/** Подпись поля; по умолчанию — название реквизита: «ИНН», «Расчётный счёт» */
	label?: string
	/** Подсказка в пустом поле */
	placeholder?: string
	/** Своя ошибка под полем; без неё поле само пишет о неверном контрольном числе или нехватке цифр */
	error?: string
	/** Обязательное поле */
	isRequired?: boolean
	/** Отключает поле */
	isDisabled?: boolean
	/**
	 * Классы частей поля (`root`, `wrapper`, `field`, `label`… — см. `REQUISITE_INPUT_PARTS`) — добавляются к классам кита.
	 * Глобально — `defaults.BaseRequisiteInput.ui` плагина, классы склеиваются.
	 *
	 * @example
	 * <BaseRequisiteInput kind="inn" :ui="{ wrapper: 'ring-1', field: 'font-mono' }" />
	 */
	ui?: UiProp<BaseRequisiteInputPart>
}

/**
 * События компонента BaseRequisiteInput
 */
export interface BaseRequisiteInputEmits {
	/** Новое значение при вводе */
	(event: 'update:modelValue', value: string): void
	/** Проверка после изменения: `true` — верно, `false` — ошибка, `null` — пусто или не хватает знаков */
	(event: 'validate', isValid: boolean | null): void
}
