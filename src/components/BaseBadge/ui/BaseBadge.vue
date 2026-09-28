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
import { kitDefaults } from '@composables/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT, useStandardBaseComponent } from '@composables/useBaseComponent'
import '../styles/BaseBadge.style.scss'
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

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-badge', props, [
	'root',
	'text',
])

function handleClick(e: MouseEvent): void {
	emit('click', e)
}
</script>
