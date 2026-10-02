import { computed, ref, type Ref } from 'vue'
import { UI_CHARTS } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import { isFiniteValue, type useChartData } from './useChartData'
import { nearestIndex, xPosition, yPosition } from './chart/chartGeometry'
import type { BaseChartProps, ChartMarker, ChartPoint } from '../types/BaseChart.types'

const PAGE_PARTS = 10

function nextIndex(key: string, current: number | null, count: number): number | null | undefined {
	const page = Math.max(1, Math.round(count / PAGE_PARTS))
	const from = current ?? -1
	const moves: Record<string, () => number | null> = {
		ArrowRight: () => Math.min(count - 1, from + 1),
		ArrowLeft: () => Math.max(0, current === null ? count - 1 : from - 1),
		PageDown: () => Math.min(count - 1, Math.max(0, from) + page),
		PageUp: () => Math.max(0, (current ?? count - 1) - page),
		Home: () => 0,
		End: () => count - 1,
		Escape: () => null,
	}
	return moves[key]?.()
}

function useActivePoint(props: BaseChartProps, data: ReturnType<typeof useChartData>, activeIndex: Ref<number | null>) {
	const point = computed<ChartPoint | null>(() => {
		const index = activeIndex.value
		if (index === null || index >= data.count.value || data.isEmpty.value) return null
		return {
			index,
			label: data.formatLabel(props.labels[index]),
			values: data.visibleIndexes.value.map(seriesIndex => {
				const raw = props.series[seriesIndex].values[index]
				const value = isFiniteValue(raw) ? raw : null
				const text = value === null ? UI_CHARTS.NO_VALUE : data.formatValue(value)
				return { name: props.series[seriesIndex].name, color: data.seriesViews.value[seriesIndex].color, value, text }
			}),
		}
	})
	const markers = computed<ChartMarker[]>(() => {
		const index = activeIndex.value
		if (index === null || props.variant === 'bar' || !point.value) return []
		return data.visibleIndexes.value.flatMap(seriesIndex => {
			const span = data.spans.value[seriesIndex][index]
			if (!span) return []
			const x = xPosition(index, data.frame.value)
			return [
				{ key: String(seriesIndex), color: data.seriesViews.value[seriesIndex].color, x, y: yPosition(span[1], data.frame.value) },
			]
		})
	})
	return { point, markers }
}

export function useChartActive(props: BaseChartProps, data: ReturnType<typeof useChartData>) {
	const activeIndex = ref<number | null>(null)
	const announcement = ref('')
	const { point, markers } = useActivePoint(props, data, activeIndex)
	const announce = (): void => {
		if (!point.value) return
		const values = point.value.values.map(value => `${value.name}: ${value.text}`).join(', ')
		announcement.value = formatMessage(UI_CHARTS.CHART_POINT, { label: point.value.label, values })
	}
	return {
		activeIndex,
		announcement,
		point,
		markers,
		guide: computed(() => (point.value ? xPosition(point.value.index, data.frame.value) : null)),
		handlePointerMove(event: PointerEvent): void {
			const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
			if (data.isEmpty.value || !rect.width) return
			activeIndex.value = nearestIndex((event.clientX - rect.left) / rect.width, data.frame.value)
		},
		handlePointerLeave(): void {
			activeIndex.value = null
		},
		handleKeydown(event: KeyboardEvent): void {
			if (data.isEmpty.value) return
			const next = nextIndex(event.key, activeIndex.value, data.count.value)
			if (next === undefined) return
			event.preventDefault()
			activeIndex.value = next
			announce()
		},
	}
}
