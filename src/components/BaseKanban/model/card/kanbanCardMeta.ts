import { UI_KANBAN } from '@/locales/messages'
import { formatDateText } from '@utils/data/dateFormatUtils'
import { formatMessage, getLocale, pluralize } from '@/locales/state'
import type { KanbanCard, KanbanCardMeta, KanbanDueStatus, KanbanPriority } from '../../types/BaseKanban.types'

const DAY = 24 * 60 * 60 * 1000

const PRIORITY_KEYS = {
	lowest: { key: 'PRIORITY_LOWEST', icon: 'chevron-down', count: 2 },
	low: { key: 'PRIORITY_LOW', icon: 'chevron-down', count: 1 },
	medium: { key: 'PRIORITY_MEDIUM', icon: 'minus', count: 1 },
	high: { key: 'PRIORITY_HIGH', icon: 'chevron-up', count: 1 },
	highest: { key: 'PRIORITY_HIGHEST', icon: 'chevron-up', count: 2 },
} as const

export function toDay(value: string | Date): Date {
	if (value instanceof Date) return new Date(value.getFullYear(), value.getMonth(), value.getDate())
	const [year, month, day] = value.slice(0, 10).split('-').map(Number)
	return new Date(year, month - 1, day)
}

function dueStatus(due: Date, today: Date, isDone: boolean): KanbanDueStatus {
	if (isDone) return 'done'
	const days = Math.round((due.getTime() - today.getTime()) / DAY)
	if (days < 0) return 'overdue'
	if (days === 0) return 'today'
	return days === 1 ? 'tomorrow' : 'later'
}

const formatDay = (date: Date, month: 'short' | 'long'): string => formatDateText(date, { day: 'numeric', month })

function dueText(status: KanbanDueStatus, date: Date): string {
	if (status === 'today') return UI_KANBAN.TODAY
	return status === 'tomorrow' ? UI_KANBAN.TOMORROW : formatDay(date, 'short')
}

function dueDescription(status: KanbanDueStatus, date: Date): string {
	if (status === 'today') return UI_KANBAN.DUE_TODAY
	if (status === 'tomorrow') return UI_KANBAN.DUE_TOMORROW
	return formatMessage(status === 'overdue' ? UI_KANBAN.DUE_OVERDUE : UI_KANBAN.DUE, { date: formatDay(date, 'long') })
}

const priorityLabel = (level: KanbanPriority): string => UI_KANBAN[PRIORITY_KEYS[level].key]

function cardLabels(card: KanbanCard): KanbanCardMeta['labels'] {
	const tags = (card.tags ?? []).map(text => ({ text, color: 'neutral' as const }))
	return [...(card.labels ?? []).map(label => ({ text: label.text, color: label.color ?? 'neutral' })), ...tags]
}

export function cardMeta(card: KanbanCard, context: { today: Date; isDone: boolean }): KanbanCardMeta {
	const due = card.dueDate ? toDay(card.dueDate) : null
	const status = due ? dueStatus(due, context.today, context.isDone) : null
	const priority = card.priority ? { level: card.priority, label: priorityLabel(card.priority), ...PRIORITY_KEYS[card.priority] } : null
	const counters = [card.key, card.subtasks, card.comments, card.attachments, card.estimate, card.assignees?.length]
	return {
		labels: cardLabels(card),
		due: due && status ? { text: dueText(status, due), status } : null,
		priority: priority && { level: priority.level, label: priority.label, icon: priority.icon, count: priority.count },
		hasFooter: Boolean(due || priority || counters.some(Boolean)),
	}
}

function statusParts(card: KanbanCard, context: { today: Date; isDone: boolean }): (string | undefined)[] {
	const due = card.dueDate ? toDay(card.dueDate) : null
	const labels = cardLabels(card).map(label => label.text)
	return [
		card.key,
		labels.length ? formatMessage(UI_KANBAN.LABELS, { labels: labels.join(', ') }) : '',
		card.priority ? formatMessage(UI_KANBAN.PRIORITY, { level: priorityLabel(card.priority) }) : '',
		due ? dueDescription(dueStatus(due, context.today, context.isDone), due) : '',
	]
}

function countParts(card: KanbanCard): (string | undefined)[] {
	const plural = getLocale().plural
	return [
		card.subtasks ? formatMessage(UI_KANBAN.SUBTASKS, { ...card.subtasks }) : '',
		card.comments ? pluralize(plural.COMMENTS, card.comments) : '',
		card.attachments ? pluralize(plural.ATTACHMENTS, card.attachments) : '',
		card.estimate !== undefined ? formatMessage(UI_KANBAN.ESTIMATE, { value: card.estimate }) : '',
		card.assignees?.length ? formatMessage(UI_KANBAN.ASSIGNEES, { names: card.assignees.map(item => item.name).join(', ') }) : '',
		card.description,
	]
}

export const cardSummary = (card: KanbanCard, context: { today: Date; isDone: boolean }): string =>
	[...statusParts(card, context), ...countParts(card)].filter(Boolean).join('. ')
