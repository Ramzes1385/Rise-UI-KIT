import { IMAGE_MAP_OBJECT_ATTR } from '../../types/imageMapModel.types'
import type { OverlayOptions } from '../../types/imageMapInternal.types'
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, useId } from 'vue'
import type { ImageMapBox, ResolvedImageMapObject } from '../../types/imageMapModel.types'

const HIDE_DELAY = 150

function findElement(stage: HTMLElement | null, id: string): Element | null {
	return stage?.querySelector(`[${IMAGE_MAP_OBJECT_ATTR}="${id}"]`) ?? null
}

function useTooltip(options: OverlayOptions) {
	const hoverId = ref<string | null>(null)
	const tooltip = shallowRef<{ item: ResolvedImageMapObject; box: ImageMapBox } | null>(null)
	let hideTimer: ReturnType<typeof setTimeout> | undefined

	function measure(id: string): ImageMapBox | null {
		const element = findElement(options.stageRef.value, id)
		const root = options.rootRef.value
		if (!element || !root) return null
		const rect = element.getBoundingClientRect()
		const rootRect = root.getBoundingClientRect()
		return { left: rect.left - rootRect.left, top: rect.top - rootRect.top, width: rect.width, height: rect.height }
	}

	function hideTooltip(): void {
		clearTimeout(hideTimer)
		tooltip.value = null
	}

	function showTooltip(id: string): void {
		clearTimeout(hideTimer)
		const item = options.findObject(id)
		if (!options.hasTooltip() || !item || item.object.isTooltipHidden) return hideTooltip()
		const box = measure(id)
		tooltip.value = box ? { item, box } : null
	}

	onBeforeUnmount(() => clearTimeout(hideTimer))

	return {
		hoverId,
		tooltip,
		showTooltip,
		hideTooltip,
		scheduleHide(): void {
			clearTimeout(hideTimer)
			hideTimer = setTimeout(hideTooltip, HIDE_DELAY)
		},
		cancelHide: (): void => clearTimeout(hideTimer),
	}
}

export function useImageMapOverlay(options: OverlayOptions) {
	const tooltip = useTooltip(options)
	const popupId = ref<string | null>(null)
	const isSheet = ref(false)

	return {
		...tooltip,
		findObject: options.findObject,
		popupId,
		isSheet,
		tooltipDomId: `rise-image-map-tooltip-${useId()}`,
		tooltipId: computed(() => (tooltip.tooltip.value ? tooltip.tooltip.value.item.object.id : null)),
		popupItem: computed(() => options.findObject(popupId.value)),
		openPopup(id: string): void {
			tooltip.hideTooltip()
			isSheet.value = typeof window !== 'undefined' && window.innerWidth < options.getSheetBreakpoint()
			popupId.value = id
		},
		closePopup(): void {
			const id = popupId.value
			popupId.value = null
			if (!id) return
			void nextTick(() => {
				const element = findElement(options.stageRef.value, id)
				if (element instanceof HTMLElement || element instanceof SVGElement) element.focus({ preventScroll: true })
			})
		},
	}
}
