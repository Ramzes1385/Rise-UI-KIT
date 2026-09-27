/** Утилиты: проверка данных формы по схеме Standard Schema и ошибки по именам полей */
import type { FormIssue, FormValidationResult, StandardSchemaIssue, StandardSchemaV1 } from './formUtils.types'

/** Путь ошибки схемы — имя поля через точку: `['address', 'city']` → `address.city`, `['tags', 0]` → `tags.0` */
function issueName(issue: StandardSchemaIssue): string {
	return (issue.path ?? []).map(segment => String(typeof segment === 'object' ? segment.key : segment)).join('.')
}

/** Проверить значение схемой Standard Schema (синхронной или асинхронной) */
async function validateSchema<Output>(schema: StandardSchemaV1<unknown, Output>, value: unknown): Promise<FormValidationResult<Output>> {
	const result = await schema['~standard'].validate(value)
	if (result.issues) {
		return { issues: result.issues.map(issue => ({ name: issueName(issue), message: issue.message })) }
	}
	return { value: result.value, issues: [] }
}

/** Ошибки по именам полей: у поля — первое сообщение схемы */
function issuesToErrors(issues: readonly FormIssue[]): Record<string, string> {
	const errors: Record<string, string> = {}
	for (const issue of issues) {
		if (!(issue.name in errors)) errors[issue.name] = issue.message
	}
	return errors
}

export { issueName, issuesToErrors, validateSchema }
