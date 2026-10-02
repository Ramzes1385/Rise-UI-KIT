import { ref } from 'vue'
import { formatMessage } from '@/locales/state'
import { findObject } from '../document/editorOps'
import { UI_IMAGE_MAP_EDITOR } from '@/locales/messages'
import { clampPoint, translateObject } from '../geometry/editorGeometry'
import { objectArea } from '@components/BaseImageMap/model/data/shapeGeometry'
import type { ImageMapEditorProps } from '../../types/BaseImageMapEditor.types'
import type { EditorCommands, EditorContext, EditorPoint, EditorToolApi } from '../../types/imageMapEditorInternal.types'

const ARROWS: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }

function isEditable(target: EventTarget | null): boolean {
	const element = target as HTMLElement | null
	return Boolean(element?.closest?.('input:not([type="radio"], [type="checkbox"]), textarea, select, [contenteditable="true"]'))
}

function percent(value: number): number {
	return Math.round(value * 1000) / 10
}

function useHistoryKeys(commands: EditorCommands) {
	return function handleHistoryKey(event: KeyboardEvent): boolean {
		if (!(event.ctrlKey || event.metaKey) || isEditable(event.target)) return false
		const key = event.key.toLowerCase()
		if (key === 'z' && !event.shiftKey) commands.undo()
		else if (key === 'y' || key === 'z') commands.redo()
		else if (key === 'd') commands.duplicate()
		else return false
		event.preventDefault()
		return true
	}
}

function useSelectKeys(ctx: EditorContext, commands: EditorCommands) {
	function moveSelected(delta: EditorPoint): void {
		const selected = ctx.selection.getSelected()
		if (!selected || selected.type === 'svg') return
		ctx.doc.apply(draft => translateObject(findObject(draft, selected.id) as typeof selected, delta), `move:${selected.id}`)
		const area = objectArea(findObject(ctx.doc.getData(), selected.id) as typeof selected)
		if (area) ctx.announcer.announce(formatMessage(UI_IMAGE_MAP_EDITOR.POSITION, { x: percent(area.x), y: percent(area.y) }))
	}
	return function handleSelectKey(event: KeyboardEvent, delta: EditorPoint | undefined): boolean {
		if (delta) moveSelected(delta)
		else if (event.key === 'Delete' || event.key === 'Backspace') commands.deleteSelected()
		else if (event.key === 'Escape' && ctx.selection.getSelected()) ctx.selection.select(null)
		else return false
		return true
	}
}

function useDrawKeys(ctx: EditorContext, tool: EditorToolApi) {
	const cursor = ref<EditorPoint>({ x: 0.5, y: 0.5 })
	const start = tool.keyStart

	function place(event: KeyboardEvent): void {
		const point = cursor.value
		if (tool.tool.value === 'polygon') {
			if (event.shiftKey) tool.polygon.finish()
			else tool.polygon.add(point)
			return
		}
		if (tool.tool.value === 'point' || start.value) {
			tool.finishDraw(start.value ?? point, point)
			start.value = null
			return
		}
		start.value = point
		ctx.announcer.announce(UI_IMAGE_MAP_EDITOR.DRAW_STARTED)
	}

	function escape(): void {
		if (start.value || tool.polygon.points.value.length) {
			tool.cancel()
			ctx.announcer.announce(UI_IMAGE_MAP_EDITOR.DRAW_CANCELLED)
			return
		}
		tool.setTool('select')
	}

	return {
		cursor,
		start,
		handleDrawKey(event: KeyboardEvent, delta: EditorPoint | undefined): boolean {
			if (delta) cursor.value = clampPoint({ x: cursor.value.x + delta.x, y: cursor.value.y + delta.y })
			else if (event.key === 'Enter' || event.key === ' ') place(event)
			else if (event.key === 'Backspace' && tool.tool.value === 'polygon') tool.polygon.removeLast()
			else if (event.key === 'Escape') escape()
			else return false
			return true
		},
	}
}

export function useEditorKeyboard(
	props: ImageMapEditorProps,
	ctx: EditorContext,
	parts: { tool: EditorToolApi; commands: EditorCommands },
) {
	const { tool, commands } = parts
	const handleHistoryKey = useHistoryKeys(commands)
	const handleSelectKey = useSelectKeys(ctx, commands)
	const draw = useDrawKeys(ctx, tool)
	const isCursorVisible = ref(false)

	return {
		cursor: draw.cursor,
		keyStart: draw.start,
		isCursorVisible,
		handleRootKeydown(event: KeyboardEvent): void {
			if (!ctx.isDisabled()) handleHistoryKey(event)
		},
		handleCanvasKeydown(event: KeyboardEvent): void {
			if (ctx.isDisabled() || event.ctrlKey || event.metaKey || event.altKey) return
			const arrow = ARROWS[event.key]
			const step = props.nudgeStep * (event.shiftKey ? 10 : 1)
			const delta = arrow ? { x: arrow[0] * step, y: arrow[1] * step } : undefined
			const isDrawing = tool.tool.value !== 'select'
			const isHandled = isDrawing ? draw.handleDrawKey(event, delta) : handleSelectKey(event, delta)
			if (!isHandled) return
			isCursorVisible.value = isDrawing
			event.preventDefault()
		},
		hideCursor(): void {
			isCursorVisible.value = false
		},
	}
}
