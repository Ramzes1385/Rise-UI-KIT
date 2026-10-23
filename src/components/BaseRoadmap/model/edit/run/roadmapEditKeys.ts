import type { RoadmapEditorKeysContext } from '../../../types/internal/roadmapEdit.internal.types'

const FIELD_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

function isTyping(target: EventTarget | null): boolean {
	const element = target as HTMLElement | null
	return Boolean(element && (FIELD_TAGS.has(element.tagName) || element.isContentEditable || element.closest('[role="listbox"]')))
}

function historyKey(event: KeyboardEvent, context: RoadmapEditorKeysContext): boolean {
	const key = event.key.toLowerCase()
	if (!(event.ctrlKey || event.metaKey) || !['z', 'y'].includes(key)) return false
	const isRedo = key === 'y' || event.shiftKey
	event.preventDefault()
	if (isRedo) context.edit.redo()
	else context.edit.undo()
	return true
}

function actionKey(event: KeyboardEvent, context: RoadmapEditorKeysContext): void {
	const id = context.inspector.targetId.value
	if (event.key === 'F2') context.focusTitle()
	else if (event.key === 'Escape') context.state.linkFrom.value = null
	else if (id === null) return
	else if (event.key === 'Delete') context.actions.requestRemove(id)
	else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd') void context.actions.duplicate(id)
	else return
	event.preventDefault()
}

function toolKey(event: KeyboardEvent, context: RoadmapEditorKeysContext): boolean {
	if (event.ctrlKey || event.metaKey || event.altKey) return false
	const key = event.key.toLowerCase()
	if (key !== 'v' && key !== 'c') return false
	context.state.setTool(key === 'v' ? 'select' : 'link')
	return true
}

export function handleRoadmapEditKeydown(event: KeyboardEvent, context: RoadmapEditorKeysContext): void {
	if (event.isComposing || isTyping(event.target)) return
	if (!historyKey(event, context) && !toolKey(event, context)) actionKey(event, context)
}
