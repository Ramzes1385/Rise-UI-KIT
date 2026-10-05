import { ref } from 'vue'
import { findObject } from '../document/editorOps'
import { clampPoint, dragHandle, translateObject } from '../geometry/editorGeometry'
import type { ImageMapObject } from '@components/BaseImageMap/types/imageMapData.types'
import type { EditorContext, EditorDrag, EditorPoint, EditorToolApi } from '../../types/imageMapEditorInternal.types'

export const EDITOR_OBJECT_ATTR = 'data-editor-object'
const EDITOR_HANDLE_ATTR = 'data-editor-handle'

function closestAttr(event: Event, name: string): string | undefined {
	const element = (event.target as Element | null)?.closest?.(`[${name}]`)
	return element?.getAttribute(name) ?? undefined
}

function cloneObject(object: ImageMapObject): ImageMapObject {
	return JSON.parse(JSON.stringify(object)) as ImageMapObject
}

function applyDrag(object: ImageMapObject, drag: EditorDrag): void {
	const origin = drag.origin as ImageMapObject
	Object.assign(object, cloneObject(origin))
	if (drag.kind === 'move') translateObject(object, { x: drag.current.x - drag.start.x, y: drag.current.y - drag.start.y })
	if (drag.kind === 'handle') dragHandle(object, origin, { index: drag.handle ?? 0, point: drag.current })
}

function toPoint(ctx: EditorContext, event: PointerEvent | MouseEvent): EditorPoint {
	const box = ctx.getStage()?.getBoundingClientRect()
	if (!box?.width || !box.height) return { x: 0, y: 0 }
	return clampPoint({ x: (event.clientX - box.left) / box.width, y: (event.clientY - box.top) / box.height })
}

function startSelect(ctx: EditorContext, tool: EditorToolApi, input: { event: PointerEvent; point: EditorPoint }): void {
	const { event, point } = input
	const handle = closestAttr(event, EDITOR_HANDLE_ATTR)
	const selected = ctx.selection.getSelected()
	const base = { start: point, current: point, isChanged: false }
	if (handle !== undefined && selected) {
		tool.drag.value = { ...base, kind: 'handle', objectId: selected.id, handle: Number(handle), origin: cloneObject(selected) }
		return
	}
	const id = closestAttr(event, EDITOR_OBJECT_ATTR) ?? null
	ctx.selection.select(id)
	const object = findObject(ctx.doc.getData(), id)
	if (object && object.type !== 'svg') tool.drag.value = { ...base, kind: 'move', objectId: object.id, origin: cloneObject(object) }
}

export function useEditorPointer(ctx: EditorContext, tool: EditorToolApi) {
	const hover = ref<EditorPoint | null>(null)

	return {
		hover,
		handlePointerDown(event: PointerEvent): void {
			if (ctx.isDisabled() || event.button !== 0) return
			const point = toPoint(ctx, event)
			;(event.currentTarget as Element | null)?.setPointerCapture?.(event.pointerId)
			if (tool.tool.value === 'select') startSelect(ctx, tool, { event, point })
			else if (tool.tool.value === 'polygon') tool.polygon.add(point)
			else tool.drag.value = { kind: 'draw', start: point, current: point, isChanged: false }
			if (tool.drag.value && tool.drag.value.kind !== 'draw') ctx.doc.begin()
			event.preventDefault()
		},
		handlePointerMove(event: PointerEvent): void {
			const point = toPoint(ctx, event)
			hover.value = point
			const drag = tool.drag.value
			if (!drag) return
			tool.drag.value = { ...drag, current: point, isChanged: true }
			const object = findObject(ctx.doc.getData(), drag.objectId)
			if (object) applyDrag(object, tool.drag.value)
		},
		handlePointerUp(): void {
			const drag = tool.drag.value
			tool.drag.value = null
			if (!drag) return
			if (drag.kind === 'draw') tool.finishDraw(drag.start, drag.current)
			else ctx.doc.commit()
		},
		handlePointerCancel(): void {
			const drag = tool.drag.value
			tool.drag.value = null
			if (!drag || drag.kind === 'draw') return
			const object = findObject(ctx.doc.getData(), drag.objectId)
			if (object) Object.assign(object, cloneObject(drag.origin as ImageMapObject))
			ctx.doc.commit()
		},
		handlePointerLeave(): void {
			hover.value = null
		},
		handleDoubleClick(): void {
			if (tool.tool.value === 'polygon') tool.polygon.finish()
		},
	}
}
