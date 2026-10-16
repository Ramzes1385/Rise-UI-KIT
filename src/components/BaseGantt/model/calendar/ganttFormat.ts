import { UI_GANTT } from '@/locales/messages'
import { durationDays } from '../edit/ganttEdit'
import type { GanttTaskId } from '../../types/BaseGantt.types'
import { createDateFormat } from '@utils/data/dateFormatUtils'
import type { DateFormatter } from '@utils/data/dateFormatUtils'
import { formatMessage, getLocale, pluralize } from '@/locales/state'
import type { GanttEdit, GanttItem, GanttScaleFormat, GanttScaleUnit, GanttSpan } from '../../types/BaseGanttModel.types'

const SCALE_OPTIONS: Record<GanttScaleUnit, Intl.DateTimeFormatOptions> = {
	day: { day: 'numeric' },
	month: { month: 'short' },
	year: { year: 'numeric' },
	monthYear: { month: 'long', year: 'numeric' },
}

const DEFAULT_DATE_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }

const DEPENDENCY_TEXT = {
	FS: 'DEPENDENCY_FS',
	SS: 'DEPENDENCY_SS',
	FF: 'DEPENDENCY_FF',
	SF: 'DEPENDENCY_SF',
} as const

const dateFormats = new Map<string, DateFormatter>()

export function getDateFormat(intl: string, options: Intl.DateTimeFormatOptions = DEFAULT_DATE_FORMAT): DateFormatter {
	const key = `${intl}|${JSON.stringify(options)}`
	let format = dateFormats.get(key)
	if (!format) {
		format = createDateFormat(intl, options)
		dateFormats.set(key, format)
	}
	return format
}

export function createScaleFormat(intl: string): GanttScaleFormat {
	const formats = Object.fromEntries(
		Object.entries(SCALE_OPTIONS).map(([unit, options]) => [unit, createDateFormat(intl, options)]),
	) as Record<GanttScaleUnit, DateFormatter>
	return (date, unit) => {
		const text = formats[unit].format(date)
		return text.charAt(0).toLocaleUpperCase(intl) + text.slice(1)
	}
}

export function taskLabel(item: GanttItem, span: GanttSpan, format: DateFormatter): string {
	if (item.isMilestone) return formatMessage(UI_GANTT.MILESTONE_LABEL, { name: item.name, date: format.format(span.start) })
	return formatMessage(UI_GANTT.TASK_LABEL, {
		name: item.name,
		start: format.format(span.start),
		end: format.format(span.end),
		progress: Math.round(item.progress),
	})
}

export function dependencyLabel(item: GanttItem, namesById: ReadonlyMap<GanttTaskId, string>): string {
	const parts = item.dependencies.flatMap(({ id, type }) => {
		const name = namesById.get(id)
		return name === undefined ? [] : [formatMessage(UI_GANTT.DEPENDENCY_ITEM, { name, type: UI_GANTT[DEPENDENCY_TEXT[type]] })]
	})
	return parts.length ? formatMessage(UI_GANTT.DEPENDENCIES, { list: parts.join(', ') }) : ''
}

export function editMessage(item: GanttItem, edit: GanttEdit, format: DateFormatter): string {
	const { start, end } = edit.span
	if (item.isMilestone) return formatMessage(UI_GANTT.MILESTONE_MOVED, { name: item.name, date: format.format(start) })
	const dates = { name: item.name, start: format.format(start), end: format.format(end) }
	if (edit.kind === 'move') return formatMessage(UI_GANTT.MOVED, dates)
	return formatMessage(UI_GANTT.RESIZED, { ...dates, duration: pluralize(getLocale().plural.GANTT_DAYS, durationDays(edit.span)) })
}
