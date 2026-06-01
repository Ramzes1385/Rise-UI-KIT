import { computed } from 'vue'

import type { CustomClassProp, UseCustomClassOptions } from './useCustomClass.types'

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
 * Composable для обработки кастомных классов компонентов.
 * Поддерживает строки (для корневого элемента), а также объекты для стилизации внутренних элементов.
 */
function useCustomClass(options: UseCustomClassOptions) {
	const keys = options.elementKeys || ['root']

	const classes = computed(function () {
		const customClass = options.getClass()
		const result: Record<string, any> = {}

		// Инициализируем все ключи как undefined
		keys.forEach(function (key) {
			result[key] = undefined
		})

		if (!customClass) {
			return result
		}

		// Если это строка, то это класс только для корневого элемента
		if (typeof customClass === 'string') {
			result.root = customClass
			return result
		}

		// Если это объект
		if (isObject(customClass)) {
			// Если объект содержит хотя бы один из известных ключей элементов
			if (hasElementKeys(customClass, keys)) {
				keys.forEach(function (key) {
					const val = Reflect.get(customClass, key)
					if (val !== undefined) {
						result[key] = val
					}
				})
			} else {
				// Иначе весь объект относится к корневому элементу
				result.root = customClass
			}
		}

		return result
	})

	return {
		classes,
	}
}

export { useCustomClass }
export type { CustomClassProp }
