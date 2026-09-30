import { computed, useId } from 'vue'
import { useKanbanFlip } from './drag/useKanbanFlip'
import { useKanbanMenu } from './board/useKanbanMenu'
import { cardSummary, toDay } from './card/kanbanCardMeta'
import { useKanbanPointer } from './drag/useKanbanPointer'
import { useKanbanEditing } from './edit/useKanbanEditing'
import { useKanbanColumns } from './board/useKanbanColumns'
import { useKanbanContext } from './board/useKanbanContext'
import { useKanbanKeyboard } from './drag/useKanbanKeyboard'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { useInheritedTheme, useTeleportTarget } from '@composables/app/useTeleportTarget'
import type { BaseKanbanEmits, BaseKanbanProps, KanbanCard, KanbanPointerDrag } from '../types/BaseKanban.types'

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
	const pointer = useKanbanPointer(context)
	const keyboard = useKanbanKeyboard(context)
	const editing = useKanbanEditing(context)
	const menu = useKanbanMenu(context, editing)
	useKanbanFlip(context)
	return {
		...useStandardBaseComponent('base-kanban', props, ['root', 'column', 'card']),
		...keyboard,
		...pointer,
		...editing,
		...useKanbanColumns(context),
		menuItems: menu.menuItems,
		handleBoardContextMenu: menu.handleBoardContextMenu,
		handleCardKeydown(event: KeyboardEvent, card: KanbanCard): void {
			menu.rememberMenuCard(event, card)
			if (event.key === 'F2' && !keyboard.grabbedId.value) editing.startRename(card)
			keyboard.handleCardKeydown(event, card)
		},
		teleportTarget: useTeleportTarget(),
		inheritedTheme: useInheritedTheme(
			() => context.rootRef.value,
			() => Boolean(pointer.drag.value),
		),
		rootRef: context.rootRef,
		announcement: context.announcement,
		...useKanbanCardText(props, hintId),
		hintId,
		isPlaceholder: (card: KanbanCard): boolean => pointer.drag.value?.card.id === card.id,
		ghostStyle: computed(() => {
			const drag = pointer.drag.value as KanbanPointerDrag
			return { width: `${drag.width}px`, transform: `translate(${drag.x - drag.offsetX}px, ${drag.y - drag.offsetY}px)` }
		}),
	}
}
