<template>
	<span
		class="base-badge"
		:class="[variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		@click="handleClick">
		<slot>
			<BaseText class="base-badge__text" :custom-class="classes.text" tag="span" :weight="600" :size-scale="props.sizeScale">
				{{ label }}
			</BaseText>
		</slot>
	</span>
</template>

<script setup lang="ts">
import { BaseText } from '@components/BaseText'
import { useBaseComponent } from '@composables/useBaseComponent'

import '../styles/BaseBadge.style.scss'
import type { BaseBadgeEmits, BaseBadgeProps } from '../model/BaseBadge.types'

const props = withDefaults(defineProps<BaseBadgeProps>(), {
	sizeScale: 100,
})

const emit = defineEmits<BaseBadgeEmits>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useBaseComponent({
	block: 'base-badge',
	getVariant: () => props.variant,
	getSizeScale: () => props.sizeScale,
	getColor: () => props.color,
	getClass: () => props.customClass,
	elementKeys: ['root', 'text'],
})

function handleClick(): void {
	emit('click')
}
</script>
