import { computed, ref, useId } from 'vue'
import { useListRows } from './useListRows'
import { UI_LIST } from '@/locales/messages'
import { useListOrder } from './order/useListOrder'
import { useListFocus } from './keyboard/useListFocus'
import { useListSortable } from './order/useListSortable'
import { useListKeyboard } from './keyboard/useListKeyboard'
import { useListSelection } from './selection/useListSelection'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { useInheritedTheme, useTeleportTarget } from '@composables/app/useTeleportTarget'
import type { BaseListEmits, BaseListExpose, ListItem, ListProps, ListRow } from '../types/BaseList.types'

function useListIds<T extends ListItem>(props: ListProps<T>) {
	const id = `rise-list-${useId()}`
	const ids = { label: `${id}-label`, error: `${id}-error`, hint: `${id}-hint` }
	return {
		ids,
		describedBy: computed(() => (props.error ? ids.error : undefined)),
		hint: computed(() => {
			if (!props.isSortable || props.isDisabled) return ''
			return props.selectionMode === 'none' ? UI_LIST.HINT_SORTABLE : UI_LIST.HINT_SORTABLE_SELECT
		}),
	}
}

function useListParts<T extends ListItem>(props: ListProps<T>, emit: BaseListEmits<T>) {
	const listRef = ref<HTMLElement | null>(null)
	const viewportRef = ref<HTMLElement | null>(null)
	const order = useListOrder(props, emit)
	const selection = useListSelection(props, emit, order.shown)
	const scrollToIndex = (index: number): void => rows.scrollToIndex(index)
	const focus = useListFocus(listRef, order.shown, { isSelected: selection.isSelected, scrollToIndex })
	const rows = useListRows(props, viewportRef, { shown: order.shown, activeIndex: () => focus.activeIndex.value })
	const sortable = useListSortable(props, listRef, { order, focusItem: focus.focusItem })
	const keyboard = useListKeyboard(props, { shown: order.shown, emit, focus, selection, sortable, order })
	return { listRef, viewportRef, order, selection, focus, rows, sortable, keyboard }
}

function useListClick<T extends ListItem>(props: ListProps<T>, emit: BaseListEmits<T>, parts: ReturnType<typeof useListParts<T>>) {
	return (event: MouseEvent, item: T): void => {
		if (parts.sortable.consumeClick()) return
		parts.focus.handleItemFocus(item)
		if (props.selectionMode === 'none') {
			if (!props.isDisabled && !item.isDisabled) emit('activate', item)
		} else if (event.shiftKey) parts.selection.selectRange(item)
		else parts.selection.toggle(item)
	}
}

export function useBaseList<T extends ListItem>(props: ListProps<T>, emit: BaseListEmits<T>) {
	const parts = useListParts(props, emit)
	const { order, selection, focus, sortable } = parts
	const isDragging = (item: T): boolean => sortable.grabbedId.value === item.id || sortable.drag.value?.item.id === item.id
	const exposed: BaseListExpose = {
		focusItem: focus.focusItem,
		selectAll: selection.selectAll,
		clearSelection: selection.clearSelection,
		moveItem: order.moveItem,
	}
	return {
		...useStandardBaseComponent('base-list', props, ['root', 'label', 'list', 'item', 'error']),
		...parts.rows,
		...useListIds(props),
		listRef: parts.listRef,
		viewportRef: parts.viewportRef,
		announcement: order.announcement,
		tabbableId: focus.tabbableId,
		handleItemFocus: focus.handleItemFocus,
		handleItemKeydown: parts.keyboard.handleItemKeydown,
		handleItemClick: useListClick(props, emit, parts),
		handlePointerDown: sortable.handlePointerDown,
		drag: sortable.drag,
		ghostRef: sortable.ghostRef,
		ghostStyle: sortable.ghostStyle,
		grabbedId: sortable.grabbedId,
		listSize: computed(() => order.shown.value.length),
		isSelectable: computed(() => props.selectionMode !== 'none'),
		isSelected: selection.isSelected,
		isDragging,
		slotProps: (row: ListRow<T>) => ({
			item: row.item,
			index: row.index,
			isSelected: selection.isSelected(row.item),
			isDragging: isDragging(row.item),
		}),
		teleportTarget: useTeleportTarget(),
		inheritedTheme: useInheritedTheme(
			() => parts.listRef.value,
			() => Boolean(sortable.drag.value),
		),
		exposed,
	}
}
