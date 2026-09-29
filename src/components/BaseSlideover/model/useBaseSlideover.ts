import type { ComputedRef } from 'vue'
import { computed, ref, useId, useSlots } from 'vue'
import { usePopup } from '@composables/overlay/usePopup'
import { usePadding } from '@composables/base/usePadding'
import { useLayerIndex } from '@composables/app/useLayerStack'
import { useFocusTrap } from '@composables/overlay/useFocusTrap'
import { useTeleportTarget } from '@composables/app/useTeleportTarget'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { useScrollableRegion } from '@composables/interaction/useScrollableRegion'
import type { BaseSlideoverEmits, SlideoverProps } from '../types/BaseSlideover.types'

const SLIDEOVER_ELEMENTS = ['root', 'panel', 'header', 'title', 'body', 'footer']

function useSlideoverLayout(props: SlideoverProps) {
	const appTeleportTarget = useTeleportTarget()
	const { paddingStyle } = usePadding({
		getPadding: () => props.padding,
		prefix: '--slideover-pad',
		axisMultiplier: 1,
		omitUnsetSides: true,
	})

	return {
		widthStyle: computed(() =>
			props.isFullWidth || props.width === 100 ? undefined : { '--slideover-width-scale': String(props.width / 100) },
		),
		isContainedMode: computed(() => props.isContained || !!props.container),
		teleportTarget: computed<string | HTMLElement>(() => props.container ?? appTeleportTarget),
		isTeleportDisabled: computed(() => !props.container && props.isContained),
		panelStyle: computed(() => (props.padding === undefined ? undefined : paddingStyle.value)),
	}
}

function useSlideoverSections(props: SlideoverProps) {
	const slots = useSlots()
	return {
		hasHeader: computed(() => Boolean(slots.header) || Boolean(props.title)),
		hasFooter: computed(() => Boolean(slots.footer)),
		hasDefaultTitle: computed(() => Boolean(props.title) && !slots.header),
	}
}

function useSlideoverClose(props: SlideoverProps, emit: BaseSlideoverEmits, isContainedMode: ComputedRef<boolean>) {
	const { handleOverlayClick, close } = usePopup({
		isOpen: () => props.isOpen,
		closeOnOverlay: () => props.closeOnOverlay,
		closeOnEscape: () => props.closeOnEscape,
		lockScroll: () => !isContainedMode.value,
		onClose: () => {
			emit('update:isOpen', false)
			emit('close')
		},
	})
	return { handleOverlayClick, handleClose: close }
}

function useSlideoverDialog(props: SlideoverProps, isContainedMode: ComputedRef<boolean>) {
	const panelRef = ref<HTMLElement | null>(null)
	const bodyRef = ref<HTMLElement | null>(null)
	const titleId = useId()
	const { isScrollable: isBodyScrollable } = useScrollableRegion({ elementRef: bodyRef })
	const isModal = computed(() => !isContainedMode.value)
	useFocusTrap({ containerRef: panelRef, isActive: () => props.isOpen && isModal.value })

	return { panelRef, bodyRef, titleId, isBodyScrollable, isModal }
}

export function useBaseSlideover(props: SlideoverProps, emit: BaseSlideoverEmits) {
	const standard = useStandardBaseComponent('base-slideover', props, SLIDEOVER_ELEMENTS)
	const layout = useSlideoverLayout(props)

	return {
		...standard,
		...layout,
		...useSlideoverSections(props),
		layerStyle: useLayerIndex(() => props.isOpen),
		...useSlideoverClose(props, emit, layout.isContainedMode),
		...useSlideoverDialog(props, layout.isContainedMode),
	}
}
