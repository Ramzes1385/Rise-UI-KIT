/** Composable: логика BaseProgress — процент, заливка, круг и событие завершения */
import { computed, watch } from 'vue'
import { useSizeScale } from '@composables/useSizeScale'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import type { BaseProgressEmits, ProgressProps } from '../types/BaseProgress.types'

/** Радиус круга в системе координат viewBox 120×120 */
const CIRCLE_RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS
const PROGRESS_ELEMENTS = ['root', 'track', 'fill', 'tooltipTrigger', 'tooltipAnchor', 'svg', 'trackCircle', 'fillCircle', 'circleLabel']

function toPercent(props: ProgressProps): number {
	if (props.isIndeterminate) return 0
	// Некорректный max (0, отрицательный, NaN, Infinity) или value=NaN давали бы «NaN%» в подписи и aria-valuenow
	if (!Number.isFinite(props.max) || props.max <= 0 || Number.isNaN(props.value)) return 0
	const clamped = Math.min(Math.max(props.value, 0), props.max)
	return Math.round((clamped / props.max) * 100)
}

export function useBaseProgress(props: ProgressProps, emit: BaseProgressEmits) {
	const percent = computed(() => toPercent(props))
	watch(percent, value => {
		if (value >= 100) emit('complete')
	})

	return {
		...useCustomClass({ getClass: () => props.customClass, elementKeys: PROGRESS_ELEMENTS }),
		...useSizeScale({ getScale: () => props.sizeScale }),
		...useCustomColor({ getColor: () => props.color }),
		percent,
		/** В неопределённом режиме значение неизвестно: «0%» не показывается */
		isLabelVisible: computed(() => props.hasLabel && !props.isIndeterminate),
		/** Ширину заливки в неопределённом режиме задают стили (бегущая или статичная полоса), а не значение */
		fillStyle: computed(() => (props.isIndeterminate ? undefined : { width: `${percent.value}%` })),
		circleRadius: CIRCLE_RADIUS,
		circumference: CIRCUMFERENCE,
		circleOffset: computed(() => (props.isIndeterminate ? CIRCUMFERENCE : CIRCUMFERENCE * (1 - percent.value / 100))),
	}
}
