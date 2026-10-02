import { indexOfId } from '../order/listOrder'
import type { ListItem, ListKeyboardDeps, ListProps } from '../../types/BaseList.types'

const NAV_TARGETS: Record<string, (index: number, size: number) => number> = {
	ArrowUp: index => Math.max(index - 1, 0),
	ArrowDown: (index, size) => Math.min(index + 1, size - 1),
	Home: () => 0,
	End: (_, size) => size - 1,
}

const MOVE_STEPS: Record<string, number> = { ArrowUp: -1, ArrowDown: 1 }

const isPrintable = (event: KeyboardEvent): boolean =>
	event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey

function useListMoveBy<T extends ListItem>(props: ListProps<T>, deps: ListKeyboardDeps<T>) {
	return (item: T, step: number): void => {
		const origin = indexOfId(deps.shown.value, item.id)
		const target = origin + step
		if (props.isDisabled || target < 0 || target >= deps.shown.value.length) return
		deps.order.preview(item.id, target)
		deps.order.finish({ id: item.id, origin }, () => deps.focus.focusItem(item.id))
	}
}

function useListActions<T extends ListItem>(props: ListProps<T>, deps: ListKeyboardDeps<T>) {
	return {
		space(event: KeyboardEvent, item: T): void {
			if (props.selectionMode === 'none' && props.isSortable) deps.sortable.grab(item)
			else if (event.shiftKey) deps.selection.selectRange(item)
			else deps.selection.toggle(item)
		},
		enter(item: T): void {
			if (props.selectionMode !== 'none') return deps.selection.toggle(item)
			if (!props.isDisabled && !item.isDisabled) deps.emit('activate', item)
		},
		navigate(event: KeyboardEvent, item: T): void {
			const index = indexOfId(deps.shown.value, item.id)
			const target = deps.shown.value[NAV_TARGETS[event.key](index, deps.shown.value.length)]
			deps.focus.focusItem(target.id)
			if (event.shiftKey && props.selectionMode === 'multiple' && target.id !== item.id) deps.selection.toggle(target)
		},
	}
}

export function useListKeyboard<T extends ListItem>(props: ListProps<T>, deps: ListKeyboardDeps<T>) {
	const moveBy = useListMoveBy(props, deps)
	const actions = useListActions(props, deps)
	const handlePlain = (event: KeyboardEvent, item: T): boolean => {
		if (event.key in NAV_TARGETS) actions.navigate(event, item)
		else if (event.key === ' ') actions.space(event, item)
		else if (event.key === 'Enter') actions.enter(item)
		else if (event.key.toLowerCase() === 'a' && (event.ctrlKey || event.metaKey) && props.selectionMode === 'multiple')
			deps.selection.toggleAll()
		else return false
		return true
	}
	return {
		handleItemKeydown(event: KeyboardEvent, item: T): void {
			if (event.isComposing || deps.sortable.handleGrabbedKeydown(event)) return
			if (props.isSortable && event.altKey && event.key in MOVE_STEPS) {
				event.preventDefault()
				return moveBy(item, MOVE_STEPS[event.key])
			}
			if (handlePlain(event, item)) event.preventDefault()
			else if (isPrintable(event)) deps.focus.typeahead(event.key)
		},
	}
}
