import type { Ref } from 'vue'
import type { useListOrder } from './useListOrder'
import { useSortable } from '@composables/interaction/useSortable'
import type { ListItem, ListProps } from '../../types/BaseList.types'
import { dropIndex, indexOfId, rowElement, stepIndex } from './listOrder'

const FLIP_ITEMS = { selector: '[data-list-id]', key: 'listId' }

export function useListSortable<T extends ListItem>(
	props: ListProps<T>,
	listRef: Ref<HTMLElement | null>,
	deps: { order: ReturnType<typeof useListOrder<T>>; focusItem: (id: string) => void },
) {
	const { order } = deps
	const locate = (id: string): number | null => {
		const index = indexOfId(order.shown.value, id)
		return index < 0 ? null : index
	}
	return useSortable<T, number>({
		rootRef: listRef,
		itemId: item => item.id,
		isDisabled: () => !props.isSortable || Boolean(props.isDisabled),
		locate,
		isSamePlace: (a, b) => a === b,
		stepPlace: (id, key) => stepIndex(order.shown.value, id, key),
		dropPlace: (point, id) => dropIndex(listRef.value, point, { id, index: locate(id) ?? -1 }),
		itemElement: id => rowElement(listRef.value, id),
		onStart: () => {
			order.draft.value = [...order.shown.value]
		},
		onPreview: order.preview,
		onDrop: order.finish,
		onCancel: order.cancel,
		onAnnounce: (message, id) => order.announce(message, id),
		focusItem: deps.focusItem,
		moveKeys: ['ArrowUp', 'ArrowDown', 'Home', 'End'],
		settlingClass: 'base-list__ghost--settling',
		flip: props.isVirtual ? undefined : { source: () => order.shown.value, items: FLIP_ITEMS },
	})
}
