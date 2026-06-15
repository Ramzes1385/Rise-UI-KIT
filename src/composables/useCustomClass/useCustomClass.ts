import { computed } from 'vue'

import type { CustomClassProp, UseCustomClassOptions } from './useCustomClass.types'

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
 * Composable для обработки кастомных классов компонентов.
 * Поддерживает строки (для корневого элемента), а также объекты для стилизации внутренних элементов.
 */
function useCustomClass(options: UseCustomClassOptions) {
	const keys = options.elementKeys || ['root']

	const classes = computed<any>(function () {
		const customClass = options.getClass()
		const result: Record<string, any> = {}

		keys.forEach(function (key) {
			result[key] = undefined
		})

		if (!customClass) {
			return result
		}

		if (typeof customClass === 'string') {
			result.root = customClass
			return result
		}

		if (isObject(customClass)) {
			if (hasElementKeys(customClass, keys)) {
				keys.forEach(function (key) {
					const val = Reflect.get(customClass, key)
					if (typeof val === 'string') {
						result[key] = val
					}
				})
			} else {
				result.root = customClass as any
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
