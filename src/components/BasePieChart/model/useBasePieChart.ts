import { computed, ref } from 'vue'
import { UI_CHARTS } from '@/locales/messages'
import { formatNumber } from '@/locales/state'
import { usePieSegments } from './usePieSegments'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { foldSegments, PIE_RADIUS, RADIUS, segmentViews } from './chart/pieGeometry'
import type { BasePieChartProps, PieSegmentRender, PieSegmentView } from '../types/BasePieChart.types'

export function useBasePieChart(props: BasePieChartProps) {
	const format = (value: number): string => (props.formatValue ?? formatNumber)(value)
	const views = computed(() => segmentViews(foldSegments(props.segments, { max: props.maxSegments ?? 6, other: UI_CHARTS.OTHER })))
	const activeLabel = ref<string | null>(null)
	const activeView = computed(() => views.value.find(view => view.label === activeLabel.value) ?? null)
	return {
		...useStandardBaseComponent('base-pie-chart', props, ['root', 'legend']),
		...usePieSegments(props, views),
		animationClass: computed(() => `base-pie-chart--animation-${props.animation ?? 'sweep'}`),
		circleRadius: computed(() => (props.variant === 'pie' ? PIE_RADIUS : RADIUS)),
		views,
		activeView,
		total: computed(() => format(props.segments.reduce((sum, segment) => sum + segment.value, 0))),
		format,
		percentText: (view: PieSegmentView): string =>
			`${formatNumber(view.percent, { maximumFractionDigits: view.percent < 10 ? 1 : 0 })}%`,
		segmentClass: (segment: PieSegmentRender) => [
			`base-pie-chart__segment--${segment.entry}`,
			{
				'base-pie-chart__segment--leaving': segment.isLeaving,
				'base-pie-chart__segment--dimmed': activeView.value !== null && activeView.value.label !== segment.label,
			},
		],
		segmentStyle: (segment: PieSegmentRender) => ({ '--pie-start': segment.enter.start, '--pie-share': segment.enter.share }),
		setActive(label: string | null): void {
			activeLabel.value = label
		},
	}
}
