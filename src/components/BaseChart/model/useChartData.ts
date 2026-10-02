import { computed, type Ref } from 'vue'
import { UI_CHARTS } from '@/locales/messages'
import { formatMessage, formatNumber, getLocale } from '@/locales/state'
import { chartDomain, seriesSpans, spanExtent, stackSpans } from './chart/chartScale'
import { areaPath, barRect, linePath, tickIndexes, xPosition, yPosition } from './chart/chartGeometry'
import type {
	BaseChartProps,
	ChartBarView,
	ChartFrame,
	ChartLabel,
	ChartSeriesView,
	ChartSpan,
	ChartTableRow,
	ChartTick,
} from '../types/BaseChart.types'

const DEFAULT_LABEL_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
const DEFAULT_Y_TICKS = 5
const PALETTE_SIZE = 8

const seriesColor = (color: string | undefined, index: number): string => color ?? `var(--rise-chart-${(index % PALETTE_SIZE) + 1})`

function useChartFormat(props: BaseChartProps) {
	return {
		formatValue: (value: number): string => (props.formatValue ? props.formatValue(value) : formatNumber(value, props.valueFormat)),
		formatLabel(label: ChartLabel | undefined): string {
			if (props.formatLabel && label !== undefined) return props.formatLabel(label)
			if (label instanceof Date)
				return new Intl.DateTimeFormat(getLocale().intl, props.labelFormat ?? DEFAULT_LABEL_FORMAT).format(label)
			return typeof label === 'number' ? formatNumber(label) : (label ?? '')
		},
	}
}

function chartSpans(props: BaseChartProps, hidden: ReadonlySet<string>): ChartSpan[][] {
	const count = props.labels.length
	if (!props.isStacked) return props.series.map(series => seriesSpans(series.values, count))
	const visible = props.series.filter(series => !hidden.has(series.name))
	const stacked = stackSpans(
		visible.map(series => series.values),
		count,
	)
	return props.series.map(series => (hidden.has(series.name) ? seriesSpans(series.values, count) : stacked[visible.indexOf(series)]))
}

export function useChartData(props: BaseChartProps, hiddenNames: Ref<readonly string[]>) {
	const { formatValue, formatLabel } = useChartFormat(props)
	const hidden = computed(() => new Set(hiddenNames.value))
	const count = computed(() => props.labels.length)
	const isEmpty = computed(() => !count.value || !props.series.length)
	const spans = computed(() => chartSpans(props, hidden.value))
	const visibleIndexes = computed(() => props.series.flatMap((series, index) => (hidden.value.has(series.name) ? [] : [index])))
	const frame = computed<ChartFrame>(() => ({
		count: count.value,
		isBand: props.variant === 'bar',
		domain: chartDomain(
			spanExtent(
				visibleIndexes.value.map(index => spans.value[index]),
				props.variant !== 'line',
			),
			props.yTickCount ?? DEFAULT_Y_TICKS,
		),
	}))
	const seriesViews = computed<ChartSeriesView[]>(() =>
		props.series.map((series, index) => ({
			name: series.name,
			color: seriesColor(series.color, index),
			isHidden: hidden.value.has(series.name),
			line: props.variant === 'bar' || isEmpty.value ? '' : linePath(spans.value[index], frame.value),
			area: props.variant === 'area' && !isEmpty.value ? areaPath(spans.value[index], frame.value) : '',
		})),
	)
	const bars = computed<ChartBarView[]>(() => {
		if (props.variant !== 'bar' || isEmpty.value) return []
		const total = props.isStacked ? 1 : visibleIndexes.value.length
		return visibleIndexes.value.flatMap((seriesIndex, order) =>
			spans.value[seriesIndex].flatMap((span, index) =>
				span
					? [
							{
								key: `${seriesIndex}-${index}`,
								color: seriesViews.value[seriesIndex].color,
								...barRect(span, { index, order: props.isStacked ? 0 : order, total }, frame.value),
							},
						]
					: [],
			),
		)
	})
	return { formatValue, formatLabel, hidden, count, isEmpty, spans, visibleIndexes, frame, seriesViews, bars }
}

export function useChartAxes(props: BaseChartProps, data: ReturnType<typeof useChartData>, maxXTicks: Ref<number>) {
	return {
		yTicks: computed<ChartTick[]>(() =>
			data.isEmpty.value
				? []
				: data.frame.value.domain.ticks.map(value => ({
						text: data.formatValue(value),
						position: yPosition(value, data.frame.value),
					})),
		),
		xTicks: computed<ChartTick[]>(() =>
			tickIndexes(data.count.value, maxXTicks.value).map(index => ({
				text: data.formatLabel(props.labels[index]),
				position: xPosition(index, data.frame.value),
			})),
		),
		tableRows: computed<ChartTableRow[]>(() =>
			props.labels.map((label, index) => ({
				key: String(index),
				label: data.formatLabel(label),
				cells: props.series.map(series => {
					const value = series.values[index]
					return typeof value === 'number' ? data.formatValue(value) : UI_CHARTS.NO_VALUE
				}),
			})),
		),
		summary: computed(() => {
			const values = data.visibleIndexes.value.flatMap(index =>
				props.series[index].values.filter((value): value is number => typeof value === 'number'),
			)
			if (data.isEmpty.value || !values.length) return props.label
			return formatMessage(UI_CHARTS.CHART_SUMMARY, {
				label: props.label,
				series: data.visibleIndexes.value.map(index => props.series[index].name).join(', '),
				min: data.formatValue(Math.min(...values)),
				max: data.formatValue(Math.max(...values)),
			})
		}),
	}
}
