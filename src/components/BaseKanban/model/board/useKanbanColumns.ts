import { computed } from 'vue'
import { columnCards } from './kanbanCards'
import { UI_KANBAN } from '@/locales/messages'
import { formatMessage, getLocale, pluralize } from '@/locales/state'
import type { KanbanBoardContext, KanbanColumn, KanbanColumnView } from '../../types/BaseKanban.types'

function countText(column: KanbanColumn, sizes: { shown: number; total: number }): string {
	if (sizes.shown !== sizes.total) return formatMessage(UI_KANBAN.FILTERED, sizes)
	return column.limit === undefined ? String(sizes.total) : `${sizes.total} / ${column.limit}`
}

function columnView(column: KanbanColumn, context: KanbanBoardContext): KanbanColumnView {
	const own = columnCards(context.cards.value, column.id)
	const total = columnCards(context.full.value, column.id).length
	const hasLimit = column.limit !== undefined
	const isOverLimit = hasLimit && total > (column.limit as number)
	const limitText = hasLimit ? formatMessage(isOverLimit ? UI_KANBAN.OVER_LIMIT : UI_KANBAN.LIMIT, { limit: column.limit as number }) : ''
	return {
		column,
		cards: own,
		isOverLimit,
		isCollapsed: context.collapsed.value.includes(column.id),
		label: [column.title, pluralize(getLocale().plural.CARDS, own.length), limitText].filter(Boolean).join(', '),
		count: countText(column, { shown: own.length, total }),
		emptyText: total ? UI_KANBAN.EMPTY_FILTERED : UI_KANBAN.EMPTY,
	}
}

export function useKanbanColumns(context: KanbanBoardContext) {
	return {
		columnsView: computed(() => context.props.columns.map(column => columnView(column, context))),
		collapseLabel: (view: KanbanColumnView): string =>
			formatMessage(view.isCollapsed ? UI_KANBAN.EXPAND : UI_KANBAN.COLLAPSE, { column: view.column.title }),
		toggleColumn(columnId: string): void {
			const ids = context.collapsed.value
			const next = ids.includes(columnId) ? ids.filter(id => id !== columnId) : [...ids, columnId]
			context.collapsed.value = next
			context.emit('update:collapsedColumns', next)
		},
	}
}
