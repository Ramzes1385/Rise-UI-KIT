import type { BaseComponentProps } from '../../../types/base.types'

/** Варианты отображения инпута */
export const INPUT_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft', 'filled', 'underline'] as const

/**
 * Вариант отображения инпута
 */
export type InputVariant = (typeof INPUT_VARIANTS)[number]

/**
 * Фильтр допустимых символов
 */
export type AllowedChars = 'digits' | 'letters' | 'alphanumeric'

/**
 * Правило валидации пароля
 */
export interface PasswordRule {
	/** Ключ правила */
	key: string
	/** Текст правила */
	label: string
	/** Функция валидации */
	validate: (value: string) => boolean
}

/**
 * Результат проверки правила пароля
 */
export interface PasswordRuleResult {
	key: string
	label: string
	isValid: boolean
}


/**
 * Пропсы компонента BaseInput
 */
export interface BaseInputProps extends BaseComponentProps<InputVariant, 'root' | 'label' | 'required' | 'wrapper' | 'prefix' | 'field' | 'passwordToggle' | 'passwordIcon' | 'postfix' | 'passwordRules' | 'passwordRule' | 'passwordRuleIcon' | 'errorText'> {
	/** Значение поля (null трактуется как пустая строка) */
	modelValue: string | number | null
	/** Тип инпута */
	type?: 'text' | 'email' | 'tel' | 'number' | 'password'
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
}

/**
 * События компонента BaseInput
 */
export interface BaseInputEmits {
	(event: 'update:modelValue', value: string): void
	(event: 'blur', e: FocusEvent): void
	(event: 'focus', e: FocusEvent): void
	(event: 'keydown', e: KeyboardEvent): void
}

/**
 * Слоты компонента BaseInput
 */
export interface BaseInputSlots {
	/** Кастомный префикс */
	prefix?: () => unknown
	/** Кастомный постфикс */
	postfix?: () => unknown
	/** Кастомный суффикс */
	suffix?: () => unknown
}
