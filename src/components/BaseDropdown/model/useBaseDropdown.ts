/** Composable: логика BaseDropdown — позиция панели, закрытие и фокус между триггером и панелью */
import { computed, ref, watch } from 'vue'
import { getActiveElement } from '@utils/domUtils'
import { usePadding } from '@composables/usePadding'
import { useEscapeKey } from '@composables/useEscapeKey'
import { useLayerIndex } from '@composables/useLayerStack'
import { useClickOutside } from '@composables/useClickOutside'
import { useDropdownPosition } from '@composables/useDropdownPosition'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { useExplicitPropDetection } from '@composables/useExplicitPropDetection'
import { useInheritedTheme, useTeleportTarget } from '@composables/useTeleportTarget'
import type { ComputedRef, Ref } from 'vue'
import type { BaseDropdownEmits, BaseDropdownExpose, DropdownProps } from '../types/BaseDropdown.types'

/** Поля ввода внутри панели (например, поиск BaseSelect) должны получать фокус — иначе в них нельзя печатать */
const TEXT_ENTRY_SELECTOR = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])'

function isTextEntryTarget(target: EventTarget | null): boolean {
	return target instanceof Element && target.closest(TEXT_ENTRY_SELECTOR) !== null
}

/** closeOnEscape и preventMousedown по умолчанию true: значение пропа действует, только если его передали явно */
function useExplicitFlags(props: DropdownProps) {
	const { wasPropPassed } = useExplicitPropDetection()
	const isPassed = (name: string, kebabName: string): boolean => wasPropPassed(name) || wasPropPassed(kebabName)
	return {
		closeOnEscape: computed(() => (isPassed('closeOnEscape', 'close-on-escape') ? (props.closeOnEscape ?? true) : true)),
		preventMousedown: computed(() => (isPassed('preventMousedown', 'prevent-mousedown') ? (props.preventMousedown ?? true) : true)),
	}
}

/** Фокус запоминается при открытии; панель, закрытая с фокусом внутри, возвращает его на элемент, с которого её открыли */
function useFocusReturn(props: DropdownProps, dropdownRef: Ref<HTMLElement | null>): Ref<HTMLElement | null> {
	const savedActiveElement = ref<HTMLElement | null>(null)

	// Без возврата браузер сбросил бы фокус на body после удаления панели. Вызывается до патча DOM (flush 'pre'),
	// пока панель ещё отрендерена
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
	// Куда телепортируются слои: body или контейнер из плагина и BaseApp (teleportTo)
	const teleportTarget = useTeleportTarget()
	const { closeOnEscape, preventMousedown } = useExplicitFlags(props)
	const standard = useStandardBaseComponent('base-dropdown__panel', props, ['root', 'panel'])
	const { paddingStyle } = usePadding({ getPadding: () => props.padding, prefix: '--dd-pad' })
	const wrapperRef = ref<HTMLElement | null>(null)
	// Тема блока, в котором стоит триггер: панель в body иначе взяла бы тему страницы
	const inheritedTheme = useInheritedTheme(
		() => wrapperRef.value,
		() => props.isOpen,
	)
	// Место панели среди открытых слоёв: список в окне — над окном, окно из поповера — над поповером
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
		// Без пропа padding отступ панели берётся из стилей (4px со всех сторон), inline-переменные не пишутся
		paddingStyle: computed(() => (props.padding === undefined ? undefined : paddingStyle.value)),
		/** Mousedown внутри панели не уводит фокус с триггера; поля ввода — исключение */
		handlePanelMousedown(event: MouseEvent): void {
			if (preventMousedown.value && !isTextEntryTarget(event.target)) event.preventDefault()
		},
		/** Фокус внутри панели возвращается на триггер; поля ввода — исключение */
		handlePanelFocusin(event: FocusEvent): void {
			if (preventMousedown.value && savedActiveElement.value && !isTextEntryTarget(event.target)) savedActiveElement.value.focus()
		},
		exposed: { updatePosition } satisfies BaseDropdownExpose,
	}
}
