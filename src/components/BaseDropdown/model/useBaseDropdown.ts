import { computed, ref, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { getActiveElement } from '@utils/domUtils'
import { usePadding } from '@composables/usePadding'
import { useEscapeKey } from '@composables/useEscapeKey'
import { useLayerIndex } from '@composables/useLayerStack'
import { useClickOutside } from '@composables/useClickOutside'
import { useDropdownPosition } from '@composables/useDropdownPosition'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { useExplicitPropDetection } from '@composables/useExplicitPropDetection'
import { useInheritedTheme, useTeleportTarget } from '@composables/useTeleportTarget'
import type { BaseDropdownEmits, BaseDropdownExpose, DropdownProps } from '../types/BaseDropdown.types'

const TEXT_ENTRY_SELECTOR = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])'

function isTextEntryTarget(target: EventTarget | null): boolean {
	return target instanceof Element && target.closest(TEXT_ENTRY_SELECTOR) !== null
}

function useExplicitFlags(props: DropdownProps) {
	const { wasPropPassed } = useExplicitPropDetection()
	const isPassed = (name: string, kebabName: string): boolean => wasPropPassed(name) || wasPropPassed(kebabName)
	return {
		closeOnEscape: computed(() => (isPassed('closeOnEscape', 'close-on-escape') ? (props.closeOnEscape ?? true) : true)),
		preventMousedown: computed(() => (isPassed('preventMousedown', 'prevent-mousedown') ? (props.preventMousedown ?? true) : true)),
	}
}

function useFocusReturn(props: DropdownProps, dropdownRef: Ref<HTMLElement | null>): Ref<HTMLElement | null> {
	const savedActiveElement = ref<HTMLElement | null>(null)

	const restoreFocusFromPanel = (): void => {
		const target = savedActiveElement.value
		const active = document.activeElement
		if (!target || target === document.body || !target.isConnected) return
		if (!active || !dropdownRef.value?.contains(active)) return
		target.focus()
	}

	watch(
		() => props.isOpen,
		value => {
			if (value) {
				savedActiveElement.value = getActiveElement()
			} else {
				restoreFocusFromPanel()
				savedActiveElement.value = null
			}
		},
	)

	return savedActiveElement
}

function usePanelPosition(props: DropdownProps, wrapperRef: Ref<HTMLElement | null>, dropdownRef: Ref<HTMLElement | null>) {
	return useDropdownPosition({
		wrapperRef,
		dropdownRef,
		position: () => props.position,
		gap: () => props.gap,
		matchWidth: () => props.matchWidth,
		maxHeight: () => props.maxHeight,
		isOpen: () => props.isOpen,
	})
}

function useDropdownClose(
	props: DropdownProps,
	emit: BaseDropdownEmits,
	options: { targets: Ref<HTMLElement | null>[]; closeOnEscape: ComputedRef<boolean> },
): void {
	const handleClose = (): void => {
		emit('update:isOpen', false)
		emit('close')
	}
	useClickOutside({ targets: options.targets, callback: handleClose, isActive: () => props.isOpen })
	useEscapeKey({ isActive: () => props.isOpen && options.closeOnEscape.value, callback: handleClose })
}

export function useBaseDropdown(props: DropdownProps, emit: BaseDropdownEmits) {
	const teleportTarget = useTeleportTarget()
	const { closeOnEscape, preventMousedown } = useExplicitFlags(props)
	const standard = useStandardBaseComponent('base-dropdown__panel', props, ['root', 'panel'])
	const { paddingStyle } = usePadding({ getPadding: () => props.padding, prefix: '--dd-pad' })
	const wrapperRef = ref<HTMLElement | null>(null)
	const inheritedTheme = useInheritedTheme(
		() => wrapperRef.value,
		() => props.isOpen,
	)
	const layerStyle = useLayerIndex(() => props.isOpen)
	const dropdownRef = ref<HTMLElement | null>(null)
	const savedActiveElement = useFocusReturn(props, dropdownRef)
	const { panelStyle, updatePosition } = usePanelPosition(props, wrapperRef, dropdownRef)
	useDropdownClose(props, emit, { targets: [wrapperRef, dropdownRef], closeOnEscape })

	return {
		...standard,
		teleportTarget,
		wrapperRef,
		inheritedTheme,
		layerStyle,
		dropdownRef,
		panelStyle,
		paddingStyle: computed(() => (props.padding === undefined ? undefined : paddingStyle.value)),
		handlePanelMousedown(event: MouseEvent): void {
			if (preventMousedown.value && !isTextEntryTarget(event.target)) event.preventDefault()
		},
		handlePanelFocusin(event: FocusEvent): void {
			if (preventMousedown.value && savedActiveElement.value && !isTextEntryTarget(event.target)) savedActiveElement.value.focus()
		},
		exposed: { updatePosition } satisfies BaseDropdownExpose,
	}
}
