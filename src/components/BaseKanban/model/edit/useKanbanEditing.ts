import { nextTick, ref } from 'vue'
import { UI_KANBAN } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import { cardElement, columnPart } from '../board/kanbanDom'
import { appendCard, neighborCard } from '../board/kanbanCards'
import type { KanbanBoardContext, KanbanCard, KanbanColumn } from '../../types/BaseKanban.types'

const cleanTitle = (title: string): string => title.replace(/\s+/g, ' ').trim()

const canEdit = (context: KanbanBoardContext): boolean => Boolean(context.props.isEditable && !context.props.isDisabled)

function focusLater(find: () => HTMLElement | null): void {
	nextTick(() => find()?.focus())
}

function useKanbanRename(context: KanbanBoardContext) {
	const renamingId = ref<string | null>(null)
	const close = (card: KanbanCard, shouldFocus: boolean): void => {
		renamingId.value = null
		if (shouldFocus) focusLater(() => cardElement(context.rootRef.value, card.id))
	}
	return {
		renamingId,
		startRename(card: KanbanCard): void {
			if (canEdit(context)) renamingId.value = card.id
		},
		saveRename(card: KanbanCard, title: string, shouldFocus = true): void {
			const text = cleanTitle(title)
			if (text && text !== card.title) {
				const renamed = { ...card, title: text }
				const next = context.full.value.map(item => (item.id === card.id ? renamed : item))
				context.setCards(next)
				context.emit('rename', renamed)
				context.announce('RENAMED', card.id, next)
			}
			close(card, shouldFocus)
		},
		cancelRename: (card: KanbanCard): void => close(card, true),
	}
}

function useCardId(context: KanbanBoardContext): () => string {
	let counter = 0
	return () => {
		counter += 1
		return context.props.createCardId?.() ?? `card-${Date.now().toString(36)}-${counter}`
	}
}

function useKanbanComposer(context: KanbanBoardContext) {
	const addingColumnId = ref<string | null>(null)
	const createId = useCardId(context)
	return {
		addingColumnId,
		composerLabel: (column: KanbanColumn): string => formatMessage(UI_KANBAN.NEW_CARD, { column: column.title }),
		startAdd(columnId: string): void {
			if (canEdit(context)) addingColumnId.value = columnId
		},
		addCard(columnId: string, title: string): void {
			const text = cleanTitle(title)
			if (!text) return
			const card = { id: createId(), columnId, title: text }
			const next = appendCard(context.full.value, card)
			context.setCards(next)
			context.emit('create', card)
			context.announce('CREATED', card.id, next)
		},
		closeAdd(): void {
			const columnId = addingColumnId.value as string
			addingColumnId.value = null
			focusLater(() => columnPart(context.rootRef.value, columnId, '.base-kanban__add'))
		},
		leaveAdd(title: string): void {
			if (!cleanTitle(title)) addingColumnId.value = null
		},
	}
}

function deleteCard(context: KanbanBoardContext, card: KanbanCard): void {
	const neighbor = neighborCard(context.cards.value, card.id)
	context.setCards(context.full.value.filter(item => item.id !== card.id))
	context.emit('delete', card)
	context.say(formatMessage(UI_KANBAN.DELETED, { card: card.title }))
	focusLater(() =>
		neighbor ? cardElement(context.rootRef.value, neighbor.id) : columnPart(context.rootRef.value, card.columnId, '.base-kanban__add'),
	)
}

export function useKanbanEditing(context: KanbanBoardContext) {
	return {
		...useKanbanRename(context),
		...useKanbanComposer(context),
		deleteCard: (card: KanbanCard): void => deleteCard(context, card),
	}
}
