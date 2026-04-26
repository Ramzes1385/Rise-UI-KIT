<template>
	<div ref="wrapperRef" class="base-dropdown" :style="sizeScaleStyle">
		<slot />

		<Teleport to="body">
			<Transition name="dropdown">
				<div
					v-if="isOpen"
					ref="dropdownRef"
					class="base-dropdown__panel"
					:class="[panelClass, variantClass]"
					:style="[panelStyle, variantStyle, customColorStyle]"
					@mousedown.prevent="handlePanelMousedown">
					<slot name="dropdown" />
				</div>
			</Transition>
		</Teleport>
	</div>
</template>

<script setup lang="ts">
import { useClickOutside } from '@/shared/composables/useClickOutside'
import { useCustomColor } from '@/shared/composables/useCustomColor'
import { useDropdownPosition } from '@/shared/composables/useDropdownPosition'
import { useEscapeKey } from '@/shared/composables/useEscapeKey'
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { useVariant } from '@/shared/composables/useVariant'
import { ref } from 'vue'
import './BaseDropdown.style.scss'
import type { BaseDropdownEmits, BaseDropdownProps } from './BaseDropdown.types'

const props = withDefaults(defineProps<BaseDropdownProps>(), {
	position: 'bottom-start',
	variant: 'default',
	gap: 4,
	maxHeight: '320px',
	matchWidth: false,
	closeOnEscape: true,
	preventMousedown: true,
	panelClass: '',
	sizeScale: 100,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-dropdown__panel', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

const emit = defineEmits<BaseDropdownEmits>()

const wrapperRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)

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

/** Закрытие по клику снаружи */
useClickOutside({
	targets: [wrapperRef, dropdownRef],
	callback: () => emit('close'),
	isActive: () => props.isOpen,
})

/** Закрытие по Escape */
useEscapeKey({
	isActive: () => props.isOpen && props.closeOnEscape,
	callback: () => emit('close'),
})

/** Предотвратить mousedown внутри панели */
function handlePanelMousedown(event: MouseEvent): void {
	if (props.preventMousedown) {
		event.preventDefault()
	}
}

defineExpose({ updatePosition })
</script>
