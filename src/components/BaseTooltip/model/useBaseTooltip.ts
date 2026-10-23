import type { ComputedRef, Ref } from 'vue'
import { useUi } from '@composables/base/useUi'
import type { UiClassFn } from '@composables/base/useUi'
import type { TooltipLayout } from '@utils/dom/tooltipUtils'
import { useEscapeKey } from '@composables/overlay/useEscapeKey'
import type { FixedBounds, FixedOrigin } from '@utils/dom/domUtils'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseTooltipPart, TooltipProps } from '../types/BaseTooltip.types'
import { useTriggerAttributes } from '@composables/overlay/useTriggerAttributes'
import { useInheritedThemeAttrs, useTeleportTarget } from '@composables/app/useTeleportTarget'
import { computed, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, useId, watch } from 'vue'
import { getAccessibleName, getBoundsRect, getFixedOrigin, toFixedSpace } from '@utils/dom/domUtils'
import { calcTooltipPosition, calcTooltipShift, resolveTooltipPlacement } from '@utils/dom/tooltipUtils'

const GAP = 8
const SHOW_DELAY_MS = 100
const HIDE_DELAY_MS = 150

function getViewport(): { width: number; height: number } {
	const root = document.documentElement
	return { width: root.clientWidth || window.innerWidth, height: root.clientHeight || window.innerHeight }
}

function visibleBounds(bounds: FixedBounds | null): { x: number; y: number; width: number; height: number } {
	const { width: windowWidth, height: windowHeight } = getViewport()
	const left = Math.max(0, bounds?.x ?? 0)
	const top = Math.max(0, bounds?.y ?? 0)
	const right = Math.min(windowWidth, bounds ? bounds.x + bounds.width : windowWidth)
	const bottom = Math.min(windowHeight, bounds ? bounds.y + bounds.height : windowHeight)
	return { x: left, y: top, width: right - left, height: bottom - top }
}

function syncFixedFrame(container: Element | null | undefined, frame: { origin: Ref<FixedOrigin>; bounds: Ref<FixedBounds | null> }): void {
	const next = getFixedOrigin(container)
	const { x, y, scaleX, scaleY } = frame.origin.value
	if (next.x !== x || next.y !== y || next.scaleX !== scaleX || next.scaleY !== scaleY) frame.origin.value = next
	const clip = getBoundsRect(container)
	if (JSON.stringify(clip) !== JSON.stringify(frame.bounds.value)) frame.bounds.value = clip
}

function localCoords(
	coords: { top: number; left: number; width: number; height: number },
	origin: FixedOrigin,
): { top: number; left: number; width: number; height: number } {
	const { x: left, y: top } = toFixedSpace(origin, coords.left, coords.top)
	return { top, left, width: coords.width / origin.scaleX, height: coords.height / origin.scaleY }
}

function useTooltipPosition(props: TooltipProps, wrapperRef: Ref<HTMLElement | null>, popupRef: Ref<HTMLElement | null>) {
	const coords = ref({ top: 0, left: 0, width: 0, height: 0 })
	const origin = ref<FixedOrigin>({ x: 0, y: 0, scaleX: 1, scaleY: 1 })
	const popupSize = ref({ width: 0, height: 0 })
	const bounds = ref<FixedBounds | null>(null)
	const currentLayout = (): TooltipLayout => {
		const { x, y, ...viewport } = visibleBounds(bounds.value)
		const { scaleX, scaleY } = origin.value
		const size = { width: popupSize.value.width * scaleX, height: popupSize.value.height * scaleY }
		return { coords: { ...coords.value, top: coords.value.top - y, left: coords.value.left - x }, size, viewport }
	}
	const placement = computed(() => resolveTooltipPlacement(props.position, currentLayout(), GAP))

	return {
		placement,
		tooltipStyle: computed((): Record<string, string> => {
			const shift = calcTooltipShift(placement.value, currentLayout())
			return {
				...calcTooltipPosition({
					position: placement.value,
					coords: localCoords(coords.value, origin.value),
					gap: GAP,
					shift,
				}),
				'--tooltip-arrow-offset': `${-shift}px`,
			}
		}),
		updateCoords(): void {
			const current = coords.value
			const { top, left, width, height } = wrapperRef.value?.getBoundingClientRect() ?? current
			if (current.top !== top || current.left !== left || current.width !== width || current.height !== height) {
				coords.value = { top, left, width, height }
			}
			syncFixedFrame(popupRef.value?.parentElement, { origin, bounds })
		},
		measurePopup(): void {
			const popup = popupRef.value
			if (!popup) return
			const { offsetWidth: width, offsetHeight: height } = popup
			if (popupSize.value.width !== width || popupSize.value.height !== height) popupSize.value = { width, height }
		},
	}
}

function hasAnimationFrame(): boolean {
	return typeof requestAnimationFrame === 'function' && typeof cancelAnimationFrame === 'function'
}

