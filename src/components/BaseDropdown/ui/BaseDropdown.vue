<template>
	<div ref="wrapperRef" :class="[ui('root'), classes.root]">
		<slot />

		<Teleport defer :to="teleportTarget">
			<Transition name="base-dropdown">
				<div
					v-if="isOpen"
					ref="dropdownRef"
					:class="[ui('panel'), animationClass, sideClass, panelClass, variantClass, arrowPanelClass, classes.panel]"
					:style="[panelStyle, paddingStyle, sizeScaleStyle, variantStyle, customColorStyle, layerStyle]"
					v-bind="inheritedTheme"
					@mousedown="handlePanelMousedown"
					@focusin="handlePanelFocusin"
					@keydown="handlePanelKeydown">
					<span v-if="showArrow" :class="[ui('arrow'), classes.arrow]" aria-hidden="true" />
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
		showArrow: false,
		trapFocus: false,
		sizeScale: SIZE_SCALE_DEFAULT,
		animation: 'scale',
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
	arrowPanelClass,
	paddingStyle,
	handlePanelMousedown,
	handlePanelFocusin,
	handlePanelKeydown,
	exposed,
	ui,
	animationClass,
	sideClass,
} = useBaseDropdown(props, emit)

defineExpose<BaseDropdownExpose>(exposed)
</script>
