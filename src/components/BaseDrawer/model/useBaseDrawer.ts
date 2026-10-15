import type { Ref } from 'vue'
import { useUi } from '@composables/base/useUi'
import { usePopup } from '@composables/overlay/usePopup'
import { computed, ref, useId, useSlots, watch } from 'vue'
import { useLayerIndex } from '@composables/app/useLayerStack'
import { useFocusTrap } from '@composables/overlay/useFocusTrap'
import type { BaseDrawerEmits, DrawerProps } from '../types/BaseDrawer.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { useScrollableRegion } from '@composables/interaction/useScrollableRegion'
import { useOwnThemeAttrs, useTeleportTarget } from '@composables/app/useTeleportTarget'

const CLOSE_RATIO = 0.25
const DRAWER_ELEMENTS = ['root', 'panel', 'handle', 'header', 'title', 'body', 'footer']

function isDragHandle(target: HTMLElement): boolean {
	return Boolean(target.closest('.base-drawer__handle, .base-drawer__header')) && !target.closest('button, a, input, select, textarea')
}

function useDrawerClose(props: DrawerProps, emit: BaseDrawerEmits) {
	const { handleOverlayClick, handleOverlayPointerdown, close } = usePopup({
		isOpen: () => props.isOpen,
		closeOnOverlay: () => props.closeOnOverlay,
		closeOnEscape: () => props.closeOnEscape,
		onClose: () => {
			emit('update:isOpen', false)
			emit('close')
		},
	})
	return { handleOverlayClick, handleOverlayPointerdown, handleClose: close }
}

function useDragOffset(props: DrawerProps) {
	const isVertical = computed(() => props.direction === 'bottom' || props.direction === 'top')
	const closeSign = computed(() => (props.direction === 'bottom' || props.direction === 'right' ? 1 : -1))
	const isDragging = ref(false)
	const dragOffset = ref(0)
	const isDismissing = ref(false)

	return {
		isVertical,
		closeSign,
		isDragging,
		dragOffset,
		isDismissing,
		dragStyle: computed(() => {
			const offset = (value: string) => (isVertical.value ? `0 ${value}` : `${value} 0`)
			if (isDismissing.value) return { translate: offset(`${closeSign.value * 100}%`) }
			if (!isDragging.value) return undefined
			return { translate: offset(`${closeSign.value * dragOffset.value}px`), transition: 'none' }
		}),
		resetDrag(): void {
			isDragging.value = false
			dragOffset.value = 0
		},
	}
}

function useDrawerDrag(props: DrawerProps, panelRef: Ref<HTMLElement | null>, onDismiss: () => void) {
	const drag = useDragOffset(props)
	let dragStart = 0
	const pointerPosition = (event: PointerEvent): number => (drag.isVertical.value ? event.clientY : event.clientX)

	watch(
		() => props.isOpen,
		() => {
			drag.isDismissing.value = false
		},
	)

	return {
		isDragging: drag.isDragging,
		dragStyle: drag.dragStyle,
		resetDrag: drag.resetDrag,
		handlePointerdown(event: PointerEvent): void {
			if (!props.isDraggable || event.button !== 0 || !isDragHandle(event.target as HTMLElement)) return
			panelRef.value?.setPointerCapture?.(event.pointerId)
			dragStart = pointerPosition(event)
			drag.dragOffset.value = 0
			drag.isDragging.value = true
		},
		handlePointermove(event: PointerEvent): void {
			if (!drag.isDragging.value) return
			drag.dragOffset.value = Math.max(0, (pointerPosition(event) - dragStart) * drag.closeSign.value)
		},
		handlePointerup(): void {
			if (!drag.isDragging.value) return
			const panel = panelRef.value as HTMLElement
			const size = drag.isVertical.value ? panel.offsetHeight : panel.offsetWidth
			const shouldClose = drag.dragOffset.value > size * CLOSE_RATIO
			drag.resetDrag()
			if (!shouldClose) return
			drag.isDismissing.value = true
			onDismiss()
		},
	}
}

export function useBaseDrawer(props: DrawerProps, emit: BaseDrawerEmits) {
	const slots = useSlots()
	const standard = useStandardBaseComponent('base-drawer', props, DRAWER_ELEMENTS)
	const teleportTarget = useTeleportTarget()
	const layerStyle = useLayerIndex(() => props.isOpen)
	const titleId = useId()
	const descriptionId = useId()
	const close = useDrawerClose(props, emit)
	const panelRef = ref<HTMLElement | null>(null)
	const bodyRef = ref<HTMLElement | null>(null)
	useFocusTrap({ containerRef: panelRef, isActive: () => props.isOpen })
	const { isScrollable: isBodyScrollable } = useScrollableRegion({ elementRef: bodyRef })

	return {
		...standard,
		slots,
		teleportTarget,
		layerStyle,
		ui: useUi(props, 'base-drawer'),
		animationClass: computed(() => `base-drawer--animation-${props.animation ?? 'slide'}`),
		themeAttrs: useOwnThemeAttrs(() => props.isOpen),
		titleId,
		descriptionId,
		hasHeader: computed(() => Boolean(slots.header) || Boolean(props.title)),
		hasDefaultTitle: computed(() => Boolean(props.title) && !slots.header),
		...close,
		panelRef,
		bodyRef,
		isBodyScrollable,
		...useDrawerDrag(props, panelRef, close.handleClose),
	}
}
