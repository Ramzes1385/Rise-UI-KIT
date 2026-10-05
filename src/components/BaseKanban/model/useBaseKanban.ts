import { computed, useId } from 'vue'
import { useKanbanMenu } from './board/useKanbanMenu'
import { cardSummary, toDay } from './card/kanbanCardMeta'
import { useKanbanEditing } from './edit/useKanbanEditing'
import { useKanbanColumns } from './board/useKanbanColumns'
import { useKanbanContext } from './board/useKanbanContext'
import { useKanbanSortable } from './drag/useKanbanSortable'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseKanbanEmits, BaseKanbanProps, KanbanCard } from '../types/BaseKanban.types'
import { useInheritedThemeAttrs, useTeleportTarget } from '@composables/app/useTeleportTarget'

function useKanbanCardText(props: BaseKanbanProps, hintId: string) {
	const today = computed(() => toDay(props.today ?? new Date()))
	const isDoneColumn = (columnId: string): boolean => Boolean(props.columns.find(column => column.id === columnId)?.isDone)
	const summaryId = (card: KanbanCard): string => `${hintId}-${card.id.replace(/\s/g, '_')}`
	return {
		today,
		isDoneColumn,
		summaryId,
		cardDescribedBy: (card: KanbanCard): string => `${summaryId(card)} ${hintId}`,
		cardSummary: (card: KanbanCard): string => cardSummary(card, { today: today.value, isDone: isDoneColumn(card.columnId) }),
	}
}

export function useBaseKanban(props: BaseKanbanProps, emit: BaseKanbanEmits) {
	const context = useKanbanContext(props, emit)
	const hintId = `rise-kanban-${useId()}-hint`
	const sortable = useKanbanSortable(context)
	const editing = useKanbanEditing(context)
	const menu = useKanbanMenu(context, editing)
	return {
		...useStandardBaseComponent('base-kanban', props, ['root', 'column', 'card']),
		...sortable,
		...editing,
		...useKanbanColumns(context),
		menuItems: menu.menuItems,
		handleBoardContextMenu: menu.handleBoardContextMenu,
		handleCardKeydown(event: KeyboardEvent, card: KanbanCard): void {
			menu.rememberMenuCard(event, card)
			if (event.key === 'F2' && !sortable.grabbedId.value) editing.startRename(card)
			sortable.handleCardKeydown(event, card)
		},
		teleportTarget: useTeleportTarget(),
		inheritedTheme: useInheritedThemeAttrs(
			() => context.rootRef.value,
			() => Boolean(sortable.drag.value),
		),
		rootRef: context.rootRef,
		announcement: context.announcement,
		...useKanbanCardText(props, hintId),
		hintId,
	}
}
