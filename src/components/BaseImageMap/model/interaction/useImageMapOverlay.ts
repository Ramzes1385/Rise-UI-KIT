import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import type { ImageMapBox } from '../../types/imageMapModel.types'
import { IMAGE_MAP_OBJECT_ATTR } from '../../types/imageMapModel.types'
import type { OverlayOptions } from '../../types/imageMapInternal.types'

const HIDE_DELAY = 150

function findElement(stage: HTMLElement | null, id: string): Element | null {
	return stage?.querySelector(`[${IMAGE_MAP_OBJECT_ATTR}="${id}"]`) ?? null
}

function useTooltip(options: OverlayOptions) {
	const hoverId = ref<string | null>(null)
	const tooltipId = ref<string | null>(null)
	const anchorBox = ref<ImageMapBox | null>(null)
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
		tooltipId.value = null
		anchorBox.value = null
	}

	function showTooltip(id: string): void {
		clearTimeout(hideTimer)
		const item = options.findObject(id)
		if (!options.hasTooltip() || !item || item.object.isTooltipHidden) return hideTooltip()
		anchorBox.value = measure(id)
		tooltipId.value = anchorBox.value ? id : null
	}

	onBeforeUnmount(() => clearTimeout(hideTimer))

	return {
		hoverId,
		tooltipId,
		anchorBox,
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
		tooltipItem: computed(() => options.findObject(tooltip.tooltipId.value)),
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
