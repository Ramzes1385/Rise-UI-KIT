<template>
	<div ref="wrapperRef" class="base-dropdown" :class="classes.root">
		<slot />

		<Teleport to="body">
			<Transition name="dropdown">
				<div
					v-if="props.isOpen"
					ref="dropdownRef"
					class="base-dropdown__panel"
					:class="[props.panelClass, variantClass, classes.panel]"
					:style="[panelStyle, paddingStyle, sizeScaleStyle, variantStyle, customColorStyle]"
					@mousedown="handlePanelMousedown"
					@focusin="handlePanelFocusin">
					<slot name="dropdown" />
				</div>
			</Transition>
		</Teleport>
	</div>
</template>

<script setup lang="ts">
import { useClickOutside } from '@composables/useClickOutside'
import { useBaseComponent } from '@composables/useBaseComponent'
import { useDropdownPosition } from '@composables/useDropdownPosition'
import { useEscapeKey } from '@composables/useEscapeKey'
import { UI_PANEL_MAX_HEIGHT } from '@constants'
import { usePadding } from '@composables/usePadding'
import { computed, ref, watch } from 'vue'
import { useExplicitPropDetection } from '@composables/useExplicitPropDetection'
import '../styles/BaseDropdown.style.scss'
import type { BaseDropdownEmits, BaseDropdownProps } from '../model/BaseDropdown.types'

const props = withDefaults(defineProps<BaseDropdownProps>(), {
	isOpen: false,
	position: 'bottom-start',
	gap: 4,
	maxHeight: UI_PANEL_MAX_HEIGHT,
	matchWidth: false,
	panelClass: '',
	padding: 8,
	sizeScale: 100,
})
const { wasPropPassed } = useExplicitPropDetection()

const closeOnEscape = computed(() =>
	wasPropPassed('closeOnEscape') || wasPropPassed('close-on-escape') ? (props.closeOnEscape ?? true) : true,
)
const preventMousedown = computed(() =>
	wasPropPassed('preventMousedown') || wasPropPassed('prevent-mousedown')
		? (props.preventMousedown ?? true)
		: true,
)
const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useBaseComponent({
	block: 'base-dropdown__panel',
	getVariant: () => props.variant,
	getSizeScale: () => props.sizeScale,
	getColor: () => props.color,
	getClass: () => props.customClass,
	elementKeys: ['root', 'panel'],
})
const { paddingStyle } = usePadding({ getPadding: () => props.padding, prefix: '--dd-pad', defaultPadding: 8 })

const emit = defineEmits<BaseDropdownEmits>()

const wrapperRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)

/** Элемент с фокусом до открытия панели */
const savedActiveElement = ref<HTMLElement | null>(null)

/** Сохранение активного элемента при открытии */
watch(
	() => props.isOpen,
	value => {
		if (value) {
			savedActiveElement.value = document.activeElement as HTMLElement
		} else {
			savedActiveElement.value = null
		}
	},
)

/** Позиционирование выпадающей панели */
const { panelStyle, updatePosition } = useDropdownPosition({
	wrapperRef,
	dropdownRef,
	position: () => props.position,
	gap: () => props.gap,
	matchWidth: () => props.matchWidth,
	maxHeight: () => props.maxHeight,
	isOpen: () => props.isOpen,
})

/** Закрытие дропдауна: эмитит update:isOpen и close */
function handleClose(): void {
	emit('update:isOpen', false)
	emit('close')
}

/** Закрытие по клику снаружи */
useClickOutside({
	targets: [wrapperRef, dropdownRef],
	callback: handleClose,
	isActive: () => props.isOpen,
})

/** Закрытие по Escape */
useEscapeKey({
	isActive: () => props.isOpen && closeOnEscape.value,
	callback: handleClose,
})

/** Предотвратить mousedown внутри панели */
function handlePanelMousedown(event: MouseEvent): void {
	if (preventMousedown.value) {
		event.preventDefault()
	}
}

/** Вернуть фокус на триггер при фокусе внутри панели */
function handlePanelFocusin(): void {
	if (preventMousedown.value && savedActiveElement.value) {
		savedActiveElement.value.focus()
	}
}

defineExpose({ updatePosition })
</script>
