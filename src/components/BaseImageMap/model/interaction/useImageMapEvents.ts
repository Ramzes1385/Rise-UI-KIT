import type { EventContext } from '../../types/imageMapInternal.types'
import type { BaseImageMapEmits } from '../../types/BaseImageMap.types'
import { IMAGE_MAP_OBJECT_ATTR } from '../../types/imageMapModel.types'
import type { ResolvedImageMapObject } from '../../types/imageMapModel.types'

const ZOOM_KEYS: Record<string, 'zoomIn' | 'zoomOut' | 'resetZoom'> = { '+': 'zoomIn', '=': 'zoomIn', '-': 'zoomOut', '0': 'resetZoom' }

function objectIdOf(target: EventTarget | null): string | null {
	if (!(target instanceof Element)) return null
	return target.closest(`[${IMAGE_MAP_OBJECT_ATTR}]`)?.getAttribute(IMAGE_MAP_OBJECT_ATTR) ?? null
}

function isNativeControl(target: EventTarget | null): boolean {
	return target instanceof HTMLButtonElement || target instanceof HTMLAnchorElement
}

function useHover(emit: BaseImageMapEmits, overlay: EventContext['overlay']) {
	function setHover(id: string | null): void {
		if (overlay.hoverId.value === id) return
		overlay.hoverId.value = id
		const item: ResolvedImageMapObject | undefined = id ? overlay.findObject(id) : undefined
		emit('hover', item?.object ?? null)
		if (id) overlay.showTooltip(id)
		else overlay.scheduleHide()
	}
	return setHover
}

function handleObjectKey(event: KeyboardEvent, id: string, context: EventContext): void {
	if (context.focus.isNavigationKey(event.key)) {
		event.preventDefault()
		context.focus.moveFocus(id, event.key)
		return
	}
	if ((event.key === 'Enter' || event.key === ' ') && !isNativeControl(event.target)) {
		event.preventDefault()
		context.actions.activate(id, event)
	}
}

export function useImageMapEvents(emit: BaseImageMapEmits, context: EventContext) {
	const setHover = useHover(emit, context.overlay)

	return {
		handleStageClick(event: MouseEvent): void {
			const id = objectIdOf(event.target)
			if (context.consumeDrag()) return event.preventDefault()
			if (id) context.actions.activate(id, event)
		},
		handleStagePointerOver(event: PointerEvent): void {
			if (event.pointerType !== 'touch') setHover(objectIdOf(event.target))
		},
		handleStagePointerLeave(): void {
			setHover(null)
		},
		handleStageFocusIn(event: FocusEvent): void {
			const id = objectIdOf(event.target)
			if (id) context.focus.focusId.value = id
			setHover(id)
		},
		handleStageFocusOut(event: FocusEvent): void {
			if (!objectIdOf(event.relatedTarget)) setHover(null)
		},
		handleViewportKeydown(event: KeyboardEvent): void {
			const id = objectIdOf(event.target)
			if (id) handleObjectKey(event, id, context)
			if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || !ZOOM_KEYS[event.key]) return
			event.preventDefault()
			context.zoom[ZOOM_KEYS[event.key]]()
		},
	}
}
