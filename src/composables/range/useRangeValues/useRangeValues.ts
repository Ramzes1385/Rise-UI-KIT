/** Composable: значения, стили и сегменты заполнения range-слайдера */
import { computed } from 'vue'
import { snapToStep, toPercent } from '@utils/form/rangeUtils'
import { buildFillSegments, positionStyle } from './rangeStyles'
import type { RangeEmitContext, RangeMode, UseRangeValuesOptions, UseRangeValuesReturn } from './types/useRangeValues.types'

/** Описание: режим по заданным props: points — несколько точек, rangeValue — диапазон, иначе — одно значение */
function rangeMode(props: UseRangeValuesOptions['props']): RangeMode {
	if (props.points) return 'points'
	if (props.rangeValue) return 'range'
	return 'single'
}

/** Описание: значения точек в порядке ползунков */
function rangePointValues(props: UseRangeValuesOptions['props']): number[] {
	if (props.points) return props.points
	if (props.rangeValue) return [props.rangeValue[0], props.rangeValue[1]]
	return [props.modelValue]
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
	const pointValues = computed((): number[] => rangePointValues(props))

	function percent(value: number): number {
		return toPercent({ value, min: props.min, max: props.max })
	}

	function thumbMin(index: number): number {
		return index > 0 ? pointValues.value[index - 1] : props.min
	}

	function thumbMax(index: number): number {
		const next = pointValues.value[index + 1]
		return next === undefined ? props.max : next
	}

	function snapToStepValue(value: number): number {
		const snapped = snapToStep({ value, min: props.min, max: props.max, step: props.step })
		return Math.max(props.min, Math.min(props.max, snapped))
	}

	function setPointValue(index: number, rawValue: number): void {
		const value = Math.max(props.min, Math.min(props.max, rawValue))
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
		pointValues,
		labelText: computed((): string => (mode.value === 'single' ? String(props.modelValue) : pointValues.value.join(' — '))),
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
