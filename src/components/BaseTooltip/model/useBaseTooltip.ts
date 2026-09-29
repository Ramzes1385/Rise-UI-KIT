import type { ComputedRef, Ref } from 'vue'
import { getFixedOrigin } from '@utils/dom/domUtils'
import type { TooltipLayout } from '@utils/dom/tooltipUtils'
import type { TooltipProps } from '../types/BaseTooltip.types'
import { useEscapeKey } from '@composables/overlay/useEscapeKey'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { useTriggerAttributes } from '@composables/overlay/useTriggerAttributes'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { useInheritedTheme, useTeleportTarget } from '@composables/app/useTeleportTarget'
import { calcTooltipPosition, calcTooltipShift, resolveTooltipPlacement } from '@utils/dom/tooltipUtils'

const GAP = 8
const SHOW_DELAY_MS = 100
const HIDE_DELAY_MS = 150

function getViewport(): { width: number; height: number } {
	const root = document.documentElement
	return { width: root.clientWidth || window.innerWidth, height: root.clientHeight || window.innerHeight }
}

function useTooltipPosition(props: TooltipProps, wrapperRef: Ref<HTMLElement | null>, popupRef: Ref<HTMLElement | null>) {
	const coords = ref({ top: 0, left: 0, width: 0, height: 0 })
	const origin = ref({ x: 0, y: 0 })
	const popupSize = ref({ width: 0, height: 0 })
	const currentLayout = (): TooltipLayout => ({ coords: coords.value, size: popupSize.value, viewport: getViewport() })
	const placement = computed(() => resolveTooltipPlacement(props.position, currentLayout(), GAP))

	return {
		placement,
		tooltipStyle: computed((): Record<string, string> => {
			const shift = calcTooltipShift(placement.value, currentLayout())
			return {
				...calcTooltipPosition({
					position: placement.value,
					coords: { ...coords.value, top: coords.value.top - origin.value.y, left: coords.value.left - origin.value.x },
					gap: GAP,
					shift,
				}),
				'--tooltip-arrow-offset': `${-shift}px`,
			}
		}),
		updateCoords(): void {
			if (!wrapperRef.value) return
			const { top, left, width, height } = wrapperRef.value.getBoundingClientRect()
			const current = coords.value
			if (current.top !== top || current.left !== left || current.width !== width || current.height !== height) {
				coords.value = { top, left, width, height }
			}
			const { x, y } = getFixedOrigin(popupRef.value?.parentElement)
			if (origin.value.x !== x || origin.value.y !== y) origin.value = { x, y }
		},
		measurePopup(): void {
			const popup = popupRef.value
			if (!popup) return
			const { offsetWidth: width, offsetHeight: height } = popup
			if (popupSize.value.width !== width || popupSize.value.height !== height) popupSize.value = { width, height }
		},
	}
}

function createUpdateLoop(isVisible: Ref<boolean>, onFrame: () => void) {
	let rafId: number | null = null
	const tick = (): void => {
		onFrame()
		if (isVisible.value) {
			rafId = requestAnimationFrame(tick)
		}
	}
	return {
		start(): void {
			rafId = requestAnimationFrame(tick)
		},
		stop(): void {
			if (rafId !== null) {
				cancelAnimationFrame(rafId)
				rafId = null
			}
		},
	}
}

function createDelays(props: TooltipProps, show: () => void, hide: () => void) {
	let showTimer: ReturnType<typeof setTimeout> | null = null
	let hideTimer: ReturnType<typeof setTimeout> | null = null
	return {
		handleEnter(): void {
			if (props.isAlwaysVisible) return
			if (hideTimer) {
				clearTimeout(hideTimer)
				hideTimer = null
			}
			showTimer = setTimeout(show, SHOW_DELAY_MS)
		},
		handleLeave(): void {
			if (props.isAlwaysVisible) return
			if (showTimer) {
				clearTimeout(showTimer)
				showTimer = null
			}
			hideTimer = setTimeout(hide, HIDE_DELAY_MS)
		},
		cancelHide(): void {
			if (hideTimer) clearTimeout(hideTimer)
			hideTimer = null
		},
		clearTimers(): void {
			if (showTimer) clearTimeout(showTimer)
			if (hideTimer) clearTimeout(hideTimer)
			showTimer = null
			hideTimer = null
		},
	}
}

function useTooltipVisibility(props: TooltipProps, isVisible: Ref<boolean>, position: ReturnType<typeof useTooltipPosition>) {
	const loop = createUpdateLoop(isVisible, () => {
		position.updateCoords()
		position.measurePopup()
	})
	const show = (): void => {
		position.updateCoords()
		isVisible.value = true
		loop.start()
	}
	const hide = (): void => {
		isVisible.value = false
		loop.stop()
	}
	const delays = createDelays(props, show, hide)

	useEscapeKey({
		isActive: () => isVisible.value && !props.isAlwaysVisible,
		callback: () => {
			delays.clearTimers()
			hide()
		},
	})
	onMounted(() => {
		if (props.isAlwaysVisible) show()
	})
	watch(
		() => props.isAlwaysVisible,
		isAlways => {
			if (isAlways) show()
			else hide()
		},
	)
	onBeforeUnmount(() => {
		loop.stop()
		delays.clearTimers()
	})

	return { handleEnter: delays.handleEnter, handleLeave: delays.handleLeave, cancelHide: delays.cancelHide }
}

function useDescribedTrigger(wrapperRef: Ref<HTMLElement | null>, isShown: ComputedRef<boolean>, tooltipId: string) {
	const triggerAttributes = computed(() => ({ 'aria-describedby': isShown.value ? tooltipId : undefined }))
	useTriggerAttributes(
		() => wrapperRef.value,
		() => triggerAttributes.value,
	)
	return triggerAttributes
}

function useMeasureOnShow(isShown: ComputedRef<boolean>, measurePopup: () => void): void {
	watch(isShown, async shown => {
		if (!shown) return
		await nextTick()
		measurePopup()
	})
}

export function useBaseTooltip(props: TooltipProps) {
	const teleportTarget = useTeleportTarget()
	const standard = useStandardBaseComponent('base-tooltip-popup', props, ['root', 'tooltip', 'text'])
	const isVisible = ref(false)
	const isShown = computed(() => isVisible.value && Boolean(props.text))
	const wrapperRef = ref<HTMLElement | null>(null)
	const popupRef = ref<HTMLElement | null>(null)
	const inheritedTheme = useInheritedTheme(
		() => wrapperRef.value,
		() => isVisible.value,
	)
	const tooltipId = `rise-tooltip-${useId()}`
	const triggerAttributes = useDescribedTrigger(wrapperRef, isShown, tooltipId)
	const position = useTooltipPosition(props, wrapperRef, popupRef)
	useMeasureOnShow(isShown, position.measurePopup)

	return {
		...standard,
		teleportTarget,
		isShown,
		wrapperRef,
		popupRef,
		inheritedTheme,
		tooltipId,
		triggerAttributes,
		placement: position.placement,
		tooltipStyle: position.tooltipStyle,
		...useTooltipVisibility(props, isVisible, position),
	}
}
