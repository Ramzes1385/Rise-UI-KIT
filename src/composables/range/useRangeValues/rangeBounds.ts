/** Утилиты: проверенные границы, шаг и значения range-слайдера — недопустимое заменяется с предупреждением в консоли */

import { finiteProp, orderedMax, positiveProp } from '@utils/form/numberPropUtils'
import type { RangeBounds, UseRangeValuesOptions } from './types/useRangeValues.types'

const COMPONENT = 'BaseRange'
const DEFAULT_MIN = 0
const DEFAULT_MAX = 100
const DEFAULT_STEP = 1

/** Описание: min и max — конечные числа (иначе 0 и 100), max не меньше min, step — больше 0 (иначе 1) */
function rangeBounds(props: UseRangeValuesOptions['props']): RangeBounds {
	const min = finiteProp({ component: COMPONENT, prop: 'min', value: props.min, fallback: DEFAULT_MIN })
	const max = finiteProp({ component: COMPONENT, prop: 'max', value: props.max, fallback: DEFAULT_MAX })
	const step = positiveProp({ component: COMPONENT, prop: 'step', value: props.step, fallback: DEFAULT_STEP })
	return { min, max: orderedMax(COMPONENT, min, max), step }
}

/** Описание: значение точки в границах диапазона; не число — min с предупреждением, вне границ — ближайшая граница */
function boundedValue(value: number, prop: string, bounds: RangeBounds): number {
	const finite = finiteProp({ component: COMPONENT, prop, value, fallback: bounds.min })
	return Math.max(bounds.min, Math.min(bounds.max, finite))
}

export { boundedValue, rangeBounds }
