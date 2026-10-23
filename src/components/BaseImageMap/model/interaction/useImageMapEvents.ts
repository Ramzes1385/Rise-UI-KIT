import { nextTick } from 'vue'
import type { BaseImageMapEmits } from '../../types/BaseImageMap.types'
import type { EventContext } from '../../types/internal/imageMapInternal.types'
import { IMAGE_MAP_OBJECT_ATTR } from '../../types/internal/imageMapModel.types'
import type { ResolvedImageMapObject } from '../../types/internal/imageMapModel.types'

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
	const isSpaceOnLink = event.key === ' ' && (event.target as Element).getAttribute('role') === 'link'
	if ((event.key === 'Enter' || event.key === ' ') && !isSpaceOnLink && !isNativeControl(event.target)) {
		event.preventDefault()
		context.actions.activate(id, event)
	}
}

function handleZoomKey(action: 'zoomIn' | 'zoomOut' | 'resetZoom', focused: Element | null, context: EventContext): void {
	if (focused && action !== 'resetZoom') context.pan.zoomAtElement(action === 'zoomIn', focused)
	else context.zoom[action]()
}

export function useImageMapEvents(emit: BaseImageMapEmits, context: EventContext) {
	const setHover = useHover(emit, context.overlay)

	return {
		handleStageClick(event: MouseEvent): void {
			const id = objectIdOf(event.target)
			if (context.consumeDrag()) return event.preventDefault()
			if (id) context.actions.activate(id, event)
		},
		handleStageAuxClick(event: MouseEvent): void {
			const id = objectIdOf(event.target)
			const isScriptLink = id && context.overlay.findObject(id)?.action === 'link' && !isNativeControl(event.target)
			if (event.button === 1 && isScriptLink) context.actions.activate(id, event)
		},
		handleStagePointerOver(event: PointerEvent): void {
			if (event.pointerType !== 'touch') setHover(objectIdOf(event.target))
		},
		handleStagePointerLeave(): void {
			setHover(null)
		},
		handleStageFocusIn(event: FocusEvent): void {
			const id = objectIdOf(event.target)
			if (!id) return setHover(null)
			context.focus.focusId.value = id
			if (context.pan.revealElement(event.target as Element)) void nextTick(() => setHover(id))
			else setHover(id)
		},
		handleStageFocusOut(event: FocusEvent): void {
			if (!objectIdOf(event.relatedTarget)) setHover(null)
		},
		handleViewportKeydown(event: KeyboardEvent): void {
			const id = objectIdOf(event.target)
			if (id) handleObjectKey(event, id, context)
			if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return
			if (ZOOM_KEYS[event.key]) {
				event.preventDefault()
				handleZoomKey(ZOOM_KEYS[event.key], id ? (event.target as Element) : null, context)
			} else if (event.target === event.currentTarget && context.pan.isPanKey(event.key)) {
				event.preventDefault()
				context.pan.panByKey(event.key)
			}
		},
	}
}
