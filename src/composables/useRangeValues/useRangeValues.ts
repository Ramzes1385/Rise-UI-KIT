/** Composable: значения, стили и сегменты заполнения range-слайдера */
import { computed } from 'vue'
import { snapToStep, toPercent } from '@utils/rangeUtils'
import type { RangeMode, UseRangeValuesOptions, UseRangeValuesReturn } from './useRangeValues.types'

/** Описание: вычисляет значения, стили и сегменты заполнения range-слайдера, обеспечивает установку значений ползунков и эмит изменений */
function useRangeValues({ props, emit }: UseRangeValuesOptions): UseRangeValuesReturn {
	const mode = computed((): RangeMode => {
		if (props.points) return 'points'
		if (props.rangeValue) return 'range'
		return 'single'
	})

	const pointValues = computed((): number[] => {
		if (props.points) return props.points
		if (props.rangeValue) return [props.rangeValue[0], props.rangeValue[1]]
		return [props.modelValue]
	})

	const labelText = computed((): string => {
		if (mode.value === 'single') return String(props.modelValue)
		return pointValues.value.join(' — ')
	})

	const tooltipPosition = computed((): 'top' | 'right' => {
		return props.isVertical ? 'right' : 'top'
	})

	function percent(value: number): number {
		return toPercent({ value, min: props.min, max: props.max })
	}

	function fillSegmentStyle(fromPercent: number, toPercentValue: number): Record<string, string> {
		const start = Math.min(fromPercent, toPercentValue)
		const size = Math.abs(toPercentValue - fromPercent)
		if (props.isVertical) {
			return { bottom: `${start}%`, height: `${size}%` }
		}
		return { left: `${start}%`, width: `${size}%` }
	}

	const fillSegments = computed((): Record<string, string>[] => {
		if (mode.value === 'single') {
			return [fillSegmentStyle(0, percent(pointValues.value[0]))]
		}
		const segments: Record<string, string>[] = []
		for (let i = 0; i < pointValues.value.length - 1; i += 1) {
			segments.push(fillSegmentStyle(percent(pointValues.value[i]), percent(pointValues.value[i + 1])))
		}
		return segments
	})

	function thumbStyle(value: number): Record<string, string> {
		const percentValue = percent(value)
		if (props.isVertical) {
			return { bottom: `${percentValue}%` }
		}
		return { left: `${percentValue}%` }
	}

	function markStyle(value: number): Record<string, string> {
		const percentValue = percent(value)
		if (props.isVertical) {
			return { bottom: `${percentValue}%` }
		}
		return { left: `${percentValue}%` }
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

	function clampToNeighbors(index: number, value: number): number {
		const lower = thumbMin(index)
		const upper = thumbMax(index)
		return Math.max(lower, Math.min(upper, value))
	}

	function withUpdatedPoint(index: number, value: number): number[] {
		const next = pointValues.value.slice()
		next[index] = value
		return next
	}

	function emitUpdate(index: number, value: number): void {
		if (mode.value === 'single') {
			emit('update:modelValue', value)
			return
		}
		const next = withUpdatedPoint(index, value)
		if (mode.value === 'range') {
			emit('update:rangeValue', [next[0], next[1]])
			return
		}
		emit('update:points', next)
	}

	function setPointValue(index: number, rawValue: number): void {
		const clamped = clampToNeighbors(index, Math.max(props.min, Math.min(props.max, rawValue)))
		emitUpdate(index, clamped)
	}

	function emitChange(): void {
		if (mode.value === 'single') {
			emit('change', props.modelValue)
			return
		}
		if (mode.value === 'range') {
			emit('change', [pointValues.value[0], pointValues.value[1]])
			return
		}
		emit('change', pointValues.value.slice())
	}

	return {
		mode,
		pointValues,
		labelText,
		tooltipPosition,
		fillSegments,
		thumbStyle,
		markStyle,
		thumbMin,
		thumbMax,
		snapToStepValue,
		setPointValue,
		emitChange,
	}
}

export { useRangeValues }
