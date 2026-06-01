import { computed } from 'vue'

import type {
	PaddingProp,
	PaddingValue,
	ResolvedPadding,
	ResolvedPaddingSides,
	UsePaddingOptions,
} from './usePadding.types'

const ALL_SIDES_SET: ResolvedPaddingSides = { top: true, right: true, bottom: true, left: true }

/**
 * Результат разрешения padding: значения по сторонам и признак того,
 * какие стороны выведены из входных данных.
 */
export interface ResolvePaddingResult {
	values: ResolvedPadding
	sides: ResolvedPaddingSides
}

/**
 * Разрешает значение padding (число или объект) в отступы по четырём сторонам.
 * Число: top/bottom = n, left/right = n × axisMultiplier (определены только left/right
 * семантически по горизонтали, но вертикаль также вычисляется как n).
 * Объект: оси x/y задают пары сторон, точечные стороны их переопределяют.
 * Поле `sides` отмечает стороны, значение которых выведено из входа (для omitUnsetSides).
 */
function resolvePadding(value: PaddingProp, axisMultiplier: number): ResolvePaddingResult {
	if (typeof value === 'number') {
		const horizontal = value * axisMultiplier
		return {
			values: { top: value, right: horizontal, bottom: value, left: horizontal },
			sides: { top: false, right: true, bottom: false, left: true },
		}
	}

	const object: PaddingValue = value
	const fallbackY = object.y ?? 0
	const fallbackX = object.x ?? 0

	return {
		values: {
			top: object.top ?? fallbackY,
			right: object.right ?? fallbackX,
			bottom: object.bottom ?? fallbackY,
			left: object.left ?? fallbackX,
		},
		sides: {
			top: object.top !== undefined || object.y !== undefined,
			right: object.right !== undefined || object.x !== undefined,
			bottom: object.bottom !== undefined || object.y !== undefined,
			left: object.left !== undefined || object.x !== undefined,
		},
	}
}

/**
 * Composable для вычисления padding по четырём сторонам.
 * Поддерживает число (шорткат с осевым множителем) и объект { x, y, top, right, bottom, left }.
 * Устанавливает четыре CSS-переменные: {prefix}-top/right/bottom/left.
 *
 * При omitUnsetSides переменные выставляются только для сторон, выведенных из входа,
 * что позволяет оставить остальные стороны на дефолтах из SCSS.
 *
 * @example
 * ```ts
 * const { paddingStyle } = usePadding({
 *   getPadding: () => props.padding,
 *   prefix: '--btn-pad',
 *   defaultPadding: 10,
 * })
 * ```
 */
function usePadding(options: UsePaddingOptions) {
	const axisMultiplier = options.axisMultiplier ?? 2

	const resolved = computed<ResolvePaddingResult>(() => {
		const value = options.getPadding() ?? options.defaultPadding ?? 0
		return resolvePadding(value, axisMultiplier)
	})

	const paddingStyle = computed<Record<string, string>>(() => {
		const { values, sides } = resolved.value
		const visibleSides = options.omitUnsetSides ? sides : ALL_SIDES_SET
		const style: Record<string, string> = {}
		if (visibleSides.top) style[`${options.prefix}-top`] = `${values.top}px`
		if (visibleSides.right) style[`${options.prefix}-right`] = `${values.right}px`
		if (visibleSides.bottom) style[`${options.prefix}-bottom`] = `${values.bottom}px`
		if (visibleSides.left) style[`${options.prefix}-left`] = `${values.left}px`
		return style
	})

	return { resolved, paddingStyle }
}

export { resolvePadding, usePadding }
