import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { FieldInputAttrs } from '@composables/form/useFormContext'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const INPUT_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft', 'filled', 'underline'] as const

export type InputVariant = (typeof INPUT_VARIANTS)[number]

type AllowedChars = 'digits' | 'letters' | 'alphanumeric'

export interface PasswordRule {
	/** Ключ правила */
	key: string
	/** Текст правила */
	label: string
	/** Функция валидации */
	validate: (value: string) => boolean
}

export interface PasswordRuleResult {
	key: string
	label: string
	isValid: boolean
}

/**
 * Части поля для пропа `ui` (БЭМ-элементы `.base-input__<часть>`, `root` — обёртка компонента): label, required — звёздочка,
 * wrapper — рамка поля, icon — иконка слева, prefix, field — `<input>`, password-toggle, clear — кнопка очистки у `type="search"`, postfix, password-rules, password-rule,
 * password-rule-icon, password-rule-label, error-text.
 */
export const INPUT_PARTS = [
	'label',
	'required',
	'wrapper',
	'icon',
	'prefix',
	'field',
	'password-toggle',
	'clear',
	'postfix',
	'password-rules',
	'password-rule',
	'password-rule-icon',
	'password-rule-label',
	'error-text',
] as const

export type BaseInputPart = (typeof INPUT_PARTS)[number]

export interface BaseInputProps extends BaseComponentProps<
	InputVariant,
	| 'root'
	| 'label'
	| 'required'
	| 'wrapper'
	| 'icon'
	| 'prefix'
	| 'field'
	| 'passwordToggle'
	| 'clear'
	| 'passwordIcon'
	| 'postfix'
	| 'passwordRules'
	| 'passwordRule'
	| 'passwordRuleIcon'
	| 'errorText'
> {
	/** Значение поля (null трактуется как пустая строка) */
	modelValue: string | number | null
	/**
	 * Тип инпута; `search` — поле поиска (нативный `type="search"`, по умолчанию с иконкой лупы слева, `enterkeyhint="search"`
	 * и своя кнопка «Очистить» справа, пока есть текст: нативная кнопка скрыта, потому что в Firefox её нет)
	 */
	type?: 'text' | 'email' | 'tel' | 'number' | 'password' | 'search' | 'date'
	/** Плейсхолдер */
	placeholder?: string
	/** Заголовок поля */
	label?: string
	/** Текст ошибки */
	error?: string
	/** Отключенное состояние */
	isDisabled?: boolean
	/** Обязательное поле */
	isRequired?: boolean
	/** Только для чтения */
	isReadonly?: boolean
	/** Имя поля без видимой подписи (`aria-label`) */
	ariaLabel?: string
	/** Атрибуты нативного `<input>`: `name`, `autocomplete`, `inputmode`, `aria-*`, `data-*`; `id` — свой id поля */
	inputAttrs?: FieldInputAttrs
	/** Иконка слева (имя `BaseIcon`); у `type="search"` по умолчанию `search`, `icon=""` — без иконки */
	icon?: string
	/** Префикс (например, код страны) */
	prefix?: string
	/** Постфикс (например, единица измерения) */
	postfix?: string
	/**
	 * Маска ввода.
	 *
	 * Фиксированные токены (ровно 1 символ):
	 *   # — цифра (0-9)
	 *   @ — буква (a-z, A-Z, а-я, А-Я, ёЁ)
	 *   * — любой символ
	 *
	 * Жадные токены (1 или более символов до следующего литерала):
	 *   N — одна или более цифр
	 *   A — одна или более букв
	 *   X — одна или более букв/цифр
	 *
	 * Экранирование: \x — литерал x (включая токены # @ * N A X)
	 *
	 * Примеры:
	 *   (###) ###-##-##   — телефон РФ
	 *   ##.##.####        — дата
	 *   #### #### #### #### — банковская карта
	 */
	mask?: string
	/** Фильтр допустимых символов */
	allowedChars?: AllowedChars
	/** Правила валидации пароля */
	passwordRules?: PasswordRule[]
	/**
	 * Классы частей поля (`root`, `wrapper`, `field`, `label`… — см. `INPUT_PARTS`) — добавляются к классам кита.
	 * Глобально — `defaults.BaseInput.ui` плагина, классы склеиваются.
	 *
	 * @example
	 * <BaseInput :ui="{ wrapper: 'ring-1', field: 'font-mono' }" />
	 */
	ui?: UiProp<BaseInputPart>
}

export interface BaseInputEmits {
	(event: 'update:modelValue', value: string): void
	(event: 'blur', e: FocusEvent): void
	(event: 'focus', e: FocusEvent): void
	(event: 'keydown', e: KeyboardEvent): void
}

export interface BaseInputSlots {
	/** Кастомный префикс */
	prefix?: () => unknown
	/** Кастомный постфикс */
	postfix?: () => unknown
	/** Кастомный суффикс */
	suffix?: () => unknown
}

export type InputProps = PropsWithDefaults<BaseInputProps, 'type' | 'mask' | 'isRequired' | 'isReadonly' | 'isDisabled'>
