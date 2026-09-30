import { computed, ref } from 'vue'
import { UI_KANBAN } from '@/locales/messages'
import { columnCards, isSamePlace, locateCard } from './kanbanCards'
import type { DropdownMenuItem } from '@components/BaseDropdownMenu/types/BaseDropdownMenu.types'
import type { KanbanBoardContext, KanbanCard, KanbanMenuEdit, KanbanPlace } from '../../types/BaseKanban.types'

const isMenuKey = (event: KeyboardEvent): boolean => event.key === 'ContextMenu' || (event.key === 'F10' && event.shiftKey)

function moveItem(context: KanbanBoardContext, card: KanbanCard, target: { place: KanbanPlace; label: string }): DropdownMenuItem {
	const from = locateCard(context.cards.value, card.id) as KanbanPlace
	const isAllowed = !context.props.canMove || context.props.canMove({ card, from, to: target.place })
	return {
		label: target.label,
		isDisabled: !isAllowed || isSamePlace(from, target.place),
		onSelect: () => context.moveTo(card.id, target.place),
	}
}

function cardMenu(context: KanbanBoardContext, card: KanbanCard, edit: KanbanMenuEdit): DropdownMenuItem[][] {
	const place = locateCard(context.cards.value, card.id) as KanbanPlace
	const size = columnCards(context.cards.value, place.columnId).length
	const others = context.props.columns.filter(column => column.id !== place.columnId)
	const columnsMenu = others.map(column =>
		moveItem(context, card, {
			place: { columnId: column.id, index: columnCards(context.cards.value, column.id).length },
			label: column.title,
		}),
	)
	const isEditable = Boolean(context.props.isEditable)
	const rename = isEditable ? [{ label: UI_KANBAN.RENAME, onSelect: () => edit.startRename(card) }] : []
	const remove = isEditable ? [{ label: UI_KANBAN.DELETE, isDanger: true, onSelect: () => edit.deleteCard(card) }] : []
	const groups: DropdownMenuItem[][] = [
		[
			{ label: UI_KANBAN.OPEN, onSelect: () => context.emit('open', card) },
			...rename,
			{ label: UI_KANBAN.MOVE_TO, isDisabled: others.length === 0, children: columnsMenu },
		],
		[
			moveItem(context, card, { place: { ...place, index: 0 }, label: UI_KANBAN.MOVE_TOP }),
			moveItem(context, card, { place: { ...place, index: size - 1 }, label: UI_KANBAN.MOVE_BOTTOM }),
		],
		context.props.cardActions?.(card) ?? [],
		remove,
	]
	return groups.filter(group => group.length > 0)
}

export function useKanbanMenu(context: KanbanBoardContext, edit: KanbanMenuEdit) {
	const menuCardId = ref<string | null>(null)
	const menuCard = computed(() => context.cards.value.find(card => card.id === menuCardId.value) ?? null)
	return {
		menuItems: computed(() => (menuCard.value ? cardMenu(context, menuCard.value, edit) : [])),
		handleBoardContextMenu(event: MouseEvent): void {
			const element = (event.target as Element).closest<HTMLElement>('[data-card-id]')
			if (element) menuCardId.value = element.dataset.cardId as string
			else event.stopPropagation()
		},
		rememberMenuCard(event: KeyboardEvent, card: KanbanCard): void {
			if (isMenuKey(event)) menuCardId.value = card.id
		},
	}
}
