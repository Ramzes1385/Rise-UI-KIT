import type { Ref } from 'vue'
import { UI_KANBAN } from '@/locales/messages'
import { useKanbanPointer } from './drag/useKanbanPointer'
import { useKanbanKeyboard } from './drag/useKanbanKeyboard'
import { computed, ref, shallowRef, useId, watch } from 'vue'
import { formatMessage, getLocale, pluralize } from '@/locales/state'
import { columnCards, isSamePlace, locateCard } from './board/kanbanCards'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type {
	BaseKanbanEmits,
	BaseKanbanProps,
	KanbanAnnouncement,
	KanbanBoardContext,
	KanbanCard,
	KanbanColumn,
	KanbanColumnView,
	KanbanPlace,
	KanbanPointerDrag,
} from '../types/BaseKanban.types'

function columnView(column: KanbanColumn, cards: readonly KanbanCard[]): KanbanColumnView {
	const own = columnCards(cards, column.id)
	const hasLimit = column.limit !== undefined
	const isOverLimit = hasLimit && own.length > (column.limit as number)
	const limitText = hasLimit ? formatMessage(isOverLimit ? UI_KANBAN.OVER_LIMIT : UI_KANBAN.LIMIT, { limit: column.limit as number }) : ''
	const label = [column.title, pluralize(getLocale().plural.CARDS, own.length), limitText].filter(Boolean).join(', ')
	return { column, cards: own, isOverLimit, label, count: hasLimit ? `${own.length} / ${column.limit}` : String(own.length) }
}

function announcementText(props: BaseKanbanProps, message: KanbanAnnouncement, target: { card: KanbanCard; cards: readonly KanbanCard[] }) {
	const place = locateCard(target.cards, target.card.id) as KanbanPlace
	const column = props.columns.find(item => item.id === place.columnId)
	const total = columnCards(target.cards, place.columnId).length
	return formatMessage(UI_KANBAN[message], { card: target.card.title, column: column?.title ?? '', position: place.index + 1, total })
}

function useKanbanState(props: BaseKanbanProps) {
	const local = shallowRef<readonly KanbanCard[]>(props.cards ?? [])
	watch(
		() => props.cards,
		cards => {
			local.value = cards ?? []
		},
	)
	const draft = shallowRef<KanbanCard[] | null>(null)
	return { local, draft, cards: computed(() => draft.value ?? local.value) }
}

function useKanbanContext(props: BaseKanbanProps, emit: BaseKanbanEmits): KanbanBoardContext & { announcement: Ref<string> } {
	const { local, draft, cards } = useKanbanState(props)
	const announcement = ref('')
	const announce = (message: KanbanAnnouncement, cardId: string, list: readonly KanbanCard[] = cards.value): void => {
		const card = list.find(item => item.id === cardId) as KanbanCard
		announcement.value = announcementText(props, message, { card, cards: list })
	}
	const finish = (move: { cardId: string; origin: KanbanPlace }, done: () => void): void => {
		const next = cards.value as KanbanCard[]
		const to = locateCard(next, move.cardId) as KanbanPlace
		const card = local.value.find(item => item.id === move.cardId) as KanbanCard
		const isAllowed = !props.canMove || props.canMove({ card, from: move.origin, to })
		draft.value = null
		if (!isSamePlace(move.origin, to) && isAllowed) {
			local.value = next
			emit('update:cards', next)
			emit('move', { card, from: move.origin, to })
		}
		announce(isAllowed ? 'DROPPED' : 'BLOCKED', move.cardId, next)
		done()
	}
	const cancel = (cardId: string, done: () => void): void => {
		draft.value = null
		announce('CANCELLED', cardId)
		done()
	}
	return { props, emit, rootRef: ref<HTMLElement | null>(null), draft, cards, announce, finish, cancel, announcement }
}

export function useBaseKanban(props: BaseKanbanProps, emit: BaseKanbanEmits) {
	const context = useKanbanContext(props, emit)
	const pointer = useKanbanPointer(context)
	return {
		...useStandardBaseComponent('base-kanban', props, ['root', 'column', 'card']),
		...useKanbanKeyboard(context),
		...pointer,
		rootRef: context.rootRef,
		announcement: context.announcement,
		hintId: `rise-kanban-${useId()}-hint`,
		columnsView: computed(() => props.columns.map(column => columnView(column, context.cards.value))),
		isPlaceholder: (card: KanbanCard): boolean => pointer.drag.value?.card.id === card.id,
		ghostStyle: computed(() => {
			const drag = pointer.drag.value as KanbanPointerDrag
			return { width: `${drag.width}px`, transform: `translate(${drag.x - drag.offsetX}px, ${drag.y - drag.offsetY}px)` }
		}),
	}
}
