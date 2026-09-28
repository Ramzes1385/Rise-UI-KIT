/** Standard Schema v1 (standardschema.dev) — общий интерфейс схем Zod/Valibot/ArkType; типы скопированы из спецификации, чтобы не зависеть от библиотеки */
export interface StandardSchemaV1<Input = unknown, Output = Input> {
	readonly '~standard': StandardSchemaProps<Input, Output>
}

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
