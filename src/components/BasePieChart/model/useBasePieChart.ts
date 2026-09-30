import { computed, ref } from 'vue'
import { UI_CHARTS } from '@/locales/messages'
import { formatNumber } from '@/locales/state'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BasePieChartProps, PieSegmentView } from '../types/BasePieChart.types'
import { foldSegments, PIE_RADIUS, RADIUS, segmentViews } from './chart/pieGeometry'

export function useBasePieChart(props: BasePieChartProps) {
	const format = (value: number): string => (props.formatValue ?? formatNumber)(value)
	const views = computed(() => segmentViews(foldSegments(props.segments, { max: props.maxSegments ?? 6, other: UI_CHARTS.OTHER })))
	const activeIndex = ref<number | null>(null)
	return {
		...useStandardBaseComponent('base-pie-chart', props, ['root', 'legend']),
		circleRadius: computed(() => (props.variant === 'pie' ? PIE_RADIUS : RADIUS)),
		views,
		activeIndex,
		total: computed(() => format(props.segments.reduce((sum, segment) => sum + segment.value, 0))),
		format,
		percentText: (view: PieSegmentView): string =>
			`${formatNumber(view.percent, { maximumFractionDigits: view.percent < 10 ? 1 : 0 })}%`,
		setActive(index: number | null): void {
			activeIndex.value = index
		},
	}
}
