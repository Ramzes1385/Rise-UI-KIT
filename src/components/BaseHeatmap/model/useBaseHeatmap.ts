import { computed, shallowRef } from 'vue'
import { UI_CHARTS } from '@/locales/messages'
import { formatMessage, formatNumber, getLocale } from '@/locales/state'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseHeatmapProps, HeatmapCell } from '../types/BaseHeatmap.types'
import { heatmapCells, heatmapMonths, toDay } from './calendar/heatmapCalendar'

const CELL = 11

const GAP = 2

export function useBaseHeatmap(props: BaseHeatmapProps) {
	const format = (value: number): string => (props.formatValue ?? formatNumber)(value)
	const cells = computed(() => heatmapCells(props.data, { end: toDay(props.endDate ?? new Date()), weeks: props.weeks ?? 53 }))
	const dateText = (date: Date): string =>
		new Intl.DateTimeFormat(getLocale().intl, { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
	const active = shallowRef<HeatmapCell | null>(null)
	return {
		...useStandardBaseComponent('base-heatmap', props, ['root']),
		cells,
		months: computed(() => heatmapMonths(cells.value, getLocale().intl)),
		weekdays: computed(() => {
			const format = new Intl.DateTimeFormat(getLocale().intl, { weekday: 'short' })
			return [0, 2, 4].map(index => ({ index, label: format.format(new Date(2024, 0, 1 + index)) }))
		}),
		width: computed(() => (cells.value[cells.value.length - 1].week + 1) * (CELL + GAP)),
		cellSize: CELL,
		step: CELL + GAP,
		mark: computed(() => props.markColor ?? 'var(--rise-chart-3)'),
		active,
		tooltip: computed(() => (active.value ? `${format(active.value.value)} · ${dateText(active.value.date)}` : '')),
		summary: computed(() => {
			const peak = cells.value.reduce((best, cell) => (cell.value > best.value ? cell : best), cells.value[0])
			const total = cells.value.reduce((sum, cell) => sum + cell.value, 0)
			return formatMessage(UI_CHARTS.HEATMAP_SUMMARY, {
				label: props.label,
				total: format(total),
				max: format(peak.value),
				date: dateText(peak.date),
			})
		}),
		setActive(cell: HeatmapCell | null): void {
			active.value = cell
		},
	}
}
