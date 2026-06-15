import { computed } from 'vue'

import { hasElementKeys, isObject } from '@utils/typeUtils'
import type { CustomStyleProp, UseCustomStyleOptions } from './useCustomStyle.types'

type StyleResultValue = string | number | Record<string, string | number | undefined> | undefined

function useCustomStyle(options: UseCustomStyleOptions) {
	const keys = options.elementKeys || ['root']

	const styles = computed<Record<string, StyleResultValue>>(function () {
		const customStyle = options.getStyle()
		const result: Record<string, StyleResultValue> = {}

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
						result[key] = val as string | number | Record<string, string | number | undefined>
					}
				})
			} else {
				result.root = customStyle as Record<string, string | number | undefined>
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
