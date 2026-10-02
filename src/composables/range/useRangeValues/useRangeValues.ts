/** Composable: значения, стили и сегменты заполнения range-слайдера */
import { computed } from 'vue'
import { boundedValue, rangeBounds } from './rangeBounds'
import { snapToStep, toPercent } from '@utils/form/rangeUtils'
import { buildFillSegments, positionStyle } from './rangeStyles'
import type { RangeBounds, RangeEmitContext, RangeMode, UseRangeValuesOptions, UseRangeValuesReturn } from './types/useRangeValues.types'

/** Описание: режим по заданным props: points — несколько точек, rangeValue — диапазон, иначе — одно значение */
function rangeMode(props: UseRangeValuesOptions['props']): RangeMode {
	if (props.points) return 'points'
	if (props.rangeValue) return 'range'
	return 'single'
}

/** Описание: значения точек в порядке ползунков, каждое — в границах диапазона */
function rangePointValues(props: UseRangeValuesOptions['props'], bounds: RangeBounds): number[] {
	if (props.points) return props.points.map(value => boundedValue(value, 'points', bounds))
	if (props.rangeValue) return props.rangeValue.slice(0, 2).map(value => boundedValue(value, 'rangeValue', bounds))
	return [boundedValue(props.modelValue, 'modelValue', bounds)]
}

/** Описание: эмитит update:* после изменения одной точки — в форме v-model текущего режима */
function emitPointUpdate({ emit, mode, values }: RangeEmitContext, index: number, value: number): void {
	if (mode === 'single') return emit('update:modelValue', value)
	const next = values.slice()
	next[index] = value
	if (mode === 'range') return emit('update:rangeValue', [next[0], next[1]])
	emit('update:points', next)
}

/** Описание: эмитит change со значениями точек в форме текущего режима */
function emitRangeChange({ emit, mode, values }: RangeEmitContext): void {
	if (mode === 'single') return emit('change', values[0])
	if (mode === 'range') return emit('change', [values[0], values[1]])
	emit('change', values.slice())
}

/** Описание: вычисляет значения, стили и сегменты заполнения range-слайдера, обеспечивает установку значений ползунков и эмит изменений */
function useRangeValues({ props, emit }: UseRangeValuesOptions): UseRangeValuesReturn {
	const mode = computed((): RangeMode => rangeMode(props))
	const bounds = computed((): RangeBounds => rangeBounds(props))
	const pointValues = computed((): number[] => rangePointValues(props, bounds.value))

	function percent(value: number): number {
		return toPercent({ value, min: bounds.value.min, max: bounds.value.max })
	}

	function thumbMin(index: number): number {
		return index > 0 ? pointValues.value[index - 1] : bounds.value.min
	}

	function thumbMax(index: number): number {
		const next = pointValues.value[index + 1]
		return next === undefined ? bounds.value.max : next
	}

	function snapToStepValue(value: number): number {
		return snapToStep({ value, ...bounds.value })
	}

	function setPointValue(index: number, rawValue: number): void {
		const value = Math.max(bounds.value.min, Math.min(bounds.value.max, rawValue))
		emitPointUpdate(
			{ emit, mode: mode.value, values: pointValues.value },
			index,
			Math.max(thumbMin(index), Math.min(thumbMax(index), value)),
		)
	}

	/**
	 * Эмитить change. Без аргумента берутся текущие props (окончание drag — к этому моменту родитель
	 * уже применил update:*); при клавиатурном шаге props ещё не обновлены — значения передаются явно.
	 */
	function emitChange(values: number[] = pointValues.value): void {
		emitRangeChange({ emit, mode: mode.value, values })
	}

	return {
		mode,
		bounds,
		pointValues,
		labelText: computed((): string => pointValues.value.join(' — ')),
		tooltipPosition: computed((): 'top' | 'right' => (props.isVertical ? 'right' : 'top')),
		fillSegments: computed((): Record<string, string>[] =>
			buildFillSegments(pointValues.value.map(percent), mode.value === 'single', props.isVertical),
		),
		thumbStyle: (value: number): Record<string, string> => positionStyle(percent(value), props.isVertical),
		markStyle: (value: number): Record<string, string> => positionStyle(percent(value), props.isVertical),
		thumbMin,
		thumbMax,
		snapToStepValue,
		setPointValue,
		emitChange,
	}
}

export { useRangeValues }
