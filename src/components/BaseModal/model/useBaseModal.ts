import { usePopup } from '@composables/usePopup'
import { computed, ref, useId, useSlots } from 'vue'
import { useFocusTrap } from '@composables/useFocusTrap'
import { useLayerIndex } from '@composables/useLayerStack'
import { useTeleportTarget } from '@composables/useTeleportTarget'
import { useScrollableRegion } from '@composables/useScrollableRegion'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { BaseModalEmits, BaseModalProps } from '../types/BaseModal.types'

const MODAL_ELEMENTS = ['root', 'content', 'header', 'headerLeft', 'title', 'close', 'body', 'footer']

function useModalClose(props: BaseModalProps, emit: BaseModalEmits) {
	const { handleOverlayClick, close } = usePopup({
		isOpen: () => props.isOpen,
		closeOnOverlay: () => props.closeOnOverlay ?? true,
		closeOnEscape: () => true,
		lockScroll: () => !props.isContained,
		onClose: () => {
			emit('update:isOpen', false)
			emit('close')
		},
	})
	return { handleOverlayClick, handleClose: close }
}

function useModalDialog(props: BaseModalProps) {
	const contentRef = ref<HTMLElement | null>(null)
	const bodyRef = ref<HTMLElement | null>(null)
	const titleId = useId()
	const { isScrollable: isBodyScrollable } = useScrollableRegion({ elementRef: bodyRef })
	const isModal = computed(() => !props.isContained)
	useFocusTrap({ containerRef: contentRef, isActive: () => Boolean(props.isOpen) && isModal.value })

	return { contentRef, bodyRef, titleId, isBodyScrollable, isModal }
}

export function useBaseModal(props: BaseModalProps, emit: BaseModalEmits) {
	const teleportTarget = useTeleportTarget()
	const standard = useStandardBaseComponent('base-modal', props, MODAL_ELEMENTS)
	const slots = useSlots()

	return {
		...standard,
		teleportTarget,
		hasFooter: computed(() => Boolean(slots.footer)),
		fullScreenClass: computed(() => (props.fullScreen ? `base-modal--fullscreen-${props.fullScreen}` : undefined)),
		layerStyle: useLayerIndex(() => props.isOpen),
		...useModalClose(props, emit),
		...useModalDialog(props),
	}
}
