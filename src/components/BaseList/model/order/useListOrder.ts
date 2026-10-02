import { UI_LIST } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import { computed, ref, shallowRef, watch } from 'vue'
import { indexOfId, mergeShown, moveToIndex } from './listOrder'
import type { SortableMove } from '@composables/interaction/useSortable'
import type { BaseListEmits, ListAnnouncement, ListItem, ListMove, ListProps } from '../../types/BaseList.types'

function propCopy<T>(source: () => T) {
	const copy = shallowRef(source())
	watch(source, value => {
		copy.value = value
	})
	return copy
}

function useListAnnouncer<T extends ListItem>(shown: () => readonly T[]) {
	const announcement = ref('')
	return {
		announcement,
		announce(message: ListAnnouncement, id: string, items: readonly T[] = shown()): void {
			const index = indexOfId(items, id)
			const title = items[index]?.title ?? ''
			announcement.value = formatMessage(UI_LIST[message], { item: title, position: index + 1, total: items.length })
		},
	}
}

export function useListOrder<T extends ListItem>(props: ListProps<T>, emit: BaseListEmits<T>) {
	const local = propCopy(() => props.items)
	const draft = shallowRef<T[] | null>(null)
	const visible = computed(() => (props.filter ? local.value.filter(props.filter) : local.value))
	const shown = computed(() => draft.value ?? visible.value)
	const { announcement, announce } = useListAnnouncer(() => shown.value)
	const commit = (next: T[], id: string): boolean => {
		const item = next.find(entry => entry.id === id) as T
		const move: ListMove<T> = { item, from: indexOfId(local.value, id), to: indexOfId(next, id) }
		if (move.from === move.to) return true
		if (props.canMove && !props.canMove(move)) return false
		local.value = next
		emit('update:items', next)
		emit('move', move)
		return true
	}
	const finish = (move: SortableMove<number>, done: () => void): void => {
		const current = shown.value
		draft.value = null
		const isSame = indexOfId(current, move.id) === move.origin
		const isAllowed = isSame || commit(mergeShown(local.value, current, move.id), move.id)
		announce(isAllowed ? 'DROPPED' : 'BLOCKED', move.id, current)
		done()
	}
	return {
		shown,
		draft,
		announcement,
		announce,
		finish,
		cancel(id: string, done: () => void): void {
			draft.value = null
			announce('CANCELLED', id)
			done()
		},
		preview(id: string, index: number): void {
			draft.value = moveToIndex(shown.value, id, index)
		},
		moveItem(id: string, index: number): void {
			announce(commit(moveToIndex(local.value, id, index), id) ? 'DROPPED' : 'BLOCKED', id)
		},
	}
}
