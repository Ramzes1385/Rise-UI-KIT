<template>
	<div ref="wrapperRef" class="base-dropdown" :class="classes.root">
		<slot />

		<Teleport to="body">
			<Transition name="dropdown">
				<div
					v-if="isOpen"
					ref="dropdownRef"
					class="base-dropdown__panel"
					:class="[panelClass, variantClass, classes.panel]"
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
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useDropdownPosition } from '@composables/useDropdownPosition'
import { useEscapeKey } from '@composables/useEscapeKey'
import { usePadding } from '@composables/usePadding'
import { useSizeScale } from '@composables/useSizeScale'
import { useVariant } from '@composables/useVariant'
import { ref, watch } from 'vue'
import './BaseDropdown.style.scss'
import type { BaseDropdownEmits, BaseDropdownProps } from './BaseDropdown.types'

const props = withDefaults(defineProps<BaseDropdownProps>(), {
	isOpen: false,
	position: 'bottom-start',
	variant: 'default',
	gap: 4,
	maxHeight: '320px',
	matchWidth: false,
	closeOnEscape: true,
	preventMousedown: true,
	panelClass: '',
	padding: 8,
	sizeScale: 100,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-dropdown__panel', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })
const { classes } = useCustomClass({
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
	isActive: () => props.isOpen && props.closeOnEscape,
	callback: handleClose,
})

/** Предотвратить mousedown внутри панели */
function handlePanelMousedown(event: MouseEvent): void {
	if (props.preventMousedown) {
		event.preventDefault()
	}
}

/** Вернуть фокус на триггер при фокусе внутри панели */
function handlePanelFocusin(): void {
	if (props.preventMousedown && savedActiveElement.value) {
		savedActiveElement.value.focus()
	}
}

defineExpose({ updatePosition })
</script>
