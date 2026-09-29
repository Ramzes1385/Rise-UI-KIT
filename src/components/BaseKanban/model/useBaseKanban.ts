import type { Ref } from 'vue'
import { UI_KANBAN } from '@/locales/messages'
import { cardElement } from './board/kanbanDom'
import { useKanbanFlip } from './drag/useKanbanFlip'
import { useKanbanMenu } from './board/useKanbanMenu'
import { cardSummary, toDay } from './card/kanbanCardMeta'
import { useKanbanPointer } from './drag/useKanbanPointer'
import { useKanbanKeyboard } from './drag/useKanbanKeyboard'
import { formatMessage, getLocale, pluralize } from '@/locales/state'
import { computed, nextTick, ref, shallowRef, useId, watch } from 'vue'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { columnCards, isSamePlace, locateCard, moveCard } from './board/kanbanCards'
import { useInheritedTheme, useTeleportTarget } from '@composables/app/useTeleportTarget'
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
	const rootRef = ref<HTMLElement | null>(null)
	const moveTo = (cardId: string, place: KanbanPlace): void => {
		const origin = locateCard(cards.value, cardId) as KanbanPlace
		draft.value = moveCard(cards.value, cardId, place)
		finish({ cardId, origin }, () => nextTick(() => cardElement(rootRef.value, cardId)?.focus()))
	}
	return { props, emit, rootRef, draft, cards, announce, finish, cancel, moveTo, announcement }
}

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
	const menu = useKanbanMenu(context)
	useKanbanFlip(context)
	return {
		...useStandardBaseComponent('base-kanban', props, ['root', 'column', 'card']),
		...keyboard,
		...pointer,
		menuItems: menu.menuItems,
		handleBoardContextMenu: menu.handleBoardContextMenu,
		handleCardKeydown(event: KeyboardEvent, card: KanbanCard): void {
			menu.rememberMenuCard(event, card)
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
		columnsView: computed(() => props.columns.map(column => columnView(column, context.cards.value))),
		isPlaceholder: (card: KanbanCard): boolean => pointer.drag.value?.card.id === card.id,
		ghostStyle: computed(() => {
			const drag = pointer.drag.value as KanbanPointerDrag
			return { width: `${drag.width}px`, transform: `translate(${drag.x - drag.offsetX}px, ${drag.y - drag.offsetY}px)` }
		}),
	}
}
