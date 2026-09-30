import type { Ref } from 'vue'
import { cardElement } from './kanbanDom'
import { UI_KANBAN } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import { computed, nextTick, ref, shallowRef, watch } from 'vue'
import { columnCards, locateCard, moveCard, neighborCard, resolveMove } from './kanbanCards'
import type {
	BaseKanbanEmits,
	BaseKanbanProps,
	KanbanAnnouncement,
	KanbanBoardContext,
	KanbanCard,
	KanbanPlace,
} from '../../types/BaseKanban.types'

function announcementText(props: BaseKanbanProps, message: KanbanAnnouncement, target: { card: KanbanCard; cards: readonly KanbanCard[] }) {
	const place = locateCard(target.cards, target.card.id) as KanbanPlace
	const column = props.columns.find(item => item.id === place.columnId)
	const total = columnCards(target.cards, place.columnId).length
	return formatMessage(UI_KANBAN[message], { card: target.card.title, column: column?.title ?? '', position: place.index + 1, total })
}

function propCopy<T>(source: () => T) {
	const copy = shallowRef(source())
	watch(source, value => {
		copy.value = value
	})
	return copy
}

function useKanbanState(props: BaseKanbanProps) {
	const local = propCopy(() => props.cards ?? [])
	const collapsed = propCopy(() => props.collapsedColumns ?? [])
	const draft = shallowRef<KanbanCard[] | null>(null)
	const visible = computed(() => (props.filter ? local.value.filter(props.filter) : local.value))
	return {
		local,
		collapsed,
		draft,
		cards: computed(() => draft.value ?? visible.value),
		columns: computed(() => props.columns.filter(column => !collapsed.value.includes(column.id))),
	}
}

function useKanbanFeedback(props: BaseKanbanProps, list: () => readonly KanbanCard[]) {
	const announcement = ref('')
	const say = (text: string): void => {
		announcement.value = text
	}
	return {
		announcement,
		say,
		announce(message: KanbanAnnouncement, cardId: string, cards: readonly KanbanCard[] = list()): void {
			const card = cards.find(item => item.id === cardId) as KanbanCard
			say(announcementText(props, message, { card, cards }))
		},
	}
}

export function useKanbanContext(props: BaseKanbanProps, emit: BaseKanbanEmits): KanbanBoardContext & { announcement: Ref<string> } {
	const { local, collapsed, draft, cards, columns } = useKanbanState(props)
	const { announcement, say, announce } = useKanbanFeedback(props, () => cards.value)
	const rootRef = ref<HTMLElement | null>(null)
	const setCards = (next: KanbanCard[]): void => {
		local.value = next
		emit('update:cards', next)
	}
	const finish = (move: { cardId: string; origin: KanbanPlace }, done: () => void): void => {
		const shown = cards.value
		const result = resolveMove(local.value, shown, move)
		const isAllowed = !props.canMove || props.canMove(result.move)
		draft.value = null
		if (result.next && isAllowed) {
			setCards(result.next)
			emit('move', result.move)
		}
		announce(isAllowed ? 'DROPPED' : 'BLOCKED', move.cardId, shown)
		done()
	}
	const cancel = (cardId: string, done: () => void): void => {
		draft.value = null
		announce('CANCELLED', cardId)
		done()
	}
	const moveTo = (cardId: string, place: KanbanPlace): void => {
		const origin = locateCard(cards.value, cardId) as KanbanPlace
		const neighbor = neighborCard(cards.value, cardId)
		draft.value = moveCard(cards.value, cardId, place)
		const target = (): HTMLElement | null => cardElement(rootRef.value, cardId) ?? cardElement(rootRef.value, neighbor?.id ?? '')
		finish({ cardId, origin }, () => nextTick(() => target()?.focus()))
	}
	const full = computed(() => local.value)
	return { props, emit, rootRef, draft, cards, full, columns, collapsed, setCards, say, announce, finish, cancel, moveTo, announcement }
}
