import type { GanttTask } from '../../types/BaseGantt.types'
import { addDays, daysBetween } from '@utils/calendar/eventUtils'
import { shiftByUnit, toGanttDate } from '../calendar/ganttCalendar'
import type { GanttDelta, GanttEdit, GanttItem, GanttKeyInput, GanttPointerShift, GanttSpan } from '../../types/BaseGanttModel.types'

export function applyDelta(span: GanttSpan, delta: GanttDelta): GanttSpan {
	const { kind, days, isMilestone } = delta
	if (kind === 'move' || isMilestone) {
		const start = addDays(span.start, days)
		return { start, end: isMilestone ? start : addDays(span.end, days) }
	}
	if (kind === 'resize-start') {
		const start = addDays(span.start, days)
		return { start: start > span.end ? span.end : start, end: span.end }
	}
	const end = addDays(span.end, days)
	return { start: span.start, end: end < span.start ? span.start : end }
}

export function pointerEdit(item: GanttItem, shift: GanttPointerShift): GanttEdit {
	const { kind, deltaPx, dayWidth } = shift
	const days = Math.round(deltaPx / dayWidth)
	return { kind, span: applyDelta({ start: item.start, end: item.end }, { kind, days, isMilestone: item.isMilestone }) }
}

function direction(key: string): number {
	if (key === 'ArrowRight') return 1
	return key === 'ArrowLeft' ? -1 : 0
}

export function keyboardEdit(item: GanttItem, input: GanttKeyInput): GanttEdit | null {
	const { key, isShift, scale } = input
	const sign = direction(key)
	if (!sign) return null
	if (isShift && !item.isMilestone) {
		const end = shiftByUnit(item.end, scale, sign)
		return { kind: 'resize-end', span: { start: item.start, end: end < item.start ? item.start : end } }
	}
	const start = shiftByUnit(item.start, scale, sign)
	return { kind: 'move', span: { start, end: item.isMilestone ? start : shiftByUnit(item.end, scale, sign) } }
}

export function isChanged(item: GanttItem, edit: GanttEdit): boolean {
	return daysBetween(item.start, edit.span.start) !== 0 || daysBetween(item.end, edit.span.end) !== 0
}

export function durationDays(span: GanttSpan): number {
	return daysBetween(span.start, span.end) + 1
}

export function editedTask(item: GanttItem, edit: GanttEdit): GanttTask {
	const task = item.task
	const next: GanttTask = { ...task, start: toGanttDate(task.start, edit.span.start) }
	if (!item.isMilestone) next.end = toGanttDate(task.end ?? task.start, edit.span.end)
	return next
}
