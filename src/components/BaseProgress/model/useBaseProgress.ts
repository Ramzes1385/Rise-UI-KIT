import { formatMessage } from '@/locales'
import { UI_ARIA } from '@/locales/messages'
import { computed, useId, watch } from 'vue'
import { useSizeScale } from '@composables/base/useSizeScale'
import { useCustomClass } from '@composables/base/useCustomClass'
import { useCustomColor } from '@composables/base/useCustomColor'
import type { BaseProgressEmits, ProgressGradientStop, ProgressProps } from '../types/BaseProgress.types'

const CIRCLE_VIEWBOX = 120
const CIRCLE_STROKE = 8
const CIRCLE_CENTER = CIRCLE_VIEWBOX / 2
const CIRCLE_RADIUS = CIRCLE_CENTER - CIRCLE_STROKE
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

function toRatio(props: ProgressProps): number {
	if (props.isIndeterminate) return 0
	if (!Number.isFinite(props.max) || props.max <= 0 || Number.isNaN(props.value)) return 0
	return Math.min(Math.max(props.value, 0), props.max) / props.max
}

function toPercent(ratio: number): number {
	const percent = Math.round(ratio * 100)
	return ratio < 1 ? Math.min(percent, 99) : percent
}

export function useBaseProgress(props: ProgressProps, emit: BaseProgressEmits) {
	const ratio = computed(() => toRatio(props))
	const percent = computed(() => toPercent(ratio.value))
	const gradientId = `base-progress-${useId()}`
	const gradientStops = computed(() => GRADIENT_STOPS[props.fill] ?? [])
	watch(
		() => ratio.value >= 1,
		isComplete => {
			if (isComplete) emit('complete')
		},
		{ immediate: true },
	)

	return {
		...useCustomClass({ getClass: () => props.customClass, elementKeys: PROGRESS_ELEMENTS }),
		...useSizeScale({ getScale: () => props.sizeScale }),
		...useCustomColor({ getColor: () => props.color }),
		percent,
		valueText: computed(() =>
			props.isIndeterminate ? UI_ARIA.PROGRESS_INDETERMINATE : formatMessage(UI_ARIA.PROGRESS_VALUE, { percent: percent.value }),
		),
		isLabelVisible: computed(() => props.hasLabel && !props.isIndeterminate),
		fillStyle: computed(() => (props.isIndeterminate ? undefined : { width: `${percent.value}%` })),
		circleViewBox: `0 0 ${CIRCLE_VIEWBOX} ${CIRCLE_VIEWBOX}`,
		circleCenter: CIRCLE_CENTER,
		circleStroke: CIRCLE_STROKE,
		circleRadius: CIRCLE_RADIUS,
		circumference: CIRCUMFERENCE,
		fillClass: computed(() => (props.fill === 'solid' ? '' : `base-progress--fill-${props.fill}`)),
		gradientId,
		gradientStops,
		circleStrokeStyle: computed(() => (gradientStops.value.length ? { stroke: `url(#${gradientId})` } : undefined)),
		circleOffset: computed(() => (props.isIndeterminate ? CIRCUMFERENCE : CIRCUMFERENCE * (1 - percent.value / 100))),
	}
}
