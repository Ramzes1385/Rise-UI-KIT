import { computed, ref } from 'vue'
import { centerOf, pickInDirection } from './spatial'
import { IMAGE_MAP_OBJECT_ATTR } from '../../types/imageMapModel.types'
import type { ImageMapDirection } from '../../types/imageMapModel.types'
import type { MapFocusOptions } from '../../types/imageMapInternal.types'

const ARROWS: Record<string, ImageMapDirection> = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' }

function objectElements(stage: HTMLElement | null): Map<string, Element> {
	const elements = new Map<string, Element>()
	stage?.querySelectorAll(`[${IMAGE_MAP_OBJECT_ATTR}]`).forEach(element => {
		elements.set(element.getAttribute(IMAGE_MAP_OBJECT_ATTR) as string, element)
	})
	return elements
}

export function useImageMapFocus(options: MapFocusOptions) {
	const focusId = ref<string | null>(null)

	const enabledIds = computed((): string[] =>
		(options.getView()?.objects ?? []).filter(item => !item.isDisabled).map(item => item.object.id),
	)

	const tabbableId = computed((): string | undefined => {
		const ids = enabledIds.value
		const preferred = [focusId.value, options.getActive()].find(id => id && ids.includes(id))
		return preferred ?? ids[0]
	})

	function focusObject(id: string | undefined): void {
		if (!id) return
		const element = objectElements(options.stageRef.value).get(id)
		if (!(element instanceof HTMLElement || element instanceof SVGElement)) return
		focusId.value = id
		element.focus({ preventScroll: true })
	}

	function nextId(current: string, key: string): string | undefined {
		const ids = enabledIds.value
		if (key === 'Home') return ids[0]
		if (key === 'End') return ids[ids.length - 1]
		const elements = objectElements(options.stageRef.value)
		const from = elements.get(current)
		if (!from) return undefined
		const candidates = ids.filter(id => elements.has(id)).map(id => centerOf(id, elements.get(id) as Element))
		return pickInDirection(centerOf(current, from), candidates, ARROWS[key])
	}

	return {
		focusId,
		tabbableId,
		focusObject,
		isNavigationKey: (key: string): boolean => key in ARROWS || key === 'Home' || key === 'End',
		moveFocus(current: string, key: string): void {
			focusObject(nextId(current, key))
		},
	}
}
