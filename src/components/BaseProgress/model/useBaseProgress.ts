import { formatMessage } from '@/locales'
import type { ComputedRef, Ref } from 'vue'
import { UI_ARIA } from '@/locales/messages'
import { useUi } from '@composables/base/useUi'
import { computed, ref, useId, watch } from 'vue'
import { useTween } from '@composables/interaction/useTween'
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

function hasCountdown(props: ProgressProps): boolean {
	return props.shape === 'line' && props.countdown !== undefined && props.countdown > 0
}

function toRatio(props: ProgressProps): number {
	if (props.isIndeterminate || hasCountdown(props)) return 0
	if (!Number.isFinite(props.max) || props.max <= 0 || Number.isNaN(props.value)) return 0
	return Math.min(Math.max(props.value, 0), props.max) / props.max
}

function toPercent(ratio: number): number {
	const percent = Math.round(ratio * 100)
	return ratio < 1 ? Math.min(percent, 99) : percent
}

function useProgressCircle(props: ProgressProps, percent: ComputedRef<number>) {
	const gradientId = `base-progress-${useId()}`
	const gradientStops = computed(() => GRADIENT_STOPS[props.fill] ?? [])

	return {
		circleViewBox: `0 0 ${CIRCLE_VIEWBOX} ${CIRCLE_VIEWBOX}`,
		circleCenter: CIRCLE_CENTER,
		circleStroke: CIRCLE_STROKE,
		circleRadius: CIRCLE_RADIUS,
		circumference: CIRCUMFERENCE,
		gradientId,
		gradientStops,
		circleStrokeStyle: computed(() => (gradientStops.value.length ? { stroke: `url(#${gradientId})` } : undefined)),
		circleOffset: computed(() => (props.isIndeterminate ? CIRCUMFERENCE : CIRCUMFERENCE * (1 - percent.value / 100))),
	}
}

function useProgressLabel(props: ProgressProps, percent: ComputedRef<number>, rootRef: Ref<HTMLElement | null>) {
	const tween = useTween(() => percent.value, { duration: 'base', target: rootRef })
	const percentStyle = computed(() => ({ '--progress-percent': percent.value }))

	return {
		displayPercent: computed(() => Math.round(tween.value.value)),
		percentStyle,
		fillStyle: computed(() => {
			if (hasCountdown(props)) return { '--progress-countdown': `${props.countdown}ms` }
			return props.isIndeterminate ? undefined : percentStyle.value
		}),
		isLabelVisible: computed(() => props.hasLabel && !props.isIndeterminate && !hasCountdown(props)),
	}
}

export function useBaseProgress(props: ProgressProps, emit: BaseProgressEmits) {
	const rootRef = ref<HTMLElement | null>(null)
	const ratio = computed(() => toRatio(props))
	const percent = computed(() => toPercent(ratio.value))
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
		...useProgressCircle(props, percent),
		...useProgressLabel(props, percent, rootRef),
		ui: useUi(props, 'base-progress'),
		rootRef,
		percent,
		valueText: computed(() => {
			if (props.isIndeterminate || hasCountdown(props)) return UI_ARIA.PROGRESS_INDETERMINATE
			return formatMessage(UI_ARIA.PROGRESS_VALUE, { percent: percent.value })
		}),
		isCountdown: computed(() => hasCountdown(props)),
		fillClass: computed(() => (props.fill === 'solid' ? '' : `base-progress--fill-${props.fill}`)),
	}
}
