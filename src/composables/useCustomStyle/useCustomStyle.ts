import { computed } from 'vue'

import type { CustomStyleProp, UseCustomStyleOptions } from './useCustomStyle.types'

/**
 * Проверяет, является ли значение объектом (не массивом и не null)
 */
function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Проверяет, содержит ли объект ключи элементов
 */
function hasElementKeys(obj: Record<string, unknown>, keys: string[]): boolean {
	return keys.some(function (key) {
		return key in obj
	})
}

/**
 * Composable для обработки кастомных стилей компонентов.
 * Поддерживает строки, плоские объекты стилей для корневого элемента,
 * а также вложенные объекты для стилизации внутренних элементов.
 */
function useCustomStyle(options: UseCustomStyleOptions) {
	const keys = options.elementKeys || ['root']

	const styles = computed<Record<string, string | Record<string, string | number | undefined> | undefined>>(function () {
		const customStyle = options.getStyle()
		const result: Record<string, any> = {}

		keys.forEach(function (key) {
			result[key] = undefined
		})

		if (!customStyle) {
			return result
		}

		if (typeof customStyle === 'string') {
			result.root = customStyle
			return result
		}

		if (isObject(customStyle)) {
			if (hasElementKeys(customStyle, keys)) {
				keys.forEach(function (key) {
					const val = Reflect.get(customStyle, key)
					if (val !== undefined) {
						result[key] = val
					}
				})
			} else {
				result.root = customStyle
			}
		}

		return result
	})

	return {
		styles,
	}
}

export { useCustomStyle }
export type { CustomStyleProp }
