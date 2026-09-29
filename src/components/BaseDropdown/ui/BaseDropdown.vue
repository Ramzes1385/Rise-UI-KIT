<template>
	<div ref="wrapperRef" class="base-dropdown" :class="classes.root">
		<slot />

		<Teleport defer :to="teleportTarget">
			<Transition name="base-dropdown">
				<div
					v-if="isOpen"
					ref="dropdownRef"
					class="base-dropdown__panel"
					:class="[panelClass, variantClass, classes.panel]"
					:style="[panelStyle, paddingStyle, sizeScaleStyle, variantStyle, customColorStyle, layerStyle]"
					:data-theme="inheritedTheme"
					@mousedown="handlePanelMousedown"
					@focusin="handlePanelFocusin">
					<slot name="dropdown" />
				</div>
			</Transition>
		</Teleport>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseDropdown.style.scss'
import { useBaseDropdown } from '../model/useBaseDropdown'
import { kitDefaults } from '@composables/base/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseDropdownEmits, BaseDropdownExpose, BaseDropdownProps, BaseDropdownSlots } from '../types/BaseDropdown.types'

const props = withDefaults(
	defineProps<BaseDropdownProps>(),
	kitDefaults('BaseDropdown', {
		variant: DEFAULT_VARIANT,
		isOpen: false,
		position: 'bottom-start',
		gap: 4,
		maxHeight: '320px',
		matchWidth: false,
		panelClass: '',
		padding: undefined,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)
const emit = defineEmits<BaseDropdownEmits>()
defineSlots<BaseDropdownSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	teleportTarget,
	wrapperRef,
	inheritedTheme,
	layerStyle,
	dropdownRef,
	panelStyle,
	paddingStyle,
	handlePanelMousedown,
	handlePanelFocusin,
	exposed,
} = useBaseDropdown(props, emit)

defineExpose<BaseDropdownExpose>(exposed)
</script>
