<template>
	<div
		ref="rootRef"
		:class="[ui('root'), variantClass, `base-toolbar--${orientation}`, classes.root]"
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
import { useBaseToolbar } from '../model/useBaseToolbar'
import { kitDefaults } from '@composables/base/useDefaults'
import type { BaseToolbarProps, BaseToolbarSlots } from '../types/BaseToolbar.types'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'

const props = withDefaults(
	defineProps<BaseToolbarProps>(),
	kitDefaults('BaseToolbar', {
		variant: DEFAULT_VARIANT,
		orientation: 'horizontal',
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)
defineSlots<BaseToolbarSlots>()

const { ui, sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes, rootRef, handleKeydown, handleFocusin } =
	useBaseToolbar(props)
</script>
