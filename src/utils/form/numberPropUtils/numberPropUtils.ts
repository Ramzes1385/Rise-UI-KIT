/** Утилиты: проверка числовых пропсов компонентов — недопустимое значение заменяется, а в консоль уходит предупреждение */

import { warn } from '@/locales/warn'
import { UI_VALUE_WARNINGS } from '@/locales/messages'
import type { NumberPropCheck, OptionalNumberPropCheck } from './types/numberPropUtils.types'

function report(message: string, check: NumberPropCheck): number {
	warn(message, { component: check.component, prop: check.prop, value: String(check.value), fallback: check.fallback })
	return check.fallback
}

/** Конечное число; NaN и Infinity заменяются на `fallback` */
function finiteProp(check: NumberPropCheck): number {
	if (Number.isFinite(check.value)) return check.value
	return report(UI_VALUE_WARNINGS.NOT_FINITE, check)
}

/** Конечное число больше 0; иначе — `fallback` */
function positiveProp(check: NumberPropCheck): number {
	if (!Number.isFinite(check.value)) return report(UI_VALUE_WARNINGS.NOT_FINITE, check)
	if (check.value <= 0) return report(UI_VALUE_WARNINGS.NOT_POSITIVE, check)
	return check.value
}

/** Целое число не меньше 1; дробное округляется до ближайшего целого, остальное недопустимое — `fallback` */
function countProp(check: NumberPropCheck): number {
	const value = positiveProp(check)
	if (Number.isInteger(value)) return value
	return report(UI_VALUE_WARNINGS.NOT_INTEGER, { ...check, fallback: Math.max(1, Math.round(value)) })
}

/** Конечное число не меньше 0; иначе — `undefined`: проп не применяется */
function nonNegativeProp(check: OptionalNumberPropCheck): number | undefined {
	if (Number.isFinite(check.value) && check.value >= 0) return check.value
	warn(UI_VALUE_WARNINGS.NEGATIVE, { component: check.component, prop: check.prop, value: String(check.value) })
	return undefined
}

/** Границы диапазона: при `max < min` диапазон сводится к `min` (как у нативного `<input type="range">`) */
function orderedMax(component: string, min: number, max: number): number {
	if (max >= min) return max
	warn(UI_VALUE_WARNINGS.MAX_BELOW_MIN, { component, min, max })
	return min
}

export { countProp, finiteProp, nonNegativeProp, orderedMax, positiveProp }
