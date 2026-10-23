import { UI_CHARTS } from '@/locales/messages'
import { useUi } from '@composables/base/useUi'
import { ref, computed, shallowRef } from 'vue'
import { formatDateText } from '@utils/data/dateFormatUtils'
import { formatMessage, formatNumber, getLocale } from '@/locales/state'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseHeatmapProps, HeatmapCell } from '../types/BaseHeatmap.types'
import { heatmapCells, heatmapMonths, toDay } from './calendar/heatmapCalendar'
import { useScrollableRegion } from '@composables/interaction/useScrollableRegion'

const CELL = 11

const GAP = 2

export function useBaseHeatmap(props: BaseHeatmapProps) {
	const format = (value: number): string => (props.formatValue ?? formatNumber)(value)
	const firstDay = computed(() => props.firstDayOfWeek ?? getLocale().firstDayOfWeek)
	const cells = computed(() =>
		heatmapCells(props.data, {
			end: toDay(props.endDate ?? new Date()),
			weeks: props.weeks ?? 53,
			firstDay: firstDay.value,
		}),
	)
	const dateText = (date: Date): string => formatDateText(date, { day: 'numeric', month: 'long', year: 'numeric' })
	const active = shallowRef<HeatmapCell | null>(null)
	const scrollRef = ref<HTMLElement | null>(null)
	return {
		...useStandardBaseComponent('base-heatmap', props, ['root']),
		ui: useUi(props, 'base-heatmap'),
		scrollRef,
		isScrollable: useScrollableRegion({ elementRef: scrollRef, orientation: 'horizontal' }).isScrollable,
		cells,
		months: computed(() => heatmapMonths(cells.value, getLocale().intl)),
		weekdays: computed(() => {
			const sunday = 7
			return [0, 2, 4].map(index => ({
				index,
				label: formatDateText(new Date(2024, 0, sunday + firstDay.value + index), { weekday: 'short' }),
			}))
		}),
		width: computed(() => (cells.value[cells.value.length - 1].week + 1) * (CELL + GAP)),
		cellSize: CELL,
		step: CELL + GAP,
		mark: computed(() => props.markColor),
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
