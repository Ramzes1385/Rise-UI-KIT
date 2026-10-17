import type { Ref } from 'vue'
import { onBeforeUnmount } from 'vue'
import { resolveArrowKey } from '@utils/dom/directionUtils'
import { getShortcutLetter } from '@utils/dom/keyboardUtils'
import { findTypeaheadIndex } from '@utils/navigation/menuUtils'
import type {
	FileManagerCommands,
	FileManagerCore,
	FileManagerKeyContext,
	FileManagerKeyHandler,
} from '../../types/FileManagerInternal.types'

const TYPEAHEAD_RESET = 500
const MOVE_KEYS = new Set(['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End'])

const KEY_HANDLERS: Record<string, FileManagerKeyHandler> = {
	' ': ({ core, event }) => {
		const id = core.selection.tabbableId.value
		if (id && event.shiftKey) core.selection.selectRange(id)
		else if (id) core.selection.toggle(id)
		return Boolean(id)
	},
	Enter: ({ commands }) => runCommand(commands.open),
	F2: ({ commands }) => runCommand(commands.rename),
	Delete: ({ commands }) => runCommand(commands.remove),
	Backspace: ({ commands }) => runCommand(commands.goUp),
	Escape: ({ core }) => {
		if (!core.selection.selectedIds.value.length) return false
		core.selection.clear()
		return true
	},
}

function runCommand(command: () => void): boolean {
	command()
	return true
}

function isTypingTarget(target: EventTarget | null): boolean {
	return target instanceof HTMLElement && (target.closest('input, textarea, select') !== null || target.isContentEditable)
}

function stepOf(key: string, columns: number, isGrid: boolean): number {
	if (key === 'Home') return -Infinity
	if (key === 'End') return Infinity
	if (key === 'ArrowDown') return isGrid ? columns : 1
	if (key === 'ArrowUp') return isGrid ? -columns : -1
	if (!isGrid) return 0
	return key === 'ArrowRight' ? 1 : -1
}

function targetIndex(current: number, count: number, step: number): number {
	return Math.min(count - 1, Math.max(0, current + step))
}

function currentIndex(core: FileManagerCore): number {
	return Math.max(
		0,
		core.entries.value.findIndex(entry => entry.id === core.selection.tabbableId.value),
	)
}

function moveFocus(core: FileManagerCore, index: number, event: KeyboardEvent): void {
	const id = core.entries.value[index].id
	if (event.shiftKey) core.selection.selectRange(id)
	else if (event.ctrlKey || event.metaKey) core.selection.setActive(id)
	else core.selection.selectOnly(id)
	core.requestFocus(id)
}

export function useFileManagerKeyboard(core: FileManagerCore, commands: FileManagerCommands, listRef: Ref<HTMLElement | null>) {
	let typed = ''
	let timer: ReturnType<typeof setTimeout> | undefined

	function columns(): number {
		const options = Array.from(listRef.value?.querySelectorAll<HTMLElement>('[role="option"]') ?? [])
		const top = options[0]?.offsetTop
		return Math.max(1, options.filter(option => option.offsetTop === top).length)
	}

	function typeahead(event: KeyboardEvent): boolean {
		if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return false
		typed += event.key
		clearTimeout(timer)
		timer = setTimeout(() => (typed = ''), TYPEAHEAD_RESET)
		const names = core.entries.value.map(entry => entry.name)
		const found = findTypeaheadIndex(names, typed, currentIndex(core))
		if (found >= 0) moveFocus(core, found, event)
		return found >= 0
	}

	function dispatch(context: FileManagerKeyContext): boolean {
		const { event } = context
		if (MOVE_KEYS.has(event.key)) {
			const step = stepOf(resolveArrowKey(event), columns(), core.view.get() === 'grid')
			moveFocus(core, targetIndex(currentIndex(core), core.entries.value.length, step), event)
			return true
		}
		if ((event.ctrlKey || event.metaKey) && getShortcutLetter(event) === 'a') return runCommand(core.selection.selectAll)
		return KEY_HANDLERS[event.key]?.(context) ?? typeahead(event)
	}

	onBeforeUnmount(() => clearTimeout(timer))

	return {
		handleListKeydown(event: KeyboardEvent): void {
			if (isTypingTarget(event.target) || !core.entries.value.length || commands.isEditing()) return
			if (dispatch({ core, commands, event })) event.preventDefault()
		},
	}
}
