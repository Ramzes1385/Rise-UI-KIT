import { computed } from 'vue'

import type { CustomStyleProp, UseCustomStyleOptions } from './useCustomStyle.types'

/**
 * Проверяет, является ли значение объектом (не массивом и не null)
 */
function isObject(value: unknown): value is Record<string, any> {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Проверяет, содержит ли объект ключи элементов
 */
function hasElementKeys(style: Record<string, any>, keys: string[]): boolean {
	return keys.some(function (key) {
		return key in style
	})
}

/**
 * Composable для обработки кастомных стилей компонентов.
 * Поддерживает строки, плоские объекты стилей для корневого элемента,
 * а также вложенные объекты для стилизации внутренних элементов.
 */
function useCustomStyle(options: UseCustomStyleOptions) {
	const keys = options.elementKeys || ['root']

	const styles = computed(function () {
		const customStyle = options.getStyle()
		const result: Record<string, any> = {}

		// Инициализируем все ключи как undefined
		keys.forEach(function (key) {
			result[key] = undefined
		})

		if (!customStyle) {
			return result
		}

		// Если это строка, то это стили только для корневого элемента
		if (typeof customStyle === 'string') {
			result.root = customStyle
			return result
		}

		// Если это объект
		if (isObject(customStyle)) {
			// Если объект содержит хотя бы один из известных ключей элементов
			if (hasElementKeys(customStyle, keys)) {
				keys.forEach(function (key) {
					// Используем Reflect.get для безопасного получения значения без нарушения правил типизации и as/any
					const val = Reflect.get(customStyle, key)
					if (val !== undefined) {
						result[key] = val
					}
				})
			} else {
				// Иначе весь объект относится к корневому элементу
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
