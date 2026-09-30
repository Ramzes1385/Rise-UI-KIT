import type { StandardSchemaV1, StandardSchemaIssue } from '@utils/form/formUtils'

/** Правило схемы: поле, проверка и текст ошибки */
type SchemaRule<T> = readonly [field: keyof T & string, isValid: (data: T) => boolean, message: string]

export const EMAIL_PATTERN = /^\S+@\S+\.\S+$/

/** Простая схема в формате Standard Schema — вместо Zod или Valibot, которые приложение подключает само */
export function schemaOf<T>(rules: readonly SchemaRule<T>[]): StandardSchemaV1<T> {
	return {
		'~standard': {
			version: 1,
			vendor: 'story',
			validate: value => {
				const data = value as T
				const issues: StandardSchemaIssue[] = rules
					.filter(([, isValid]) => !isValid(data))
					.map(([field, , message]) => ({ message, path: [field] }))
				return issues.length ? { issues } : { value: data }
			},
		},
	}
}

/** Правила пароля: показываются под полем, пока пароль вводят */
export const PASSWORD_RULES = [
	{ key: 'length', label: 'Не короче 8 символов', validate: (value: string) => value.length >= 8 },
	{ key: 'digit', label: 'Есть цифра', validate: (value: string) => /\d/.test(value) },
	{ key: 'upper', label: 'Есть заглавная буква', validate: (value: string) => /\p{Lu}/u.test(value) },
]

export const isStrongPassword = (value: string): boolean => PASSWORD_RULES.every(rule => rule.validate(value))
