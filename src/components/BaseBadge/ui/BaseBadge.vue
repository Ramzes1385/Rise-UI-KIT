<template>
	<span
		class="base-badge"
		:class="[variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		@click="handleClick">
		<slot>
			<span class="base-badge__text" :class="classes.text">{{ label }}</span>
		</slot>
	</span>
</template>

<script setup lang="ts">
import '../styles/BaseBadge.style.scss'
import { useBaseBadge } from '../model/useBaseBadge'
import { kitDefaults } from '@composables/base/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseBadgeEmits, BaseBadgeProps, BaseBadgeSlots } from '../types/BaseBadge.types'

const props = withDefaults(
	defineProps<BaseBadgeProps>(),
	kitDefaults('BaseBadge', {
		variant: DEFAULT_VARIANT,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseBadgeEmits>()
defineSlots<BaseBadgeSlots>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes, handleClick } = useBaseBadge(props, emit)
</script>
