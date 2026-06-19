/** Composable: вычисление CSS-классов компонента */
import { computed } from 'vue'
import { hasElementKeys, isObject } from '@utils/typeUtils'
import type { CustomClassProp, UseCustomClassOptions } from './useCustomClass.types'

type ClassResultInternal = string | Record<string, string | boolean | undefined> | undefined

/**
 * Composable для вычисления CSS-классов компонента.
 * Поддерживает customClass в виде строки, объекта или массива с element-level ключами.
 */
function useCustomClass(options: UseCustomClassOptions) {
	const keys = options.elementKeys || ['root']

	const classes = computed<Record<string, string | undefined>>(function () {
		const customClass = options.getClass()
		const result: Record<string, ClassResultInternal> = {}

		keys.forEach(function (key) {
			result[key] = undefined
		})

		if (!customClass) {
			return result as Record<string, string | undefined>
		}

		if (typeof customClass === 'string') {
			result.root = customClass
			return result as Record<string, string | undefined>
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
				result.root = customClass as Record<string, string | boolean | undefined>
			}
		}

		return result as Record<string, string | undefined>
	})

	return {
		classes,
	}
}

export { useCustomClass }
export type { CustomClassProp }