function createUpdateLoop(isVisible: Ref<boolean>, onFrame: () => void) {
	let rafId: number | null = null
	const tick = (): void => {
		onFrame()
		if (isVisible.value && hasAnimationFrame()) {
			rafId = requestAnimationFrame(tick)
		}
	}
	return {
		start(): void {
			if (hasAnimationFrame()) rafId = requestAnimationFrame(tick)
		},
		stop(): void {
			if (rafId !== null && hasAnimationFrame()) cancelAnimationFrame(rafId)
			rafId = null
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

function nameCoversText(name: string, text: string): boolean {
	if (name === text) return true
	const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
	const edge = String.raw`[^\p{L}\p{N}]`
	return new RegExp(`(^|${edge})${escaped}($|${edge})`, 'iu').test(name)
}

function getLinkedDescriptions(trigger: HTMLElement | null, ownId: string): string[] {
	if (!trigger) return []
	const ids = (trigger.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(id => id && id !== ownId)
	return ids.map(id => trigger.ownerDocument.getElementById(id)?.textContent?.trim() ?? '').filter(Boolean)
}

function isCoveredByLinked(trigger: HTMLElement | null, text: string, ownId: string): boolean {
	if (!text) return false
	return getLinkedDescriptions(trigger, ownId).some(description => nameCoversText(description, text))
}

function useDescribedTrigger(
	props: TooltipProps,
	wrapperRef: Ref<HTMLElement | null>,
	shown: { isShown: ComputedRef<boolean>; tooltipId: string },
) {
	const { isShown, tooltipId } = shown
	function getCurrentTrigger(): HTMLElement | null {
		return props.isWrapperless ? wrapperRef.value : getTrigger()
	}
	const isLinkedCovered = ref(false)
	const refreshLinked = (): void => {
		isLinkedCovered.value = isCoveredByLinked(getCurrentTrigger(), props.text.trim(), tooltipId)
	}
	const triggerAttributes = computed(() => {
		if (!isShown.value) return { 'aria-describedby': undefined }
		const text = props.text.trim()
		const isNamed = text && nameCoversText(getAccessibleName(getCurrentTrigger()), text)
		return { 'aria-describedby': isNamed || isLinkedCovered.value ? undefined : tooltipId }
	})
	const { getTrigger } = useTriggerAttributes(
		() => (props.isWrapperless ? null : wrapperRef.value),
		() => triggerAttributes.value,
	)
	watch(isShown, refreshLinked)
	onUpdated(refreshLinked)
	return triggerAttributes
}

function useMeasureOnShow(isShown: ComputedRef<boolean>, measurePopup: () => void): void {
	watch(isShown, async shown => {
		if (!shown) return
		await nextTick()
		measurePopup()
	})
}

function useTooltipUi(props: TooltipProps): UiClassFn<BaseTooltipPart> {
	const ui = useUi(props, 'base-tooltip')
	return part => (part === 'popup' ? ui(part).replace('base-tooltip__popup', 'base-tooltip-popup') : ui(part))
}

export function useBaseTooltip(props: TooltipProps) {
	const teleportTarget = useTeleportTarget()
	const standard = useStandardBaseComponent('base-tooltip-popup', props, ['root', 'tooltip', 'text'])
	const isVisible = ref(false)
	const isShown = computed(() => isVisible.value && Boolean(props.text))
	const wrapperRef = ref<HTMLElement | null>(null)
	const popupRef = ref<HTMLElement | null>(null)
	const inheritedTheme = useInheritedThemeAttrs(
		() => wrapperRef.value,
		() => isVisible.value,
	)
	const tooltipId = `rise-tooltip-${useId()}`
	const triggerAttributes = useDescribedTrigger(props, wrapperRef, { isShown, tooltipId })
	const position = useTooltipPosition(props, wrapperRef, popupRef)
	useMeasureOnShow(isShown, position.measurePopup)
	const visibility = useTooltipVisibility(props, isVisible, position)

	return {
		...standard,
		teleportTarget,
		isShown,
		wrapperRef,
		setWrapper: (element: HTMLElement | null): void => {
			wrapperRef.value = element
		},
		popupRef,
		inheritedTheme,
		tooltipId,
		triggerAttributes,
		ui: useTooltipUi(props),
		animationClass: computed(() => `base-tooltip-popup--animation-${props.animation ?? 'fade'}`),
		placement: position.placement,
		tooltipStyle: position.tooltipStyle,
		...visibility,
		handlers: {
			onMouseenter: visibility.handleEnter,
			onMouseleave: visibility.handleLeave,
			onFocusin: visibility.handleEnter,
			onFocusout: visibility.handleLeave,
		},
		describedBy: computed(() => triggerAttributes.value['aria-describedby']),
		isWrapperless: computed(() => Boolean(props.isWrapperless)),
	}
}
