<template>
	<div
		ref="rootRef"
		class="base-toolbar"
		:class="[variantClass, `base-toolbar--${orientation}`, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		role="toolbar"
		:aria-label="ariaLabel"
		:aria-orientation="orientation"
		@keydown="handleKeydown"
		@focusin="handleFocusin">
		<slot />
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseToolbar.style.scss'
import { kitDefaults } from '@composables/useDefaults'
import { useBaseToolbar } from '../model/useBaseToolbar'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import type { BaseToolbarProps, BaseToolbarSlots } from '../types/BaseToolbar.types'

const props = withDefaults(
	defineProps<BaseToolbarProps>(),
	kitDefaults('BaseToolbar', {
		variant: DEFAULT_VARIANT,
		orientation: 'horizontal',
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)
defineSlots<BaseToolbarSlots>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes, rootRef, handleKeydown, handleFocusin } =
	useBaseToolbar(props)
</script>
