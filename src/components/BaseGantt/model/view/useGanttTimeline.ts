import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import { getLocale } from '@/locales/state'
import { startOfDay } from '@utils/calendar/eventUtils'
import { createScaleFormat } from '../calendar/ganttFormat'
import type { GanttProps } from '../../types/BaseGantt.types'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import { dayOffset, DEFAULT_COLUMN_WIDTH, computeRange, parseGanttDate, pxPerDay, scaleCells } from '../calendar/ganttCalendar'
import type { GanttContext, GanttHeaderCell, GanttItem, GanttMetrics, GanttRange, GanttScaleCell } from '../../types/BaseGanttModel.types'

const HEADER_HEIGHT = 48

export function useGanttMetrics(props: GanttProps): ComputedRef<GanttMetrics> {
	return computed((): GanttMetrics => {
		const factor = (props.sizeScale ?? SIZE_SCALE_DEFAULT) / SIZE_SCALE_DEFAULT
		const columnWidth = props.columnWidth ?? DEFAULT_COLUMN_WIDTH[props.scale]
		return {
			scale: props.scale,
			rowHeight: props.rowHeight * factor,
			listWidth: props.listWidth * factor,
			headerHeight: HEADER_HEIGHT * factor,
			dayWidth: pxPerDay(props.scale, columnWidth * factor),
			firstDay: getLocale().firstDayOfWeek,
		}
	})
}

export function useGanttRange(props: GanttProps, items: ComputedRef<GanttItem[]>, metrics: ComputedRef<GanttMetrics>) {
	const today = computed((): Date => parseGanttDate(props.today) ?? startOfDay(new Date()))
	const range = computed((): GanttRange => computeRange(items.value, today.value, metrics.value))
	return { today, range }
}

function toPixels(cells: GanttScaleCell[], dayWidth: number): GanttHeaderCell[] {
	return cells.map(cell => ({ key: cell.key, label: cell.label, left: cell.offset * dayWidth, width: cell.span * dayWidth }))
}

export function useGanttTimeline(context: GanttContext, today: ComputedRef<Date>) {
	const cells = computed(() => scaleCells(context.range.value, context.metrics.value, createScaleFormat(getLocale().intl)))
	const chartWidth = computed((): number => context.range.value.days * context.metrics.value.dayWidth)
	const bodyHeight = computed((): number => context.rows.value.length * context.metrics.value.rowHeight)
	const todayDay = computed((): number => dayOffset(context.range.value, today.value))
	return {
		headerTop: computed(() => toPixels(cells.value.top, context.metrics.value.dayWidth)),
		headerBottom: computed(() => toPixels(cells.value.bottom, context.metrics.value.dayWidth)),
		chartWidth,
		bodyHeight,
		isTodayShown: computed(
			(): boolean => context.props.isTodayVisible && todayDay.value >= 0 && todayDay.value < context.range.value.days,
		),
		todayLeft: computed((): number => (todayDay.value + 0.5) * context.metrics.value.dayWidth),
		gridPath: computed((): string =>
			toPixels(cells.value.bottom, context.metrics.value.dayWidth)
				.slice(1)
				.map(cell => `M${cell.left} 0V${bodyHeight.value}`)
				.join(''),
		),
	}
}
