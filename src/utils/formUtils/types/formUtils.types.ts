/**
 * Standard Schema v1 (https://standardschema.dev): общий интерфейс схем Zod, Valibot, ArkType и других.
 * Типы скопированы из спецификации — кит проверяет данные любой такой схемой без зависимости от библиотеки.
 */
export interface StandardSchemaV1<Input = unknown, Output = Input> {
	readonly '~standard': StandardSchemaProps<Input, Output>
}

/** Свойства схемы по спецификации Standard Schema v1 */
export interface StandardSchemaProps<Input = unknown, Output = Input> {
	readonly version: 1
	readonly vendor: string
	readonly validate: (value: unknown) => StandardSchemaResult<Output> | Promise<StandardSchemaResult<Output>>
	readonly types?: { readonly input: Input; readonly output: Output } | undefined
}

/** Результат проверки: значение (после преобразований схемы) или список ошибок */
export type StandardSchemaResult<Output> =
	{ readonly value: Output; readonly issues?: undefined } | { readonly issues: ReadonlyArray<StandardSchemaIssue> }

/** Ошибка схемы: сообщение и путь к полю (`['address', 'city']` или сегменты `{ key }`) */
export interface StandardSchemaIssue {
	readonly message: string
	readonly path?: ReadonlyArray<PropertyKey | { readonly key: PropertyKey }> | undefined
}

/** Ошибка поля формы: `name` — путь через точку (`address.city`), пустая строка — ошибка всей формы */
export interface FormIssue {
	name: string
	message: string
}

/** Итог проверки формы: `value` — данные после схемы (при успехе), `issues` — ошибки полей */
export interface FormValidationResult<Output = unknown> {
	value?: Output
	issues: FormIssue[]
}
