import { usePopup } from '@composables/usePopup'
/** Composable: логика BaseModal — закрытие, место среди слоёв, прокрутка тела и ловушка фокуса */
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
	// Тело с прокруткой получает tabindex="0": если в нём нет полей и кнопок, иначе его не прокрутить с клавиатуры
	const { isScrollable: isBodyScrollable } = useScrollableRegion({ elementRef: bodyRef })
	// Модальный режим: оверлей на весь экран перехватывает клики (в том числе прозрачный при hasOverlay=false) и блокирует
	// прокрутку. В isContained окно перекрывает только свой контейнер — диалог немодальный: без aria-modal и ловушки фокуса
	const isModal = computed(() => !props.isContained)
	useFocusTrap({ containerRef: contentRef, isActive: () => Boolean(props.isOpen) && isModal.value })

	return { contentRef, bodyRef, titleId, isBodyScrollable, isModal }
}

export function useBaseModal(props: BaseModalProps, emit: BaseModalEmits) {
	// Куда телепортируются слои: body или контейнер из плагина и BaseApp (teleportTo)
	const teleportTarget = useTeleportTarget()
	const standard = useStandardBaseComponent('base-modal', props, MODAL_ELEMENTS)
	const slots = useSlots()

	return {
		...standard,
		teleportTarget,
		hasFooter: computed(() => Boolean(slots.footer)),
		fullScreenClass: computed(() => (props.fullScreen ? `base-modal--fullscreen-${props.fullScreen}` : undefined)),
		// Место окна среди открытых слоёв: окно, открытое из поповера или другого окна, — над ними
		layerStyle: useLayerIndex(() => props.isOpen),
		...useModalClose(props, emit),
		...useModalDialog(props),
	}
}
