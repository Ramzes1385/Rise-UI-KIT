import { computed, type Ref } from 'vue'
import { UI_CHARTS } from '@/locales/messages'
import { formatDateText } from '@utils/data/dateFormatUtils'
import { formatMessage, formatNumber } from '@/locales/state'
import { chartDomain, seriesSpans, spanExtent, stackSpans } from './chart/chartScale'
import { areaPath, bandSlot, barRect, linePath, tickIndexes, xPosition, yPosition } from './chart/chartGeometry'
import type {
	BaseChartProps,
	ChartBarView,
	ChartFrame,
	ChartLabel,
	ChartSeriesView,
	ChartSlot,
	ChartSpan,
	ChartTableRow,
	ChartTick,
	ChartLayout,
	ChartView,
} from '../types/BaseChart.types'

const DEFAULT_LABEL_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
const DEFAULT_Y_TICKS = 5
const PALETTE_SIZE = 8
const PERCENT = 100
const OUTSIDE_TOLERANCE = 0.5

export const isFiniteValue = (value: number | null | undefined): value is number => typeof value === 'number' && Number.isFinite(value)

const seriesColor = (color: string | undefined, index: number): string => color ?? `var(--rise-chart-${(index % PALETTE_SIZE) + 1})`

function useChartFormat(props: BaseChartProps) {
	return {
		formatValue: (value: number): string => (props.formatValue ? props.formatValue(value) : formatNumber(value, props.valueFormat)),
		formatLabel(label: ChartLabel | undefined): string {
			if (props.formatLabel && label !== undefined) return props.formatLabel(label)
			if (label instanceof Date) return formatDateText(label, props.labelFormat ?? DEFAULT_LABEL_FORMAT)
			return typeof label === 'number' ? formatNumber(label) : (label ?? '')
		},
	}
}

function chartSpans(props: BaseChartProps, hidden: ReadonlySet<string>): ChartSpan[][] {
	const count = props.labels.length
	if (!props.isStacked) return props.series.map(series => seriesSpans(series.values, count))
	return stackSpans(
		props.series.map(series => series.values),
		count,
		props.series.map(series => hidden.has(series.name)),
	)
}

function useChartLayout(props: BaseChartProps, hidden: Ref<ReadonlySet<string>>) {
	const visibleIndexes = computed(() => props.series.flatMap((series, index) => (hidden.value.has(series.name) ? [] : [index])))
	const slots = computed<ChartSlot[]>(() => {
		const total = props.isStacked ? 1 : visibleIndexes.value.length
		return props.series.map((series, index) => {
			const order = props.isStacked ? 0 : visibleIndexes.value.filter(visible => visible < index).length
			return bandSlot(order, total, hidden.value.has(series.name))
		})
	})
	return { visibleIndexes, slots }
}

export function useChartData(props: BaseChartProps, hiddenNames: Ref<readonly string[]>) {
	const { formatValue, formatLabel } = useChartFormat(props)
	const hidden = computed(() => new Set(hiddenNames.value))
	const count = computed(() => props.labels.length)
	const isEmpty = computed(() => !count.value || !props.series.length)
	const spans = computed(() => chartSpans(props, hidden.value))
	const { visibleIndexes, slots } = useChartLayout(props, hidden)
	const colors = computed(() => props.series.map((series, index) => seriesColor(series.color, index)))
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
	return { formatValue, formatLabel, hidden, count, isEmpty, spans, visibleIndexes, slots, colors, frame }
}

function chartBars(props: BaseChartProps, data: ReturnType<typeof useChartData>, view: ChartView): ChartBarView[] {
	if (props.variant !== 'bar' || data.isEmpty.value) return []
	return props.series.flatMap((series, seriesIndex) =>
		view.spans.value[seriesIndex].flatMap((span, index) =>
			span
				? [
						{
							key: `${seriesIndex}-${index}`,
							color: data.colors.value[seriesIndex],
							isHidden: data.hidden.value.has(series.name),
							isNegative: span[1] < span[0],
							order: index,
							...barRect(span, { ...view.slots.value[seriesIndex], index }, view.frame.value),
						},
					]
				: [],
		),
	)
}

export function useChartShapes(props: BaseChartProps, data: ReturnType<typeof useChartData>, view: ChartView) {
	const seriesViews = computed<ChartSeriesView[]>(() =>
		props.series.map((series, index) => ({
			name: series.name,
			color: data.colors.value[index],
			isHidden: data.hidden.value.has(series.name),
			order: index,
			line: props.variant === 'bar' || data.isEmpty.value ? '' : linePath(view.spans.value[index], view.frame.value),
			area: props.variant === 'area' && !data.isEmpty.value ? areaPath(view.spans.value[index], view.frame.value) : '',
		})),
	)
	return { seriesViews, bars: computed(() => chartBars(props, data, view)) }
}

function axisTicks(data: ReturnType<typeof useChartData>, view: ChartView, height: number): ChartTick[] {
	if (data.isEmpty.value) return []
	return data.frame.value.domain.ticks.map(value => {
		const position = yPosition(value, view.frame.value)
		const shift = ((position - yPosition(value, data.frame.value)) / PERCENT) * height
		return {
			text: data.formatValue(value),
			position,
			shift: Math.abs(shift) < OUTSIDE_TOLERANCE ? 0 : shift,
			isOutside: position < -OUTSIDE_TOLERANCE || position > PERCENT + OUTSIDE_TOLERANCE,
		}
	})
}

export function useChartAxes(props: BaseChartProps, data: ReturnType<typeof useChartData>, layout: ChartLayout) {
	return {
		yTicks: computed<ChartTick[]>(() => axisTicks(data, layout.view, layout.height.value)),
		xTicks: computed<ChartTick[]>(() =>
			tickIndexes(data.count.value, layout.maxXTicks.value).map(index => ({
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
					return isFiniteValue(value) ? data.formatValue(value) : UI_CHARTS.NO_VALUE
				}),
			})),
		),
		summary: computed(() => {
			const values = data.visibleIndexes.value.flatMap(index => props.series[index].values.filter(isFiniteValue))
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
