import { computed, ref } from 'vue'
import { UI_CHARTS } from '@/locales/messages'
import { useUi } from '@composables/base/useUi'
import { useTween } from '@composables/interaction/useTween'
import { formatMessage, formatNumber } from '@/locales/state'
import type { BaseSparklineProps } from '../types/BaseSparkline.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { areaPath, barHeight, linePath, nearestIndex, sparklinePoints } from './chart/sparklineGeometry'

export function useBaseSparkline(props: BaseSparklineProps) {
	const height = computed(() => props.height ?? 32)
	const format = (value: number): string => (props.formatValue ?? formatNumber)(value)
	const rootRef = ref<HTMLElement | null>(null)
	const tween = useTween(() => props.values, { target: rootRef })
	const points = computed(() => sparklinePoints(tween.value.value, { height: height.value, labels: props.labels ?? [] }))
	const activeIndex = ref<number | null>(null)
	return {
		...useStandardBaseComponent('base-sparkline', props, ['root']),
		ui: useUi(props, 'base-sparkline'),
		rootRef,
		height,
		points,
		line: computed(() => linePath(points.value)),
		area: computed(() => areaPath(points.value, height.value)),
		barHeight: (value: number): string => `${barHeight(value, tween.value.value)}%`,
		stroke: computed(() => props.markColor),
		active: computed(() => (activeIndex.value === null ? null : points.value[activeIndex.value])),
		format,
		summary: computed(() => {
			if (!props.values.length) return props.label
			const last = props.values[props.values.length - 1]
			return formatMessage(UI_CHARTS.SUMMARY, {
				label: props.label,
				min: format(Math.min(...props.values)),
				max: format(Math.max(...props.values)),
				last: format(last),
			})
		}),
		handlePointerMove(event: PointerEvent): void {
			const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
			activeIndex.value = props.values.length ? nearestIndex(event.clientX, rect, props.values.length) : null
		},
		handlePointerLeave(): void {
			activeIndex.value = null
		},
	}
}
