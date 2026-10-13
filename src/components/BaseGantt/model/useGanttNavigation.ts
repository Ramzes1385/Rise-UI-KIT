import type { GanttContext, GanttItem, GanttNavigationParts } from '../types/BaseGanttModel.types'

function run(handlers: Record<string, () => void>, key: string): boolean {
	const isKnown = Object.keys(handlers).includes(key)
	if (isKnown) handlers[key]()
	return isKnown
}

function isBar(event: KeyboardEvent): boolean {
	return (event.target as HTMLElement).hasAttribute('data-gantt-bar')
}

function moves(index: number, last: number, focusAt: (target: number) => Promise<void>): Record<string, () => void> {
	return {
		ArrowDown: () => void focusAt(index + 1),
		ArrowUp: () => void focusAt(index - 1),
		Home: () => void focusAt(0),
		End: () => void focusAt(last),
	}
}

function stepRight(parts: GanttNavigationParts, item: GanttItem, index: number): void {
	if (item.hasChildren && parts.collapse.collapsed.value.has(item.id)) parts.collapse.setCollapsed(item.id, false)
	else void parts.focus.focusBar(index)
}

function stepLeft(context: GanttContext, parts: GanttNavigationParts, item: GanttItem): void {
	if (item.hasChildren && !parts.collapse.collapsed.value.has(item.id)) parts.collapse.setCollapsed(item.id, true)
	else {
		const parentIndex = context.rows.value.findIndex(row => row.id === item.parentId)
		if (parentIndex >= 0) void parts.focus.focusRow(parentIndex)
	}
}

export function useGanttNavigation(context: GanttContext, parts: GanttNavigationParts) {
	const { collapse, editing, focus } = parts
	const click = (item: GanttItem, event: KeyboardEvent): void => context.emit('task-click', item.task, event)

	function rowKey(event: KeyboardEvent, item: GanttItem, index: number): boolean {
		const handlers: Record<string, () => void> = {
			...moves(index, focus.lastIndex(), focus.focusRow),
			ArrowRight: () => stepRight(parts, item, index),
			ArrowLeft: () => stepLeft(context, parts, item),
			Enter: () => (item.hasChildren ? collapse.toggle(item.id) : click(item, event)),
		}
		handlers[' '] = handlers.Enter
		return run(handlers, event.key)
	}

	function barKey(event: KeyboardEvent, item: GanttItem, index: number): boolean {
		if (editing.editByKey(event, item)) return true
		const handlers: Record<string, () => void> = {
			...moves(index, focus.lastIndex(), focus.focusBar),
			Escape: () => void focus.focusRow(index),
			ArrowLeft: () => void focus.focusRow(index),
			Enter: () => click(item, event),
		}
		handlers[' '] = handlers.Enter
		return run(handlers, event.key)
	}

	return {
		onKeydown(event: KeyboardEvent, index: number): void {
			if (context.props.isDisabled) return
			const item = context.rows.value[index]
			const isHandled = isBar(event) ? barKey(event, item, index) : rowKey(event, item, index)
			if (isHandled) event.preventDefault()
		},
	}
}
