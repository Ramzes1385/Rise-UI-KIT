import { dayOffset } from '../calendar/ganttCalendar'
import type { GanttBox, GanttDraft, GanttItem, GanttMetrics, GanttRange, GanttSpan } from '../../types/BaseGanttModel.types'

const MILESTONE_RATIO = 0.5

export function spanOf(item: GanttItem, draft: GanttDraft | null): GanttSpan {
	return draft?.id === item.id ? draft.edit.span : { start: item.start, end: item.end }
}

export function milestoneSize(rowHeight: number): number {
	return rowHeight * MILESTONE_RATIO
}

export function boxOf(entry: { span: GanttSpan; row: number; isMilestone: boolean }, range: GanttRange, metrics: GanttMetrics): GanttBox {
	const { span, row, isMilestone } = entry
	const left = dayOffset(range, span.start) * metrics.dayWidth
	if (isMilestone) {
		const size = milestoneSize(metrics.rowHeight)
		return { x: left + (metrics.dayWidth - size) / 2, width: size, row }
	}
	return { x: left, width: (dayOffset(range, span.end) - dayOffset(range, span.start) + 1) * metrics.dayWidth, row }
}
