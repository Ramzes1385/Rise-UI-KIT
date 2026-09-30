import { computed, useId, watch } from 'vue'
import { useSizeScale } from '@composables/base/useSizeScale'
import { useCustomClass } from '@composables/base/useCustomClass'
import { useCustomColor } from '@composables/base/useCustomColor'
import type { BaseProgressEmits, ProgressGradientStop, ProgressProps } from '../types/BaseProgress.types'

const CIRCLE_RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS
const PROGRESS_ELEMENTS = ['root', 'track', 'fill', 'tooltipTrigger', 'tooltipAnchor', 'svg', 'trackCircle', 'fillCircle', 'circleLabel']

const RAINBOW = [8, 2, 4, 3, 1, 7, 5]

const GRADIENT_STOPS: Record<string, ProgressGradientStop[]> = {
	gradient: [
		{ offset: 0, color: 'color-mix(in srgb, var(--progress-color) 35%, var(--rise-bg))' },
		{ offset: 1, color: 'var(--progress-color)' },
	],
	rainbow: RAINBOW.map((index, position) => ({ offset: position / (RAINBOW.length - 1), color: `var(--rise-chart-${index})` })),
}

function toPercent(props: ProgressProps): number {
	if (props.isIndeterminate) return 0
	if (!Number.isFinite(props.max) || props.max <= 0 || Number.isNaN(props.value)) return 0
	const clamped = Math.min(Math.max(props.value, 0), props.max)
	return Math.round((clamped / props.max) * 100)
}

export function useBaseProgress(props: ProgressProps, emit: BaseProgressEmits) {
	const percent = computed(() => toPercent(props))
	const gradientId = `base-progress-${useId()}`
	const gradientStops = computed(() => GRADIENT_STOPS[props.fill] ?? [])
	watch(percent, value => {
		if (value >= 100) emit('complete')
	})

	return {
		...useCustomClass({ getClass: () => props.customClass, elementKeys: PROGRESS_ELEMENTS }),
		...useSizeScale({ getScale: () => props.sizeScale }),
		...useCustomColor({ getColor: () => props.color }),
		percent,
		isLabelVisible: computed(() => props.hasLabel && !props.isIndeterminate),
		fillStyle: computed(() => (props.isIndeterminate ? undefined : { width: `${percent.value}%` })),
		circleRadius: CIRCLE_RADIUS,
		circumference: CIRCUMFERENCE,
		fillClass: computed(() => (props.fill === 'solid' ? '' : `base-progress--fill-${props.fill}`)),
		gradientId,
		gradientStops,
		circleStrokeStyle: computed(() => (gradientStops.value.length ? { stroke: `url(#${gradientId})` } : undefined)),
		circleOffset: computed(() => (props.isIndeterminate ? CIRCUMFERENCE : CIRCUMFERENCE * (1 - percent.value / 100))),
	}
}
