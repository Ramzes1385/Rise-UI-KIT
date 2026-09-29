/** Утилиты: type-guard функции */

/** Проверяет, что значение — непустой объект (не массив, не null). */
function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Проверяет, содержит ли объект хотя бы один из указанных ключей.
 */
function hasElementKeys(obj: Record<string, unknown>, keys: string[]): boolean {
	return keys.some(function (key) {
		return key in obj
	})
}

export { hasElementKeys, isObject }
